function OnContactEffect(){
	return updateSome(new projectile, {
		name: 'OnContactEffect',
		gamePlay: {
			damage: 0,
			HP: 4,
		},
		appearance: {
			shape:['v2.1',{
				src:'/g/assets/images/projectiles/'+
					'on-contact-effect.png',
			}],
			sizeScale: {
				2: 50,
			},
		},
		physics: {
			mass: 10,
		},
	});
}