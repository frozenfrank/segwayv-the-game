function GrenadeLauncher(){
	return updateSome(new weapon, {
		name: 'GrenadeLauncher',
		gamePlay: {
			launches: Explosive,
			rateOfFire: 60,
		},
		appearance: {
			shape: ['v2.1',{
				src:'assets/images/projectiles/' +
					'missle-gray2.png',
			}],
		}
	});
}