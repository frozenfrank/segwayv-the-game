var whitelistRef,gameServer,variables,pingsRef; //just get rid of the stupid warnings
var serverHelper = {
	resizeCanvas: function(v){
		gameServer.child("gameVariables/canvasSize").update(
			(function(){
				var el = document.getElementById(v.target), //element
				    w = el.querySelector("#width"),
				    h = el.querySelector("#height"),
				    size = [0,0];

				if(v.auto)
				    size = [window.innerWidth - 2, window.innerHeight - 2];
				else if(v.target){
				    size = [parseInt(w.value,10), parseInt(h.value,10)];
				}else
					size = [v.width, v.height];

				var toReturn = {};

				if(size[0] > 0 && !isNaN(size[0])){
				    toReturn[0] = size[0];
    				w.value = size[0];
				}
				if(size[1] > 0 && !isNaN(size[1])){
    				toReturn[1] = size[1];
    				h.value = size[1];
				}
				return toReturn;
			})()
		);
	}
};
function init(){
    //require password
    if(!authObject.isOwnerLoggedIn())
        if(!authObject.ownerLogin()){
            functions.userMessage("Sorry, you can't start a server",'error');
            return;
        }

    $('#control_buttons > #start').html("Server started");
    variables.activeUser = 'server';

    //listen for new messages and act on them
    messageRef.on('child_added',function(snapshot){
        var s = snapshot.val();
        if(s.target === 'server'){
            switch(s.action){
                case 'post':
                    //TODO: idk what this is supposed to do
                    break;
                case 'join':
                    //add the user to the whitelist
                    whitelistRef.child(s.origin).set(true);
                    if(variables.debugFlags.showStagesPerformed)
                        console.log("added " + s.origin + " to the game");
                    break;
            }
        }
        if(s.target === variables.activeUser)
            snapshot.ref.remove(); //delete the message after reading it
    });

    //clean up the old users
    setTimeout(cleanUsers,60000); //wait a minute before kicking people off to allow them to ping in
}
function cleanUsers(dontContinueCycle){
    console.log("cleaning users");
    pingsRef.child(variables.activeUser).set(firebase.database.ServerValue.TIMESTAMP).then(function(error){
        pingsRef.once('value').then(function(data){
            var d = data.val();

            for(var user in d){
                if(!d.hasOwnProperty(user))
                    continue;

                if(d === variables.activeUser)
                    continue; //dont kick the server off

                if(d.server - d[user] > variables.pingAllowance + variables.pingFrequency)
                    removeUser(user); //kick them off if they have been inactive
            }
        })
    });
    if(!dontContinueCycle)
        setTimeout(cleanUsers,variables.cleanUsersFrequency);
}
function removeUser(uid){
    console.log('Removing',uid);
    whitelistRef.child(uid).remove();
    objectsRef.child(uid).remove();
    // pingsRef.child(uid).remove();
    console.log("removed:",uid);
}