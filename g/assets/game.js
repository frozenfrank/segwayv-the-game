//game icons: http://game-icons.net/tags/weapon.html

//define global ref's to segments of the gameServer
// var fireChat = mainFirebase.child("firechat");
var database = mainFirebase.child("users");
var gameServer = mainFirebase.child("gameServer/"
	+ "chrome");
	// + prompt("Which game server do you want to join?",'chrome'));
var whitelistRef = gameServer.child('whiteList');
var objectsRef = gameServer.child('interactingObjects/active');
var pingsRef = gameServer.child('lastPings');
var messageRef = gameServer.child('messages');

//firebase logging in and system logging in
var authObject = {
	serverPassword: 'big5',
	canvas: "canvas",
	// chatWindow: "firechat-wrapper",
	ownerLogin: function(){
		/*
			returns true if it was successful
			return false if it failed
		*/
		var loggedIn = false;
		if(this.isOwnerLoggedIn())
			loggedIn = true;
		else {
			var input = prompt("What is the owner password?");
			if(input === this.serverPassword){
				Cookies.set("ServerPassword",input,{ expires:7 });
				loggedIn = true;
			}
		}

		if(loggedIn){
			this.onOwnerAuthStateChanged();
			return true;
		}
		return false;
	},
	isOwnerLoggedIn: function(){
		if(Cookies.get("ServerPassword") === this.serverPassword)
			return true;

		return false;
	},
	ownerLogout: function(){
		Cookies.remove('ServerPassword');
		functions.userMessage("Thanks for preserving the integrity of our special content",'success',2000);
		this.onOwnerAuthStateChanged();
		return false; //we're not signed in as an owner
	},
	onOwnerAuthStateChanged: function (){
		if(authObject.isOwnerLoggedIn()){
			functions.userMessage('You are an owner','success',2000);
			$('#ownerButton').html("Logout as owner").attr("onclick","authObject.ownerLogout()");
		} else
			$('#ownerButton').html("Login as owner").attr('onclick',"authObject.ownerLogin()");
	},
	login: function(v){
		//check to login with an app or without
		if(v.app){
			var provider = new firebase.auth.GoogleAuthProvider;
			firebase.auth().signInWithPopup(provider);
		}
	},
	logout: function(){
		firebase.auth().signOut();
	},
};
//check the owner login status
$(document).ready(authObject.onOwnerAuthStateChanged);

//after logging in
firebase.auth().onAuthStateChanged(function(user){
	var loginButton = $('#login'),
		logoutButton = $('#logout');

    if(user){
		if(!user.displayName)
			user.displayName = user.email.substr(0,user.email.indexOf('@'));

		authObject.authData = user;
		console.log("Authenticated successfully with payload:", user);
		loginButton.html("Logged in as "+user.displayName).prop('disabled','true');
		logoutButton.removeAttr('disabled');
	}else{
		console.log("Signed out :(");
		loginButton.html("Login with Google").removeAttr('disabled');
		logoutButton.prop('disabled','true');
		authObject.authData = false;
	}
});
var variables = {
	interactingObjects:{},
	timeStamp:0,
	canvasID: 'canvas',
	activeUser: 'generic',
	leaveGame: false,
	singlePlayerMode: false,
	debugFlags: {
		showFilesLoaded: true,
	},
	//place holders
	display: {
        HPbar: {
            HPcolor: {},
            shieldColor: {},
            weaponColor: {},
        },
        usernameColor: "#fff",
    },
}; //import this data from the firebase database

//called by the html onload event
function initiateWorld(){
	//resolve some of the client side variables
	variables.canvas = document.getElementById(variables.canvasID); //the canvas to be drawing on
	variables.context = variables.canvas.getContext('2d'); //the context of the canvas
	if(authObject.authData)
		variables.activeUser = authObject.authData.uid;

	//some variables require special actions to apply their effects
	var useVariables = function(variable){
		switch(variable){
			case "canvasSize":
				//change the width of the canvas
				variables.canvas.width = variables.canvasSize[0];
				variables.canvas.height = variables.canvasSize[1];
				break;
		}
	};

	//load and keep the initial game variables current
	//structure from http://stackoverflow.com/a/15414522
	gameServer.child("gameVariables").on('child_added',function(snapshot){
		variables[snapshot.key] = snapshot.val();
		useVariables(snapshot.key);
	});
	gameServer.child("gameVariables").on('child_changed',function(snapshot){
		variables[snapshot.key] = snapshot.val();
		useVariables(snapshot.key);
	});

	//*** Sync the server clock with the client clocks!
	//http://stackoverflow.com/a/15785110

	//this changes based on the roll of the computer
	init();

}
function listenToObjectsRef(){
	//listen for new objects to be added, treat them all the same thanks to my constructor methods
    objectsRef.on('child_added',function(snapshot){
		var level1 = functions.objectFactory(
			snapshot.val().name,
			snapshot.val(),
			{ save: true }
		);

        //add an event listener for that user--- full-on, keep all data up to date
        //this actually isn't very much thanks to minimalToRender props
        if(snapshot.key !== variables.activeUser){ //dont listen to changes from me
            snapshot.ref.on('child_added',function(subObj){
            	var level2 = level1[subObj.key];
                updateSome(level2, subObj.val()); //add each sub obj to the locale client (appearance, gamePlay)
                subObj.ref.on('child_changed',function(actualValue){ //position, username, sizeScale etc
                    var level3 = level2[actualValue.key] = actualValue.val();

                    if(actualValue.key === 'weaponKeywords') //also update the locale weapons array for changes
                    	level1.gamePlay.weapons[0] = functions.objectFactory(level3[0]);
                });
            });
        }
    });
    objectsRef.on('child_removed',function(snapshot){
        delete variables.interactingObjects[snapshot.key]; //remove the locale copy from rendering & calculating
        snapshot.ref.off(); //remove the event listener
    });
}