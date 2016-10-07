//functions that are used, but not broad enought to put in the helper.js
var functions = {
	renderObject: function(appearanceObj, toErase) {
		/*
		Rendering: all rendering shapes have the format [version id,version specific values, ... , ...]
		v2.1    ['v2.1',{src:url}]
		        one image only
		*/
		//shorthand
		var ctx = variables.context,
			ap = (!!appearanceObj.appearance) ? appearanceObj.appearance : appearanceObj;

		ap.translate = ap.translate || [0, 0];
		ap.rotateAdjust = ap.rotateAdjust || 0;
		ctx.translate(ap.position[0] + ap.translate[0], ap.position[1] + ap.translate[1]);
		ctx.rotate((ap.rotate + ap.rotateAdjust).toRadians());

		//version specific operations
		switch (ap.shape[0]) {
			case 'v2.1':
				//{src:'url'},
				var img = new Image(),
					obj = ap.shape[1],
					ratio;

				img.src = obj.src;
				ratio = Math.min(ap.sizeScale[2] / img.width, ap.sizeScale[2] / img.height);
				if (toErase) ratio *= 2; //give some comfort room to elimate artifacts
				img.width *= ratio;
				img.height *= ratio;

				//make it easy to erase
				if (toErase) ctx.clearRect(img.width / -2, img.height / -2, img.width, img.height);
				else ctx.drawImage(img, img.width / -2, img.height / -2, img.width, img.height);

				break;
			default:
				console.warn("unknown version ID");
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	},
	renderWorld: function() {
		for (var i in variables.interactingObjects)
			variables.interactingObjects[i].draw();
	},
	clearCanvas: function() {
		var v = variables;
		v.context.clearRect(0, 0, v.canvas.width, v.canvas.height);
		functions.renderWorld(); //to avoid the weird blinks
	},
	getMousePos: function(evt) {
		/* example usage:
			$('body').click(function(event){
				var mousePos = getMousePos(event);
			});
		*/
		var rect = variables.canvas.getBoundingClientRect();
		return {
			// x: (evt.clientX - rect.left).roundTo(1 || variables.userAccuracy.mouse),
			// y: (evt.clientY - rect.top).roundTo(1 || variables.userAccuracy.mouse),
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top,
		};
	},
	isPressed: function(input, /* user, */ timeStamp) {
		//accepted formats: x (button with the value x returns true),
		// or [x,y] (button with value x, or buton with value y returns true)
		//timeStamp: to return the last time pressed --> default: false

		//shorthand
		var keys = variables.interactingObjects[variables.activeUser].user.keyboard;
		// var keys = variables.interactingObjects[user].user.keyboard; //used to do this when i was controlling multiple users on the same computer
		//now we are also controlling robots
		if (typeof input === "number")
			if (!keys[input]) return false;
			else if (timeStamp) return keys[input][1];
		else return keys[input][0];
		else if ( /*typeof input === 'object' && */ Array.isArray(input)) {
			for (var i = 0; i < input.length; i++)
			// if(functions.isPressed(input[i],user,timeStamp))
				if (this.isPressed(input[i], timeStamp)) //recurse
					return true;
			return false;
		}
		console.warn('wrong input type');
	},
	gameMessage: function() {
		//arguments:
		// input (text message | object with data), *required
		// [server (string) (default -> whatever is in the messageRef],
		// [dontSelfDestruct (boolean) (default -> false)]

		var v = [], input, server, dontSelfDestruct, j = 1;

		if(typeof arguments[0] === 'string')
			input = {
				message: arguments[0],
			};
		else if(typeof arguments[0] === 'object')
			input = arguments[0];
		else
			input = {};

		if(typeof arguments[j] === 'string')
			server = functions.getFirebaseRef(arguments[j++]).child("messages");
		else if(input.server)
			server = functions; //**work
		else
			server = messageRef;

		if(typeof arguments[j] === 'boolean')
			dontSelfDestruct = arguments[j++];

		v.message = input.message || '';
		v.target = input.target || 'all'; //the user that should respond to the message
		v.action = input.action || 'post'; //[some keyword]: [corresponding action]
		//join: request to join the server
		//post: send a txt msg to the target user,
		//status: reporting status to the server,
		//response: given when a response was required
		// v.requireResponse = input.requireResponse || false;

		v.origin = variables.activeUser || (variables.server ? "server" : authObject.authData.uid);
		v.localeTimestamp = firebase.database.ServerValue.TIMESTAMP;
		// v.gameTimestamp = variables.timeStamp;

		//now actually send the message
		var sent = server.push(functions.standardizeForFirebase(v));

		// automatically remove the message after the timeout period
		if (!dontSelfDestruct && sent.path.o) {
			//idk, but sent.path.o looks like a hack --> im looking for a better way to do this
			var lastMessage = server.child(sent.path.o[sent.path.o.length - 1]);
			setTimeout(function() {
				lastMessage.remove();
				// console.log(lastMessage.key);
			}, variables.messageTimeout);
		}
	},
	userMessage: function(text, info_success_warning_error_validation, duration) {
		var type = info_success_warning_error_validation;
		/* takes:
			@param text:	*required*	the text to display
			@param type:	*required* 	the type of message to display
			@param duration:			ms to display the message DEFAULT: 4000
		*/
		if (!type || typeof type !== 'string')
			console.warn("Wrong input '" + type + "'");

		var el = $("<div class='userMessage " + type + "'>" + text + "</div>");
		el.appendTo("body").fadeIn();
		el.delay(duration || 4000).fadeOut("slow", function() {
			$(this).remove();
		});
	},
	reduceToRequired: function(obj, min) {
		//some code here using the minimalToRender of each displayObject
		//this will be called by standardizeForFirebase
		var copy = {},
			needed = min ? min : obj.minimalToRender;

		if (needed === undefined) {
			// console.warn("No minimize object was provided");
			return obj;
		}

		for (var i in needed) {
			if (typeof needed[i] === 'object') {
				copy[i] = functions.reduceToRequired(obj[i], needed[i]);
				if (jQuery.isEmptyObject(copy[i]))
					delete copy[i]; //if we delete every property, then dont sent the parent
			} else if (needed[i] === true)
				if (obj[i]) //skip it if the orginal doesn't exist
					copy[i] = obj[i];
				else if (typeof needed[i] === 'string')
			//round some numbers (to send less packets) by providing a
			//  variable representing the multiple to round it to
				if (typeof obj[i] === 'number')
					copy[i] = obj[i].roundTo(
						Object.byString(window, needed[i])
					);
				else {
					switch (true) {
						case needed[i] !== false:
						case typeof needed[i] === 'function':
							console.warn("more investigation required");
					}
					return null;
				}
		}
		return copy;
	},
	standardizeForFirebase: function(obj, keepAllProps) {
		return (function recurse(thingToRecurseOver) {
			var s; //something
			for (var i in thingToRecurseOver) {
				s = thingToRecurseOver[i];
				switch (true) {
					case s === undefined:
					case s === Infinity:
					case isReallyNaN(s):
					case typeof s === 'function':
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
		})(keepAllProps ? clone(obj) : functions.reduceToRequired(obj));
	},
	objectFactory: function(name, updateProps, config) {
		/* config takes:
			save:	bool	default: false		to automatically add it to variables.interactingObjects
			count:	int		default: 1			number of times to create the object. will force save to 'true' if this is present
		*/
		if (!updateProps) updateProps = {};
		if (!config) config = {};

		for (var i = 0; i < (config.count || 1); i++) {
			//create object
			var obj = updateSome(new window[name], updateProps);

			//anything else can be taken care of here
			obj.onCompleteConstruction();

			//save it to variables if told
			if (config.save || config.count){
				obj.save();
			}
		}

		//return it for use
		return obj;
	},
	listenToObjectsRef: function() {
		//listen for new objects to be added, treat them all the same thanks to my constructor methods
		objectsRef.on('child_added', function(snapshot) {
			var level1 = functions.objectFactory(
				snapshot.val().name,
				snapshot.val(), {
					save: true
				}
			);

			//add an event listener for that user--- full-on, keep all data up to date
			//this actually isn't very much thanks to minimalToRender props
			if (snapshot.key !== variables.activeUser) { //dont listen to changes from me
				snapshot.ref.on('child_added', function(subObj) {
					var level2 = level1[subObj.key];
					updateSome(level2, subObj.val()); //add each sub obj to the locale client (appearance, gamePlay)
					subObj.ref.on('child_changed', function(actualValue) { //position, username, sizeScale etc
						var level3 = level2[actualValue.key] = actualValue.val();

						if (actualValue.key === 'weaponKeywords') //also update the locale weapons array for changes
							level1.gamePlay.weapons[0] = functions.objectFactory(level3[0]);
					});
				});
			}
		});
		objectsRef.on('child_removed', function(snapshot) {
			delete variables.interactingObjects[snapshot.key]; //remove the locale copy from rendering & calculating
			snapshot.ref.off(); //remove the event listener
		});
	},
	changeAngular: function(variable, value) {
		//HACK! debug mode only
		//TODO: get rid of this before releasing
		var scope = angular.element($("#app")).scope();
		scope.$apply(function() {
			var item = scope[variable];
			if (typeof item === 'function')
				item();
			else if (value)
				scope[variable] = value;
			else
				console.log(variable, ': ', item);

		});
	},
	autoResizeCanvasNoSave: function() {
		if (!variables.singlePlayerMode)
			return; //HACK!
		//TODO: remove the resize effect from the source

		//set the canvas to the size of the screen
		var v = variables,
			c = v.canvas,
			fullSizeMultiplier = .95;

		v.canvasSize = [
			window.innerWidth * fullSizeMultiplier,
			window.innerHeight * fullSizeMultiplier
		];
		c.width = v.canvasSize[0];
		c.height = v.canvasSize[1];

		return;
	},
	generateSprite: function(sprite, username, authData) {
		var d = authData,
			f = functions.objectFactory(sprite, {
				//as much data as I can possibly harvest
				appearance: undefined,
				user: {
					name: d.isAnonymous ? 'John Doe' : d.displayName,
					email: d.isAnonymous ? 'john@doe.com' : d.email,
					publicProfileImg: d.photoURL,
					isAnonymous: d.isAnonymous,
					username: username,
				},
				gamePlay: {
					owner: d.uid,
					// provider: d.providerData[0].providerId,
				},
				uid: d.uid,
			});

		//safetyify it for firebase
		f = functions.standardizeForFirebase(f, true);

		return database.child(d.uid).set(f).then(function(){
			client.resetObjects(true);
		});
	},
	removeClass: function(e,c) {
		// http://stackoverflow.com/a/2155786
		e.className = e.className.replace( new RegExp('(?:^|\\s)'+c+'(?!\\S)') ,'');
	},
	addClass: function(e,c) {
		//TODO: ensure that the class is not already on the element
		e.className += " "+c;
	},
	getFirebaseRef: function(server) {
		//TODO: check existance of server
		return mainFirebase.child('gameServer/' + server);
	},
	modalBox: function(data){
		var s = angular.element('#app').scope();
		s.$apply(s.$broadcast('launchModalBox',data));
	},
	/*
	addNumberCircle: function(number, color) {
		var style = (function() {
			if (color) {
				var returning = "style='--main-color:"
				if (color === true) returning += randomHexCode();
				else returning += color;
				return returning + "' ";
			} else
				return "";
		})();
		var html = "<div " + style + "class='numberCircle' digits='" + (number + '').length + "'><div><p>" + number + "</p></div></div>";
		$(html).appendTo('body');
		return html;
	},
	*/
};