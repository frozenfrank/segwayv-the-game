function LazerBeam(){
	return updateSome(new projectile, {
		name: 'LazerBeam',
		gamePlay: {
			damage: 120,
			damageType: 'energy',
			speed: 50,
		},
		appearance: {
			sizeScale: [120,120,120],
			shape: ['v2.1',{
				src:'/g/assets/images/projectiles/solid-red-lazer.jpg',
			}],
		},
		physics: {
			mass: 20,
		},
		deathEffect: function(){
			var g = this.gamePlay,
				v = variables,
				a = this.appearance;

			if(g.hasDied[1] && v.timeStamp - g.hasDied[1] > 10)
				return true;

			g.HP = 22;
			a.shape[1].src = '/g/assets/images/projectiles/blue-lazer.png';
			a.sizeScale[2] /= 4;
			g.speed *= 3;
			g.damageMultiplier *= 3;
			this.leaveArena = function(direction){
				var v = this.physics.velocity,
					c = variables.canvas,
					ax = Math.abs(v[0]), //absolute x
					ay = Math.abs(v[1]); //ditto

				// this.appearance.position = [c.width / 2, c.height / 2];
				switch(direction){
					case 'left':
						v[0] = ax;
						break;
					case 'right':
						v[0] = 0 - ax;
						break;
					case 'top':
						v[1] = 0 - ay;
						break;
					case 'bottom':
						v[1] = ay;
				}
				return false;
			}
			return false;
		}
	});
}