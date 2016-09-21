function projectile(){
    return updateSome(new displayObject, {
        class: 'projectile',
        appearance: {
            sizeScale: {
                2: 0.2 * variables.sizeScale,
            },
        },
        gamePlay: {
            damage: 40,
            speed: 20,
            ranged: true,
            damageType: 'generic',
            hasDied: [0,false], //[times died, timeStamp of first death]
            HP: 100,
        },
        minimalToRender: {
            gamePlay: {
                damage: true,
                HP: true,
                speed: true,
            },
            physics: {
                velocity: true,
            }
        },
        die: function(){
            var g = this.gamePlay,
                v = variables;

            //record some props for reading in the deathEffect
            g.hasDied[0]++; //increment times died
            if(!g.hasDied[1]) g.hasDied[1] = v.timeStamp; //record the first death

            if(!this.deathEffect()){
                this.minimalToRender.gamePlay.hasDied = true; //start saving this to the others
                this.save();
                return false; //give the chance to do something on death (also prevent death)
            }

            this.erase(); //de-clutter the board

            if(this.isOwner())
                if(!g.diedAwhileAgo){
                    // **work**
                    g.diedAwhileAgo = v.timeStamp;
                    return; //you can only delete if your not the person that spawned it --> try to make it die on contact
                }

            delete v.interactingObjects[this.uid]; //locale copy
                //BOOOO!!! //dont delete the locale copy because it will be when the we see its dead in the firebase
                //update: do delete the locale copy to avoid overextending its range
                    //if it actually should exist then it will come back with the firebase update

        	if(!v.singlePlayerMode)
                objectsRef.child(this.uid).remove(); //firebase
        },
        leaveArena: function(){
            // console.log(this.name,"left",direction,"arena");
            return true; //we died --> the gameLoop will handle the bloodshed
        },
        gameCycle: function(){
            var o = this,
                ap = o.appearance,
                p = o.physics,
                pos = ap.position;

            //expiration
            this.gamePlay.HP--;

            this.cycleEffect();

            //movement
            pos[0] += p.velocity[0];
            pos[1] -= p.velocity[1];

            if(this.isOwner())
                if(variables.timeStamp % variables.projectileSaveFrequency === 0)
                    this.save();
        },
        collideWith: function(otherOBJ){
            switch(otherOBJ.class){
                case 'userObject':
                case 'robot':
                    //add an effect
                    var pos = this.appearance.position;
                    var thatpos = otherOBJ.appearance.position;

                    var here = pos;
                    //TODO: make the effect appear at the collision (instead of the center of the projectile...)
                    if(this.name !== 'OnContactEffect'){
                        functions.objectFactory('OnContactEffect',{
                            appearance: {
                                position: here,
                            },
                        },{ save:true });
                    }
                    break;
            }
            this.die();
        },
        cycleEffect: function(){
            var p = this.physics,
                ap = this.appearance;

            //rotate to be facing the direction that it is traveling
            ap.rotate = getStandardAngle(p.velocity[0],p.velocity[1] * -1);
        },
        deathEffect: function(){
            //do nothing
            return true; //we died
        }
    });
}