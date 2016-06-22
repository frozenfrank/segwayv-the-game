//functions that are used, but not broad enought to put in the helper.js
var variables,$; //just for the stupid warnings
var functions = {
	renderObject:function(appearanceObj,toErase){
			/*
			Rendering: all rendering shapes have the format [version id,version specific values, ... , ...]
			v2.1    ['v2.1',{src:url}]
			        one image only
			*/
		//shorthand
		var ctx = variables.context,
			ap = (!!appearanceObj.appearance) ? appearanceObj.appearance : appearanceObj;

		ap.translate = ap.translate || [0,0];
		ap.rotateAdjust = ap.rotateAdjust || 0;
		ctx.translate(ap.position[0] + ap.translate[0],ap.position[1] + ap.translate[1]);
		ctx.rotate((ap.rotate + ap.rotateAdjust).toRadians());

		//version specific operations
		switch(ap.shape[0]){
			case 'v2.1':
				//{src:'url'},
				var img = new Image(), obj = ap.shape[1], ratio;

				img.src = obj.src;
				ratio = Math.min(ap.sizeScale[2] / img.width, ap.sizeScale[2] / img.height);
				img.width *= ratio;
				img.height *= ratio;

				//make it easy to erase
				if(toErase)		ctx.clearRect(		img.width / -2, img.height / -2, img.width, img.height);
				else			ctx.drawImage(img,	img.width / -2, img.height / -2, img.width, img.height);

				break;
			default:
				console.warn("unknown version ID");
		}
		ctx.setTransform(1,0,0,1,0,0);
	},
	renderWorld:function(){
		for(var i in variables.interactingObjects)
			variables.interactingObjects[i].draw();
	},
	clearCanvas:function(dontDoAgain){
		if(variables.leaveGame) return;
		variables.context.clearRect(0,0,variables.canvas.width,variables.canvas.height);
		if(!dontDoAgain){
			this.renderWorld(); //to avoid the weird blinks
			setTimeout(function(){
				functions.clearCanvas()
			},variables.eraseFullBoardFrequency);
		}
	},
	getMousePos:function(evt){
		/* example usage:
			$('body').click(function(event){
				var mousePos = getMousePos(event);
			});
		*/
		var rect = variables.canvas.getBoundingClientRect();
		return {
			x:(evt.clientX - rect.left).roundTo(variables.userAccuracy.mouse),
			y:(evt.clientY - rect.top).roundTo(variables.userAccuracy.mouse),
		};
	},
	isPressed:function(input,/* user, */timeStamp){
		//accepted formats: x (button with the value x returns true),
		// or [x,y] (button with value x, or buton with value y returns true)
		//timeStamp: to return the last time pressed --> default: false

		//shorthand
		var keys = variables.interactingObjects[variables.activeUser].user.keyboard;
		// var keys = variables.interactingObjects[user].user.keyboard; //used to do this when i was controlling multiple users on the same computer
			//now we are also controlling robots
		if(typeof input === "number")
			if(!keys[input])		return false;
			else if(timeStamp)		return keys[input][1];
			else					return keys[input][0];
		else if(/*typeof input === 'object' && */Array.isArray(input)){
			for(var i=0;i<input.length;i++)
				// if(functions.isPressed(input[i],user,timeStamp))
				if(this.isPressed(input[i],timeStamp)) //recurse
					return true;
			return false;
		}
		console.warn('wrong input type');
	},
	gameMessage:function(input,dontSelfDestruct){
		var v = [];
		if(!typeof input === 'string' && !input.message){
			console.warn("no message was included");
			return;
		}

		v.message = typeof input === 'string' ? input : input.message;
		v.target = input.target || 'all'; //the user that should respond to the message
		v.action = input.action || 'post'; //[some keyword]: [corresponding action]
			//post: send a txt msg to the target user,
			//status: reporting status to the server,
			//response: given when a response was required
		// v.requireResponse = input.requireResponse || false;

		v.origin = variables.activeUser || (variables.server ? "server" : authObject.authData.uid);
		v.localeTimestamp = firebase.database.ServerValue.TIMESTAMP;
		// v.gameTimestamp = variables.timeStamp;

		//now actually send the message
		var sent = messageRef.push(functions.standardizeForFirebase(v));

		// automatically remove the message after the timeout period
		if(!dontSelfDestruct && sent.path.o){
			//idk, but sent.path.o looks like a hack --> im looking for a better way to do this
			var lastMessage = messageRef.child(sent.path.o[sent.path.o.length-1]);
			setTimeout(function(){
				lastMessage.remove();
				// console.log(lastMessage.key);
			},variables.messageTimeout);
		}
	},
	userMessage:function(text,info_success_warning_error_validation,duration){
		var type = info_success_warning_error_validation;
		/* takes:
			@param text:	*required*	the text to display
			@param type:	*required* 	the type of message to display
			@param duration:			ms to display the message DEFAULT: 4000
		*/
		if(!type || typeof type !== 'string')
			console.warn("Wrong input '"+type+"'");

		var el = $("<div class='userMessage "+type+"'>"+text+"</div>");
		el.appendTo("body").fadeIn();
		el.delay(duration || 4000).fadeOut("slow",function(){
			$(this).remove();
		});
	},
	reduceToRequired:function(obj,min){
		//some code here using the minimalToRender of each displayObject
		//this will be called by standardizeForFirebase
		var copy = {},
			needed = min ? min : obj.minimalToRender;

		if(needed === undefined){
			// console.warn("No minimize object was provided");
			return obj;
		}

		for(var i in needed){
			if(typeof needed[i] === 'object'){
				copy[i] = functions.reduceToRequired(obj[i],needed[i]);
				if(jQuery.isEmptyObject(copy[i]))
					delete copy[i];
			}else if(needed[i] === true)
				copy[i] = obj[i];
			else if(typeof needed[i] === 'string')
				//round some numbers (to send less packets) by providing a
				//  variable representing the multiple to round it to
				if(typeof obj[i] === 'number')
					copy[i] = obj[i].roundTo(
						Object.byString(window,needed[i])
					);
			else{
				switch(true){
					case needed[i] !== false:
					case typeof needed[i] === 'function':
						// console.warn("more investigation required");
				}
				return null;
			}
		}
		return copy;
	},
	standardizeForFirebase:function(obj,keepAllProps){
        var t;
        if(!keepAllProps)
            t = functions.reduceToRequired(obj); //thing
        else
            t = clone(obj);

		return (function recurse(thingToRecurseOver){
			var s; //something
			for(var i in thingToRecurseOver){
				s = thingToRecurseOver[i];
				switch (true) {
					case typeof s === 'function':
					case s === undefined:
					case s === Infinity:
						delete thingToRecurseOver[i];
						break;
					case typeof s === 'object':
						s = recurse(s);
						break;
					//TODO: i'd like to round numbers so that we
						//arnt sending data to firebase over .00001 accuracy
				}
			}
			return thingToRecurseOver;
		})(t);
    },
	objectFactory:function(name,updateProps,config){
		/* config takes:
			save:	bool	default: false		to automatically add it to variables.interactingObjects
			count:	int		default: 1			number of times to create the object. will force save to 'true' if this is present
		*/
		if(!updateProps)	updateProps = {};
		if(!config)			config = {};

		for(var i=0;i<(config.count || 1);i++){
			//create object
			var obj = updateSome(new window[name],updateProps);

			//anything else can be taken care of here
			obj.onCompleteConstruction();

			//save it to variables if told
			if(config.save || config.count)
				variables.interactingObjects[obj.uid] = obj;
		}

		//return it for use
		return obj;
    },
};