var app = angular.module('segwayv', ["firebase"]);
app.factory("Auth", ["$firebaseAuth",
	function($firebaseAuth) {
		var config = {
			apiKey: "AIzaSyD_P5MwG5tcTtel2k7R0ROC19QclAvTwQE",
			authDomain: "temporary-segwayv.firebaseapp.com",
			databaseURL: "https://temporary-segwayv.firebaseio.com",
			storageBucket: "temporary-segwayv.appspot.com",
		};
		firebase.initializeApp(config);
		return $firebaseAuth();
	}
]);
app.controller('angularController', function($scope, $timeout, Auth) {
	'use strict';

	$scope.currentMode = "mainMenu";
	$scope.isPlaying = false;
	$scope.changeMode = function(to) {
		var mode = $scope.modes[$scope.currentMode];

		if (mode && mode.stop)
			mode.stop();

		$scope.currentMode = to;
		variables.currentMode = to;
		mode = $scope.modes[$scope.currentMode];

		if (mode && mode.start)
			mode.start();

		$scope.isPlaying = mode ? (mode.isPlaying ? true : false) : false;
		variables.leaveGame = !$scope.isPlaying;
	};
	$scope.mainMenu = function() {
		//shortcut
		$scope.changeMode('mainMenu');
	};
	$scope.modes = {
		//TODO: be able to seperate these into files
		singleplayer: {
			isPlaying: true,
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

				//resize the canvas to fit the screen
				functions.autoResizeCanvasNoSave();
				$(window).resize(functions.autoResizeCanvasNoSave);
			},
			stop: function() {
				variables.singlePlayerMode = false;

				//TODO: kill the window.resize event
			}
		},
		multiplayer: {
			requestDisabled: true,
			joinStatus: 'Request to join the server',
			isPlaying: true,
			start: function() {
				var gameServer = 'chrome',
					m = $scope.modes.multiplayer;
				//TODO: ask the user

				//join a specific gameServer
				client.joinGameServer(gameServer);

				//change the values of the buttons
				m.joinStatus = "Joining server: " + gameServer;

				//let the user re-request after a period of time
				$timeout(function(){
					m.joinStatus = "The request has timed out. Request again...";
					m.requestDisabled = false;
				},20000);

				functions.listenToObjectsRef();
				client.waitForWhitelist();
				// client.listenToMessages();
			},
			stop: function() {
				//TODO: cleanup
				client.leaveGameServer();
			},
		},
		createUser: {
			start: function() {
				/*
				// Cache selectors outside callback for performance.
				// **work
				var $window = $(window),
					$mainMenuBtn = $('#mainMenuBtn'),
					topOffset = $mainMenuBtn.offset().top;

				$window.scroll(function() {
					if (variables.currentMode !== 'createUser')
						return;
					$mainMenuBtn.toggleClass('sticky', $window.scrollTop() > topOffset);
				});
				*/
			},
		},
	};
	$scope.authObject = {
		loginStatus: 'Login with Google',
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
				//TODO: run this once on load and never again
				var password = Cookies.get('ServerPassword');
				if (password === this.serverPassword || password === 'KONAMI') {
					this.isOwner = true;
					return true; //we are an owner
				}
				this.isOwner = false;
				return false;
			},
		},
		login: function(v) {
			//check to login with an app or without
			if (v.app) {
				$scope.authObject.loginStatus = 'Logging in...';
				var provider = new firebase.auth.GoogleAuthProvider;
				firebase.auth().signInWithPopup(provider);
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

	$scope.auth = Auth;
	$scope.auth.$onAuthStateChanged(function(user) {
		$scope.authObject.authData = user;

		var v = variables;

		if (user) {
			v.activeUser = user.uid;

			//check for a pre-existing sprite that has been created
			database.child(user.uid).once("value").then(function(snapshot) {
				if (!snapshot.exists())
					$scope.changeMode('createUser');
				else
				//update the last login value
					snapshot.ref.child("user/stats/lastLogin").set(firebase.database.ServerValue.TIMESTAMP);
			});

			console.log("Authenticated successfully with payload:", user);
			$scope.authObject.loginStatus = "Logged in as " + user.displayName;
		} else {
			console.log("Signed out :(");
			$scope.authObject.loginStatus = 'Login with Google';
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
		if(objectsRef)
			objectsRef.child(authObject.authData.uid).remove();

		if(variables.debugFlags.showStagesPerformed)
			console.log("Generating:", selectedSprites[0], username);

		//save and get the promise back to show a message
		functions.generateSprite(selectedSprites[0], username, $scope.authObject.authData).then(function() {
			//success message
			functions.userMessage("Successfully named your <b>" + selectedSprites[0] +
				"</b> as <b>" + username + "</b>.</br>Redirecting you back to the game", 'success');

			//delayed redirecting back to the game to read the message
			$timeout(function() {
				$scope.changeMode('mainMenu');
				$scope.interested = false;
				$scope.selectedSprites = [];
			}, 2000);
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
		hasRun: false,
		run: function() {
			var g = $scope.generation,
				stats = g.stats,
				sprites = g.sprites;

			if (!g.hasRun) {
				g.hasRun = true;
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
						ss = stats[ii], //statSet
							v = Object.byString(sprite, ss.pathInSprite); //value in this sprite

						//save it for later
						savedV[ss.displayName] = v;

						if (sprite.user.availableToPublic) {
							ss.min = v < ss.min ? v : ss.min;
							ss.max = v > ss.max ? v : ss.max;
							// ss.sum += v;
							// ss.count++;
						}
					}
				}

				g.stats = stats;
			}
		},
	}

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
