function orb(){
    return updateSome(new projectile, {
        appearance: {
            spinDirection: rand(0,2) ? 1 : -1,
            spinSpeed: rand(3,7),
            sizeScale: {
                2: 0.15 * variables.sizeScale,
            },
        },
        gamePlay: {
            speed: 2, //20
			damageType: 'ranged',
        },
        physics: {
            mass: 5,
        },
        cycleEffect: function(){
            var ap = this.appearance;
            //spin in a direction that varies from the other orbs
            ap.rotate += ap.spinDirection * ap.spinSpeed;
        }
    });
}