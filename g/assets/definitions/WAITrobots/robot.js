var variables,functions,updateSome,userObject,getStandardAngle,AI; //stupid warnings
function robot(){
    return updateSome(new userObject, {
        class: 'robot',
        appearance: {
            sizeScale: {
                2: 1 * variables.sizeScale,
            }
        },
        gamePlay: {
            maxHP: 4000,
            rotateSpeed: 4,
            speed: 8,
            damageMultiplier: 0.5,
            weaponKeywords: ['GrenadeLauncher'],
            robotValue: 1,
            respawnWait: 125, //200
            spawns: [],
            maxShields: 500,
            shieldRegen: 3,
            attackRange: 500,
            lastRespawn: 0,
            shieldBurnOut: 200, //400
            buttonMapping: {
                cw: false,
                dn: false,
                fi: false,
                lt: false,
                rt: false,
                sb: false,
                ss: false,
                up: false,
                sl: false,
                sr: false,
            },
        },
        minimalToRender: false,
        physics: {
            mass: 250,
        },
        user: {
            level: 1, //use this to upgrade robot
            availableToPublic: false,
            username: 'Temporary Battle Prototype',
            publicProfileImg: '/g/assets/images/robots/profilePic.jpg',
        },
        ai: {
            stateStack: ['attack'],
            currentState: function(){
                var ai = AI.user.me.ai;
                return ai.stateStack[ai.stateStack.length - 1];
            },
            addState: function(state){
                var ai = AI.user.me.ai;
                ai.stateStack.push(state);
                return ai;
            },
            removeState: function(){
                var ai = AI.user.me.ai;
                if(false &&ai.stateStack.length === 1){
                    console.warn("Tried to remove the last stackState:",ai.stateStack);
                    return ai;
                }
                ai.stateStack.pop();
                return ai;
            },
            changeState: function(newState){
                return AI.user.me.ai.removeState().addState(newState);
            },
        },
        die: function(){
            var c = AI.count,
                g = this.gamePlay;

            //remove our count
            c[this.name]--;
            c.total--;
            c.totalValue -= g.robotValue;

            //delete & erase
            this.erase();
            delete variables.interactingObjects[this.uid];

            //win message
            if(c.total === 0)         AI.win();
            else if(c.total <= 0)   console.warn("Robot counting error!");
            else                    functions.userMessage("UUggggg! You beat me.</br><b>Good Job!</b>",'success');
        },
        gameCycle: function(){
            //update the user section
            AI.user.get(this);

            var currentState = this.ai.currentState();

            //update the log
            AI.user.stateLog.innerHTML += (this.user.username || this.name) + ": <b>" + currentState + "</b></br>";

            //calls the standard from AI
            if(AI.states[currentState])
                //allow for some states that wont be reused
                AI.states[currentState]();

            //then run our state
            //force me to have the state in the this.ai.states for readability
            this.ai.states[currentState]();

            //apply changes
            updateSome(this,AI.user.me);
            //this is required because updateSome wont delete things. including stakeStates
            this.ai.stateStack = AI.user.me.ai.stateStack; //hack -> I HATE this

            //act on adjustments
            this.applyGameLogic();

            //reset buttons
            var bt = this.gamePlay.buttonMapping;
            for(var i in bt) bt[i] = false;
        },
        isPressed: function(code,timeStamp){
            //jump through hoops for the users
            if(timeStamp) return variables.timeStamp;
            return this.gamePlay.buttonMapping[code];
        },
        changeWeapon: function(){
            var g = this.gamePlay,
                w = g.weapons,
                wg = w[0].gamePlay;

            g.weapons.move(0,-1);
            wg.cooldown = wg.rateOfFire;
        },
        collideWith: function(otherOBJ){
            var movement = [this.gamePlay.speed / this.physics.mass],
                pos = this.appearance.position,
                thatPos = otherOBJ.appearance.position,
                thatg = otherOBJ.gamePlay;

            switch(otherOBJ.class){
                case 'projectile':
                    this.takeDamage(otherOBJ.gamePlay.damage);
                    break;
                case 'userObject':
                    //damage computations
                    this.takeDamage(thatg.HP * thatg.damageMultiplier / variables.reduceRammingDmg);
                case 'robot':
                    //friendly hello

                    //move away from the collision
                    movement[1] = getStandardAngle(pos[0],pos[1],thatPos[0],thatPos[1]).toRadians();
                    movement = movement.toCartesian();

                    //actually move
                    this.physics.velocity[0] += movement[0];
                    this.physics.velocity[1] += movement[1];
                    break;
                default:
                    console.warn(otherOBJ.class,"unknown class of other object");
            }
        },
        spawn: function(){
            var g = this.gamePlay,
                v = variables,
                c = AI.count,
                what = g.spawns[rand(0,g.spawns.length)];

            //if i dont spawn anything, dont waste any time
            //and, wait a period of time each time
            if(g.spawns.length === 0)                           return;
            if(v.timeStamp - g.lastRespawn < g.respawnWait)     return;
                    //TODO: change this based on what spawned last

            //reset the respawn wait
            g.lastRespawn = v.timeStamp;
            
            //go! place the other robot right on top of us
            var robot = functions.objectFactory(what, {appearance: { position:this.appearance.position }});

            //dont save it if it exceeds the game limit
            if(c.totalValue + robot.gamePlay.robotValue > AI.config.maxValue)
                return;

            robot.save();
        },
        save: function(){
            variables.interactingObjects[this.uid] = this;
        },
        onCompleteConstruction: function(){
            //we need to construct the weapons
            var g = this.gamePlay,
                wKeys = g.weaponKeywords,
                c = AI.count;

            g.weapons = [];
            for(var i in wKeys)
                if(isNaN(parseInt(i,10)) === false)
                    g.weapons[i] = functions.objectFactory(wKeys[i]);

            //completely fill the health and shield bars
            g.HP = g.maxHP;
            g.shields = g.maxShields;

            //record a count and value of the robots
            if(!c[this.name])
                c[this.name] = 0;

            c[this.name]++;
            c.total++;
            c.totalValue += g.robotValue;
        },
    });
}