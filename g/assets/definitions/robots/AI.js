var variables,stopListeningToObjectsRef,$,authObject,functions;
var AI = {
    user: {
        stateLog: document.getElementById('stateLog'),
        breakDown: function(r,v,realValue){
            return {
                isMassive:  v > r.high,
                isHigh:     r.high >= v && v > r.medium,
                isMedium:   r.medium >= v && v > r.low,
                isLow:      r.low >= v,
                value:      realValue || v,
            };
        },
        get: function(me){
            var v = variables,
                config = AI.config,
                u = AI.user,
                r = config.ranges,
                ap = me.appearance, //me vars
                pos = ap.position,
                g = me.gamePlay,
                uobj = v.interactingObjects[v.activeUser], //user vars
                upos = uobj.appearance.position,
                ug = uobj.gamePlay,
                angleToUser = (getStandardAngle(pos[0],pos[1],upos[0],upos[1]) - 180),
                angleToGetThere = ap.rotate - angleToUser;

            //*** can't use updateSome because it wont delete the extra stack states ****
            // u.user = uobj;
            u.me = me;
            u.userHP =                  this.breakDown(r.health,    ug.HP / ug.maxHP * 100);
            u.userShields =             this.breakDown(r.health,    ug.shields / ug.maxShields * 100);
            u.myHP =                    this.breakDown(r.health,    g.HP / g.maxHP * 100);
            u.myShields =               this.breakDown(r.health,    g.shields / g.maxShields * 100);
            u.distanceToUser =          this.breakDown(r.distance,  getDistance(pos[0],pos[1],upos[0],upos[1]));

            u.angleToUser =             this.breakDown(r.angle,     angleToUser.cleanAngle(),               angleToUser);
            u.angleToGetThere =         this.breakDown(r.angle,     angleToGetThere.cleanAngle(),           angleToGetThere);

            u.angleAwayFromUser =       this.breakDown(r.angle,     (angleToUser + 180).cleanAngle(),       (angleToUser + 180));
            u.angleToGetAwayFromUser =  this.breakDown(r.angle,     (angleToGetThere - 180).cleanAngle(),   (angleToGetThere - 180));

            return AI.user;
        },
    },
    states: {
        //general states that are called on any robot anytime it is in the state
        attack: function(){
            //move to attacking distance and fire
            var me = AI.user.me,
                g = me.gamePlay;

            function FACEnFIRE(){
                AI.steering.faceUser(
                    function(){ g.buttonMapping.fi = true; }
                );
            }

            AI.steering.toDistance(g.attackRange,FACEnFIRE);
        },
        regen: function(){
            //move to the back to regen
            AI.steering.toDistance('high');
        },
        kamakazi: function(){
            //count my blessings and run into the user
            function move(){ AI.user.me.gamePlay.buttonMapping.up = true; }
            AI.steering.faceUser(move,move);
        },
        spawn: function(){
            //sit in the back and get some friends
            AI.steering.toDistance('high',function(){
                //world limits
                if(AI.count.total >= AI.config.maxRobots)           return;
                if(AI.count.totalValue >= AI.config.maxValue)       return;

                //*** work ***
                //move into the robots
                var robots = ['Sentry','MiniCruiser','Destroyer'];
                AI.user.me.spawn(robots[rand(0,robots.length)]);
            });
        },
        wander: function(){
            if(AI.user.distanceToUser.isLow)        AI.steering.flee();
            else                                    AI.steering.wander();
        },
        flee: function(){
            //RUN!
            //turn around and run
            AI.steering.flee();
        },
        seek: function(){
            AI.steering.seek();
        },
        nimble: function(){
            //use the new strifing to avoid bullets
        },
    },
    steering: {
        //steering methods
        faceUser: function(){
            //arguments
            var args = arrayifyArguments(arguments);
            if(typeof args[0] !== 'number')
                args.splice(0,0,0); //add '0' to the beggining

            var u = AI.user,
                bt = u.me.gamePlay.buttonMapping,
                desiredAngle = (u.angleToGetThere.value + args[0]).cleanAngle(),
                a = u.breakDown(AI.config.ranges.angle, desiredAngle, desiredAngle.steeringAngle()); //this is the key


            //aims to be close to the angle that is 'angle' degrees from the angle to the user

            if(a.isLow){
                if(args[1])         args[1]();
            }else{
                if(a.value > 0)     bt.lt = true;
                else                bt.rt = true;

                if(a.isMedium)
                    //fine tune the rotating!
                    if(args[2])     args[2]();
                else
                    if(args[3])     args[3]();
            }
        },
        facePoint: function(){
            //arguments
            var args = arrayifyArguments(arguments);
            if(typeof args[0] === 'number'){
                //if they give is as func(x,y,func1,func2),
                    //condense as func([x,y],func1)
                args.splice(0,2,[args[0],args[1]]);
            }

            var x = args[0][0],
                y = args[0][1],
                u = AI.user,
                bt = u.me.gamePlay.buttonMapping,
                ap = u.me.appearance,
                pos = ap.position,
                angleToPoint = (getStandardAngle(pos[0],pos[1],x,y) - 180).cleanAngle(),
                angleToGetThere = (ap.rotate - angleToPoint).cleanAngle(),
                a = u.breakDown(AI.config.ranges.angle, angleToGetThere, angleToGetThere.steeringAngle()); //this is the key


            //aims to be close to the angle that is formed between the robot and the point

            if(a.isLow){
                if(args[1])         args[1]();
            }else{
                if(a.value > 0)     bt.lt = true;
                else                bt.rt = true;

                if(a.isMedium)
                    //fine tune the rotating!
                    if(args[2])     args[2]();
                else
                    if(args[3])     args[3]();
            }
        },
        toDistance: function(){
            /* takes
                @param target:  optional (required if direct is true) default: 0
                            number: indicating the maximum range
                            object: with min andor max values for the range
                            string: low | medium | high | massive that will use the AI.config values as the range
                                to match isLow | isMedium | isHigh | isMassive
                @param direct: optional default: false
                            boolean: when closer, should we turn around and go forward or face the user and move back
                @param onArrival: optional default: nothing
                            function: called when we are in the range
            */
            var args = arrayifyArguments(arguments),
                u = AI.user,
                bt = u.me.gamePlay.buttonMapping,
                d = u.distanceToUser.value,
                dst = AI.config.ranges.distance,
                tol = dst.tolerance,
                c = {
                    min: 0,
                    max: Infinity,
                };

            //arguments --> fit the specc
            if(typeof args[1] === 'function')           args.splice(1,0,false);
            else if(typeof args[0] === 'function')      args.splice(0,0,0,false);

            if(typeof args[0] === 'number')
                c.max = args[0]; //assume that it is the max value
            else if(typeof args[0] === 'string'){
                //this is going to get messy. Actually, no. I work out well
                var progressive = ['low','medium','high','massive'];
                var myPos = progressive.indexOf(args[0]);
                if(myPos !== progressive.length - 1)    c.max = dst[progressive[myPos]];
                if(myPos !== 0)                         c.min = dst[progressive[myPos - 1]];
            }else
                updateSome(c,args[0]);


            function backup(){ bt.dn = true; }
            function move(){ bt.up = true; }

            //were too far, too close or just right
            if(d > c.max + tol)             this.faceUser(move,move);
            else if(d < c.min - tol)
                if(args[1])                 this.faceUser(180,move,move);
                else                        this.faceUser(backup,backup);
            else                            if(args[2]) args[2]();
        },
        toPoint: function(){
            /*
                operates the same as toDistance except that it targets a point instead of the user,
                syntaxes:
                toPoint([x,y],targetDist,onArrival)
                toPoint(x,y,targetDist,onArrival);

                ** x & y are required, in either form...
            */
            //arguments
            var args = arrayifyArguments(arguments);
            if(typeof args[0] === 'number'){
                //if they give is as func(x,y,func1...),
                    //condense as func([x,y],func1...)
                args.splice(0,2,[args[0],args[1]]);
            }

            var u = AI.user,
                pos = u.me.appearance.position,
                bt = u.me.gamePlay.buttonMapping,
                d = getDistance(pos[0],pos[1],args[0][0],args[0][1]),
                dst = AI.config.ranges.distance,
                tol = dst.tolerance,
                c = {
                    min: 0,
                    max: Infinity,
                };

            //arguments --> fit the specc
            if(typeof args[2] === 'function')           args.splice(2,0,false);
            else if(typeof args[1] === 'function')      args.splice(1,0,0,false);

            //func([x,y],targetDist,onArrival)

            if(typeof args[1] === 'number')
                c.max = args[1]; //assume that it is the max value
            else if(typeof args[1] === 'string'){
                //this is going to get messy. Actually, no. I work out well
                var progressive = ['low','medium','high','massive'];
                var myPos = progressive.indexOf(args[1]);
                if(myPos !== progressive.length - 1)    c.max = dst[progressive[myPos]];
                if(myPos !== 0)                         c.min = dst[progressive[myPos - 1]];
            }else
                updateSome(c,args[1]);


            function backup(){ bt.dn = true; }
            function move(){ bt.up = true; }

            //were too far, too close or just right
            if(d > c.max + tol)             this.facePoint(args[0],move,move);
            else if(d < c.min - tol)
                if(args[2])                 this.facePoint(args[0],180,move,move);
                else                        this.facePoint(args[0],backup,backup);
            else                            if(args[3]) args[3]();

        },
        flee: function(){
            //back away from the user until 'far' away

            this.toDistance('high',true);
        },
        seek: function(x,y){
            //seek a point
            this.toPoint([x,y],0);
        },
        wander: function(){
            var me = AI.user.me,
                g = me.gamePlay,
                w = g.wander,
                v = variables,
                cw = v.canvas.width,
                ch = v.canvas.height;

            function calculate(){
                g.wander = {
                    destination: [rand(0,cw),rand(0,ch)],
                };
                w = g.wander;
            }

            if(!w) calculate();

            this.toPoint(w.destination,'low',calculate);
        },
    },
    config: {
        ranges: {
            angle: {
                low: 6,
                medium: 17,
                high: 45,
            },
            distance: {
                //re configure
                low: 400,
                medium: 850,
                high: 1700,
                tolerance: 50,
            },
            health: {
                low: 40,
                medium: 70,
                high: 97,
            },
        },
        maxRobots: 10,
        maxValue: 50,
        maxSpawnDistance: 60, //from the spawner
    },
    count: {
        total: 0,
        totalValue: 0,
    },
    win: function(){
        //the user won
        $('#winner').show().delay(3000).fadeOut('slow');
    },
    enterSinglePlayerMode:function(){
		//enter solitary mode
		stopListeningToObjectsRef();

        //delete to other users
		var obj,toDelete=false;
		for(var i in variables.interactingObjects){
			obj = variables.interactingObjects[i];
			if(obj.class !== 'userObject')
				toDelete = true;
			if(!toDelete && !obj.isOwner())
				toDelete = true;

			if(toDelete){
				delete variables.interactingObjects[i];
				toDelete = false;
			}
		}

		//decrease our shield burnout & incrase shield regen
		var me = variables.interactingObjects[variables.activeUser];
		me.gamePlay.shieldBurnOut /= 2;
		me.gamePlay.shieldRegen *= 2;

		//update some variables
		variables.singlePlayerMode = true;
		//these have to be set now, because before the page has not loaded yet
		AI.user.stateLog = document.getElementById('stateLog');
		AI.count.lastRespawn = variables.timeStamp;

		if(authObject.isOwnerLoggedIn())
		    AI.user.stateLog.style.display = 'block';

		//load some more resources: win font (font for winning)
		$('head').append('<link href="https://fonts.googleapis.com/css?family=Righteous" rel="stylesheet">');

		//send a message
		functions.userMessage("You are now in single player mode. "
			+ "Your actions are not shared and you wont see other peoples actions.</br>"
			+ "To play with other people, just <b>reload your window</b>.</br>"
			+ "Enjoy the AI!",'success');
	},
};