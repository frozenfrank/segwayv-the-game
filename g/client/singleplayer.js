function modeInit(){
    //start making robots
    var v = variables;
    
    //cop out! 
    /*
	//decrease our shield burnout & incrase shield regen
    var me = v.interactingObjects[v.activeUser];
    me.gamePlay.shieldBurnOut /= 2;
    me.gamePlay.shieldRegen *= 2;
    */

	//update some variables
	v.singlePlayerMode = true;
	AI.user.stateLog = document.getElementById('stateLog');

    //show the state log
	if(authObject.isOwnerLoggedIn())
	    AI.user.stateLog.style.display = 'block';

    resizeCanvas();
    
	//load some more resources: win font (font for winning)
	$('head').append('<link href="https://fonts.googleapis.com/css?family=Righteous" rel="stylesheet">');
	//TODO: then use it to actually load it

    //add a mothership
    functions.objectFactory("Mothership",{},{ save:true });
    
    //GO! --> dont wait for a whitelist, just play
    clientActivate();
}
var resizeCanvas = (function f(){
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
    
    return f;
});
$(window).resize(resizeCanvas);