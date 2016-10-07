function Explosive(){
	return updateSome(new orb, {
		name: 'Explosive',
		gamePlay: {
			damage: 50,
			damageType: 'explosive',
			HP: 400,
			speed: 7.2,
		},
		appearance: {
			sizeScale: {
                2: 0.7 * variables.sizeScale,
            },
            shape: ['v2.1',{
            	src: "assets/images/projectiles/orbs/circular-lazer-shot.png",
            }],
		},
		physics: {
			mass: 30,
		},
		leaveArena: function(direction){
			var v = this.physics.velocity,
				ap = this.appearance;

			switch(direction){
				case 'top':
				case 'bottom':
					return true; //die
					break;
				case 'left':
					//'teleport' to right side
					ap.position[0] = variables.canvas.width - this.physics.hitBox.simple[1] * ap.sizeScale[2] - 1;
					break;
				case 'right':
					v[0] *= -2; //turn around and double speed
					break;
			}
		},
		deathEffect: function(){
			var g = this.gamePlay,
				v = variables;

			if(g.hasDied[1] && v.timeStamp - g.hasDied[1] > 10)
				return true; //die 'x' cycles after the first death

			this.gamePlay.HP = 11; //set a timer
			this.physics.velocity[0] /= 2; //slow down movement
			this.physics.velocity[1] /= 2;

			this.appearance.sizeScale[2] *= 1.1; //get bigger

			//tell the other users
			this.minimalToRender.appearance.sizeScale[2] = true;
			return false; //we shouldn't die the first time
		}
	});
}