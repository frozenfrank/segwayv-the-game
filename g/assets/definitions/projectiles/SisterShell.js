function SisterShell(){
	return updateSome(new orb, {
		name: 'SisterShell',
		gamePlay: {
			damage: 45,
			HP: 25,
			speed: 18,
		},
		appearance: {
			shape: ['v2.1',{
				src: 'assets/images/projectiles/orbs/Dream_Smoke_Ball_Sprite.png',
			}],
		},
	});
}