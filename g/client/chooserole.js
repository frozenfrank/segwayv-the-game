function modeInit(){
    console.log("Choosing a mode to play in");
}
firebase.auth().onAuthStateChanged(function(user){
	var multi = $('.gamemode');
    if(user){
        //check for user
        database.child(user.uid).once("value",function(snapshot){
			//check if the user has already been created
			if(!snapshot.exists())
			    location = 'createUser'; //redirect to the createUser page to chose a sprite
		});
		multi.prop('disabled',false);
    }else
        multi.prop('disabled',true);
});
function playMultiplayer(){
    Cookies.set('mode','multiplayer');
    location.reload();
}
function playSingleplayer(){
    var v = variables;
    
    Cookies.set('mode','singleplayer');
    Cookies.set('sprite',v.interactingObjects[v.activeUser].name);
    location.reload()
}