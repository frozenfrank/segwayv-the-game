function TestProjectile(){
	return updateSome(new projectile, {
		name: 'TestProjectile',
		gamePlay: {
			damage: 100, //25
			damageType: 'melee',
			HP: 250,
			speed: 10,
		},
		appearance: {
			shape: ['v2.1',{
				src: '/g/assets/images/projectiles/missle-darkgray2.png',
			}],
			sizeScale: {
				2: .85 * variables.sizeScale,
			}
		},
		physics: {
			mass: 60,
		},
	});
}