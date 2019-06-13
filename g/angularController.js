var app = angular.module('segwayv', ["firebase", 'ngSanitize']);
app.factory("Auth", ["$firebaseAuth",
	function($firebaseAuth) {
		var config;
		if(true) //devserver! remember to change when releasing
			config = {
				apiKey: "AIzaSyD_P5MwG5tcTtel2k7R0ROC19QclAvTwQE",
				authDomain: "temporary-segwayv.firebaseapp.com",
				databaseURL: "https://temporary-segwayv.firebaseio.com",
				storageBucket: "",
			};
		else
			config = {
				apiKey: "AIzaSyDgeXBDGiUXgwFHyvZdE1xBK-PljmSi6xY",
				authDomain: "segwayv-the-game-v10.firebaseapp.com",
				databaseURL: "https://segwayv-the-game-v10.firebaseio.com",
				storageBucket:"",
			};
		firebase.initializeApp(config);
		return $firebaseAuth();
	}
]);
app.controller('angularController', function($scope, $timeout, Auth) {
	'use strict';

	$scope.currentMode = "mainMenu";
	$scope.changeMode = function(to) {
		var mode = $scope.modes[$scope.currentMode];

		if (mode && mode.stop)
			mode.stop();

		$scope.currentMode = to;
		variables.currentMode = to;
		mode = $scope.modes[$scope.currentMode];

		if (mode && mode.start)
			mode.start();
	};
	$scope.mainMenu = function() {
		//shortcut
		$scope.changeMode('mainMenu');
	};
	$scope.modes = {
		//TODO: be able to seperate these into files
		singleplayer: {
			start: function() {
				var v = variables;

				//TODO: ensure that were not on the firebase

				//update some variables
				v.singlePlayerMode = true;
				AI.user.stateLog = document.getElementById('stateLog');

				//GO! --> dont wait for a whitelist, just play
				client.activate();

				//add a mothership
				functions.objectFactory("Mothership", {}, {
					save: true
				});

				//show the arena screen
				$scope.changeMode('arena');

				//resize the canvas to fit the screen
				functions.autoResizeCanvasNoSave();
				$(window).resize(functions.autoResizeCanvasNoSave);
			},
		},
		multiplayer: {
			joinStatus: 'Request to join the server',
			start: function() {
				/*
				var gameServer = 'chrome',
					m = $scope.modes.multiplayer;
				//TODO: ask the user

				//join a specific gameServer
				client.joinGameServer(gameServer);

				//change the values of the buttons
				m.joinStatus = "Joining server: " + gameServer;

				//let the user re-request after a period of time
				$timeout(function() {
					m.joinStatus = "The request has timed out. Request again...";
					m.requestDisabled = false;
				}, 20000);
				functions.listenToObjectsRef();
				client.waitForWhitelist();
*/
				// client.listenToMessages();
			},
		},
		arena: {
			start: function() {
				variables.leaveGame = false;
			},
			stop: function() {
				//do the clean up of both modes
				variables.leaveGame = true;
				variables.singlePlayerMode = false;

				//TODO: other multiplayer cleanup
				client.leaveGameServer();

				//TODO: kill the window.resize event from singleplayer[start]
			},
		},
		createUser: {
			start: function() {
				$scope.$broadcast('generateStats');
			},
		},
		mainMenu: {
			socialServices: [
				["instagram.com/frozenfrank7","#8a3ab9","instagram"],
				["twitter.com/frozenfrank7","#00aced","twitter"],
				["facebook.com/frozenfrank77","#3b5998","facebook"],
				["plus.google.com/u/0/+JamesFinlinson","#d34836","google-plus-circle"]],
		},
		credits: {
			data: [
				["Written by:",
				"James Finlinson 2016"],
				['Images:',
				'millionthvector',
				'Font Awesome',
				'Google Fonts',
				'pickywallpapers.com'],
				['Minified with:',
				'MinifyCode.com',
				'Google Closure Compiler Service'],
				['Third party libraries:',
				'Firebase',
				'Angular',
				'jQuery',
				'AngularFire'],
				['Special thanks to:',
				'My Family',
				'Chris Woods',
				'Brett Simms',
				'Cloud9 IDE']
			],
		},
	};
	$scope.authObject = {
		canvas: "canvas",
		owner: {
			serverPassword: 'big5',
			isOwner: false,
			login: function() {
				// returns true if it was successful, otherwise false
				var loggedIn = false;
				if (this.isOwner || this.isOwnerLoggedIn())
					loggedIn = true;
				else if (arguments[0] === 'KONAMI')
					loggedIn = true;
				else if (arguments[0] !== false) {
					//TODO: use modal box here
					alert("It's always funny listening to someone lie when you already know the truth...");
					alert("<b>Your NOT the owner!</b>");
					return false;

					var input = prompt("What is the owner password?");
					if (input === this.serverPassword)
						loggedIn = true;
				}

				if (loggedIn) {
					this.isOwner = true;
					Cookies.set("ServerPassword", arguments[0] || input, {
						expires: 7
					});
					functions.userMessage('You are an owner', 'success', 2000);
					return true;
				}
				return false;
			},
			logout: function() {
				this.isOwner = false;
				Cookies.remove('ServerPassword');
				functions.userMessage("Thanks for preserving the integrity of our special content", 'success', 2000);
				return false; //we're not signed in as an owner
			},
			isOwnerLoggedIn: function() {
				var password = Cookies.get('ServerPassword');
				if (password === this.serverPassword || password === 'KONAMI') {
					this.isOwner = true;
					return true; //we are an owner
				}
				this.isOwner = false;
				return false;
			},
		},
		authData: null,
		name: function() {
			var d = $scope.authObject.authData;
			if (!d)
				return "No User";
			if(d.isAnonymous)
				return 'Anonymous User';
			return d.displayName || d.providerData[0].displayName || "Missing Value";
		},
		login: function(v) {
			//check to login with an app or without
			var provider;
			if (v && v.app) {
				switch (v.app) {
					case 'google':
						provider = new firebase.auth.GoogleAuthProvider;
						break;
					case 'facebook':
						provider = new firebase.auth.FacebookAuthProvider;
						provider.addScope('email');
						// provider.addScope('user_location');
						break;
					case 'twitter':
						provider = new firebase.auth.TwitterAuthProvider;
						//TODO: get twitter email
						break;
					case 'github':
						provider = new firebase.auth.GithubAuthProvider;
						provider.addScope('user:email');
						break;
					case 'anonymous':
						firebase.auth().signInAnonymously();
						break;
				}
				if(provider){
					if($scope.authObject.authData)
						firebase.auth().currentUser.linkWithPopup(provider);
						//TODO: add some user alerts
					else
						firebase.auth().signInWithPopup(provider).catch(function(error){
							switch (error.code) {
								case "auth/popup-closed-by-user":
								case "auth/cancelled-popup-request":
									console.log('The OAuth box was closed');
									functions.userMessage("You closed the OAuth Box!",'warning');
									break;
								case "auth/account-exists-with-different-credential":
									//TODO: lookup what account it already exists on and perform the correct sign-in, then automatically link the two accounts
									functions.modalBox({
										color: 'yellow',
										icon: 'exclamation-triangle',
										modal: false,
										message: 'It look\'s like you have already signed in to the application use a different service that is associated with <b>the same email address</b>.<br/> Try using a differnt provider...',
									});
									break;
								default:
									console.warn(error);
									firebase.auth().currentUser.linkWithPopup(provider);
							}
						});
				}
			}else{
				//box with sign in options
				// scratch that! were movning into the userInfo box
			}
		},
		logout: function() {
			firebase.auth().signOut();
		},

		onKonamiCode: function() {
			$timeout(function() {
				$scope.authObject.owner.login('KONAMI');
			});
		},
	};
	$scope.readExternal = function(what){
		return window[what];
	};

	$scope.auth = Auth;
	$scope.auth.$onAuthStateChanged(function(user) {
		$scope.authObject.authData = user;

		var v = variables;

		if (user) {
			v.activeUser = user.uid;

			//check for a pre-existing sprite that has been created
			database.child(user.uid).once("value").then(function(snapshot) {
				$timeout(function(){
					if (!snapshot.exists())
						$scope.changeMode('createUser');
					else{
						//update the last login value
						snapshot.ref.child("user/stats/lastLogin").set(firebase.database.ServerValue.TIMESTAMP);
						$scope.changeMode('lobby');
					}
					console.log("Authenticated successfully with payload:", user);
				});
			});

		} else {
			console.log("Signed out :(");
			$scope.mainMenu();
		}
	});

	//resolve some of the client side variables
	var v = variables;
	v.canvas = document.getElementById(v.canvasID); //the canvas to be drawing on
	v.context = v.canvas.getContext('2d'); //the context of the canvas

	//define global ref's to segments of the gameServer
	mainFirebase = firebase.database().ref();
	database = mainFirebase.child("users");

	//pass in 'false' the first time to not ask the user
	$scope.authObject.owner.login(false);

	//set up the konami cheat code
	new Konami($scope.authObject.onKonamiCode);
});
app.controller('modalController', function($scope, $timeout) {
	updateSome($scope, {
		// red | green | blue | yellow
		color: 'red',

		// star | anchor | beaker | bug (or something else in the font-awesome library)
		icon: 'code',

		// true  --> must click on checkmark
		// false --> can click on the overlay also
		modal: false,

		// message to display
		message: 'Lorem ipsum dolor sit amet.<br>broken<b>HUMAN</b>',

		//function to be called when it closes
		onclick: function(){},
		stage: {
			current: 0,
			//0 - hidden
			//1 - shown
			show: function() {
				if ($scope.stage.current === 1)
					return;

				$scope.stage.current = 1;
				functions.removeClass($scope.overlay, 'hide');
				functions.addClass($scope.overlay, 'prep');
				functions.addClass($scope.overlay, 'show');
			},
			hide: function() {
				if ($scope.stage.current === 0)
					return;

				$scope.stage.current = 0;
				functions.removeClass($scope.overlay, 'prep');
				functions.removeClass($scope.overlay, 'show');
				functions.addClass($scope.overlay, 'hide');

				if($scope.onclick && typeof $scope.onclick === 'function')
					//call a customized callback with the scope object
					$timeout(function(){
						$scope.onclick($scope);
					});
			},
		},
	});

	$scope.$on('launchModalBox', function(event, data) {
		updateSome($scope, {
			//default this every time
			onclick: function(){},
		}, data);
		$scope.stage.show();
	});

	$scope.overlay = document.getElementById('overlay');
});
app.controller('multiplayerController', function($scope, $timeout){
	$scope.requestToJoin = function(server){
		client.requestToJoin(server);
	};
});
app.controller('spriteController', function($scope, $timeout, $http) {
	$scope.interested = false;
	$scope.selectedSprites = [];
	$scope.toggleSprite = function(sprite) {
		var array = $scope.selectedSprites;
		index = array.indexOf(sprite);

		if (index === -1)
			array.push(sprite);
		else
			array.splice(index, 1);
	};
	$scope.isSelected = function(sprite) {
		return $scope.selectedSprites.indexOf(sprite) !== -1;
	};
	$scope.username = {
		value: undefined,
	};
	$scope.completeForm = function() {
		var selectedSprites = $scope.selectedSprites,
			username = $scope.username.value,
			error = '';

		if (selectedSprites.length > 1) error += 'You can only pick one ship to be yours</br>';
		if (selectedSprites.length < 1) error += 'You haven\'t picked a ship yet!</br>';

		if (!username) username = $scope.values[$scope.index];
		// if (!username) error += "You haven't picked a username!</br>";
		//instead of throwing an error, just assume the placeholder text in the textbox

		if (!$scope.authObject.authData) error += 'You need to login in before saving your choice</br>';

		if (error) {
			functions.userMessage(error.trim(), 'validation');
			return;
		}

		//make it easy to change
		if (objectsRef)
			objectsRef.child($scope.authObject.authData.uid).remove();

		//save and get the promise back to show a message
		functions.generateSprite(selectedSprites[0], username, $scope.authObject.authData).then(function() {
			$timeout(function() {
				$scope.interested = false;
				$scope.selectedSprites = [];
				$scope.$parent.changeMode('lobby');

				//success message
				functions.userMessage("<b>" + $scope.authObject.name() + "</b> has chosen to fly the <b>" + selectedSprites[0] +
					"</b> under the alias of <b>" + username + "</b>", 'success');
				// functions.userMessage("Successfully named your <b>" + selectedSprites[0] + "</b> as <b>" + username + "</b>", 'success');
			});
		}).catch(function(error) {
			functions.userMessage('<b>Failure!</b>: <br>Something went fatally wrong', 'error');
			console.error(error);
		});
	};
	$scope.generation = {
		sprites: fromPHP.userObjects,
		stats: [
			{
				displayName: 'Shields',
				pathInSprite: 'gamePlay.maxShields',
				important: true,
			},
			{
				displayName: 'Shields Regen',
				pathInSprite: 'gamePlay.shieldRegen',
			},
			// {
			// 	displayName: "Shield Burnout",
			// 	pathInSprite: 'gamePlay.shieldBurnOut',
			// 	inverted: true,
			// },
			{
				displayName: "Health",
				pathInSprite: 'gamePlay.maxHP',
				important: true,
			},
			{
				displayName: 'Max Speed',
				pathInSprite: 'gamePlay.speed',
				important: true,
			},
			{
				displayName: "Rotate Speed",
				pathInSprite: 'gamePlay.rotateSpeed'
			},
			{
				displayName: 'Mass',
				pathInSprite: 'physics.mass',
				important: true,
				inverted: true,
			},
			{
				displayName: 'Damage',
				pathInSprite: 'gamePlay.damageMultiplier',
				important: true,
			},
		],
		generated: false,
	};
	$scope.$on('generateStats', function() {
		var g = $scope.generation,
			stats = g.stats,
			sprites = g.sprites;

		//only run once
		if (g.generated)
			return;
		g.generated = true;

		//finish constructing the stats
		for (var i = 0; i < stats.length; i++) {
			stats[i].min = +Infinity;
			stats[i].max = -Infinity;
			// stats[i].sum = 0;
			// stats[i].count = 0;
			// stats[i].avg = function(){
			//     return this.sum / this.count;
			// };
		}

		//record the stats in all of the areas of interest
		var v, sprite, ii, ss, savedV;
		for (i = 0; i < sprites.length; i++) {
			sprite = sprites[i] = functions.objectFactory(sprites[i]);
			savedV = sprites[i].values = {};

			for (ii = 0; ii < stats.length; ii++) {
				ss = stats[ii]; //statSet
				v = Object.byString(sprite, ss.pathInSprite); //value in this sprite

				//save it for later --> i actually need this, idk y
				savedV[ss.displayName] = v;

				if (sprite.user.availableToPublic) {
					ss.min = v < ss.min ? v : ss.min;
					ss.max = v > ss.max ? v : ss.max;
					// ss.sum += v;
					// ss.count++;
				}
			}
		}
	});

	// randomUsername section
	$scope.values = ['brokenHUMAN'];
	$scope.index = 0;
	$scope.fetching = false;
	$scope.update = (function f() {
		var user = $scope;
		if (++user.index === user.values.length) {
			user.index--;
			user.fetching = true;
			$http.get('randomUsername?count=10').then(function(response) {
				user.values = response.data.split('\n');
				user.index = 0;
				user.fetching = false;
			});
		}
		/*
			instead of only keeping one value, we will preload `a bunch`
			and cycle through them before making a new http request.

			-increase the counter
			-if we are at the end of the list
			--decrease the counter to leave a username on the page
			--make the http request
			---then, replace the values and index
		*/
		return f;
	})();
	$scope.setPreset = function($event) {
		var user = $scope.username;
		if (!user.value) user.value = $scope.values[$scope.index];
		setTimeout(function() {
			$event.target.select();
		}, 1);
	};
});
