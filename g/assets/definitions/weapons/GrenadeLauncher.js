function GrenadeLauncher(){
	return updateSome(new weapon, {
		name: 'GrenadeLauncher',
		gamePlay: {
			launches: Explosive,
			rateOfFire: 60,
		},
		appearance: {
			shape: ['v2.1',{
				src:'/g/assets/images/projectiles/' +
					'missle-gray2.png',
			}],
			sizeScale: {
                2: 100,
            },
		}
	});
}