function displayObject(){
    return {
        uid: generatePushID(),
        name: 'displayObject',
        class: 'generic',
        gamePlay: {
            HP: 1001,
            owner: variables.activeUser,
            immuneTo: ['no-one'],
        },
        appearance: {
            shape: ['v2.1',{
                src: '/g/assets/images/icons/missing.gif',
            }],
            rotate: 0,
            sizeScale: {
                //adjust
                0: 1,
                1: 3 * variables.sizeScale,
                2: 1,
            },
            //randomize the position, easily overridden but harder to implement lots of times
            position: (!!variables.canvas ? [rand(0,variables.canvas.width), rand(0,variables.canvas.height)] : [0,0]),
        },
        physics: {
            mass: 0,
            velocity: [0,0],
            hitBox: {
                simple: [-0.5,0.5,0.5,-0.5],
                corners: [[0.5,0.5],[0.5,-0.5],[-0.5,-0.5],[-0.5,0.5]],
                testPoints: [[1,1],[1,-1],[-1,1],[-1,-1]],
                //default for images
            },
        },
        minimalToRender: {
            //these are the props from above that other users need to
                //fully render this one
            uid: true,
            name: true,
            gamePlay: {
                owner: true,
                immuneTo: true,
            },
            appearance: {
                sizeScale: {
                    2: true,
                },
                rotate: true,
                position: true,
            }
        },
        leaveArena: function(direction,props){
            console.log(this.name,"left the arena to the",direction,"--> Props:",props);
            return true; //die
        },
        gameCycle: function(){
            console.log(this.name,"fired a gameCycle");
        },
        draw: function(){
            // console.log(this.name,"was drawn");
            functions.renderObject(this.appearance);
        },
        erase: function(){
            // console.log(this.name,"was erased");
            functions.renderObject(this.appearance,true);
        },
        save: function(){
            //users can only control their own objects
            if(!this.isOwner())                 return;
            if(variables.leaveGame)             return;
            if(variables.singlePlayerMode)		return;

            objectsRef.update((function(obj){
                var x = {};
                x[obj.uid] = functions.standardizeForFirebase(obj);
                return x;
                })(this)
            );
        },
        collideWith: function(otherOBJ){
            console.log(this.name,"collided with",otherOBJ.name);
        },
        onCompleteConstruction: function(){
            // console.log(this.name,"was constructed");
        },
        isOwner: function(){
            if(this.gamePlay.owner === variables.activeUser)
                return true;

            return false;
        }
    };
}
//other ideas:
//shields