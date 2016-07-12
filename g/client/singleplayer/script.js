function modeInit(){
    //start making robots
    var v = variables;

	//update some variables
	v.singlePlayerMode = true;
	AI.user.stateLog = document.getElementById('stateLog');

    resizeCanvas();

    //add a mothership
    functions.objectFactory("Mothership",{},{ save:true });

    //GO! --> dont wait for a whitelist, just play
    client.activate();
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