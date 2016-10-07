function Bullet(){
	return updateSome(new projectile, {
		name: 'Bullet',
		gamePlay: {
			damage: 20,
			HP: 150,
			speed: 20,
		},
		appearance: {
			shape: ['v2.1',{
				src: 'assets/images/projectiles/8bit-green.png',
			}],
		},
		physics: {
			mass: 10,
		},
		leaveArena: function(direction){
			var v = this.physics.velocity;

			switch(direction){
				case 'top':
					//fix the bug where they are stuck at the edge of the map
					v[1] = 0 - Math.abs(v[1]);
					break;
				case 'bottom':
					v[1] = Math.abs(v[1]);
					break;
				case 'left':
				case 'right':
					return true; //we died
					break;
			}
		}
	});
}