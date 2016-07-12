var serverHelper = {
	resizeCanvas: function(v) {
		gameServer.child("gameVariables/canvasSize").update(
			(function() {
				var el = document.getElementById(v.target), //element
					w = el.querySelector("#width"),
					h = el.querySelector("#height"),
					size = [0, 0];

				if (v.auto)
					size = [window.innerWidth - 2, window.innerHeight - 2];
				else if (v.target) {
					size = [parseInt(w.value, 10), parseInt(h.value, 10)];
				} else
					size = [v.width, v.height];

				var toReturn = {};

				if (size[0] > 0 && !isNaN(size[0])) {
					toReturn[0] = size[0];
					w.value = size[0];
				}
				if (size[1] > 0 && !isNaN(size[1])) {
					toReturn[1] = size[1];
					h.value = size[1];
				}
				return toReturn;
			})()
		);
	},
	cleanUsers: function() {
		console.log("cleaning users");
		pingsRef.child(variables.activeUser).set(firebase.database.ServerValue.TIMESTAMP).then(function() {
		// first set the my last check in time to the firebase as the servervalue.timestamp --> this is the current time
			pingsRef.once('value').then(function(data) {
			//download all of the pings
				var d = data.val();

				for (var user in d) {
					if (!d.hasOwnProperty(user))
						continue;

					if (d === variables.activeUser)
						continue; //dont kick the server off

					if (d.server - d[user] > variables.pingAllowance + variables.pingFrequency)
						serverHelper.bootUser(user); //kick them off if they have been inactive
				}
			});
		}).catch(function(error) {
			console.error(error);
		});
	},
	bootUser: function(uid) {
		whitelistRef.child(uid).remove();
		objectsRef.child(uid).remove();
		// pingsRef.child(uid).remove();
		console.log("removed:", uid);
	},
	acceptUser: function(uid) {
		//add the user to the whitelist
		whitelistRef.child(uid).set(true);
		if (variables.debugFlags.showStagesPerformed)
			console.log("accepted " + uid + " to the game");
	},
};
function init() {
	//require password
	if (!authObject.isOwnerLoggedIn())
		if (!authObject.ownerLogin()) {
			functions.userMessage("Sorry, you can't start a server", 'error');
			return;
		}

	$('#control_buttons > #start').html("Server started");
	variables.activeUser = 'server';

	//listen for new messages and act on them (to accept them to the game)
	messageRef.on('child_added', function(snapshot) {
		var s = snapshot.val();
		if (s.target === 'server') {
			switch (s.action) {
				case 'join':
					serverHelper.acceptUser(s.origin);
					break;
			}
		}
		if (s.target === variables.activeUser)
			snapshot.ref.remove(); //delete the message after reading it
	});

	//clean up the old users
	setTimeout(function(){
		setInterval(serverHelper.cleanUsers,variables.cleanUsersFrequency);
	},20000); //wait a period of time initially to just let things settle down :)
}