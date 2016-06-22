function Melee(){
	return updateSome(new projectile, {
		name: 'Melee',
		gamePlay: {
			damage: 65,
			ranged: false,
			damageType: 'melee',
			HP: 10,
			speed: 40,
		},
		appearance: {
			shape: ['v2.1',{
				src: '/g/assets/images/projectiles/blue-sword-arc.png',
			}],
			sizeScale: {
				2: 200,
			},
		},
		physics: {
			mass: 60,
		},
	});
}