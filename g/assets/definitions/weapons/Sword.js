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
				src: '/g/assets/images/weapons/Arthas_sword.png',
			}],
			sizeScale: {
				2: 125,
			}
		},
	});
}