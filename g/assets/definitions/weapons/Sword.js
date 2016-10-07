function Sword(){
	return updateSome(new weapon(), {
		name: 'Sword',
		gamePlay: {
			launches: Melee,
			launchCount: 4,
			spread: 65,
			rateOfFire: 12,
		},
		appearance: {
			shape: ['v2.1',{
				src: 'assets/images/weapons/Arthas_sword.png',
			}],
		},
	});
}