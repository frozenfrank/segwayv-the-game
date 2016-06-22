function SisterShell(){
	return updateSome(new orb, {
		name: 'SisterShell',
		gamePlay: {
			damage: 90, //25
			HP: 50,
			speed: 16,
		},
		appearance: {
			shape: ['v2.1',{
				src: '/g/assets/images/projectiles/orbs/Dream_Smoke_Ball_Sprite.png',
			}],
		},
	});
}