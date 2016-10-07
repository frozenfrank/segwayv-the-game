function TestWeapon(){
	return updateSome(new weapon(), {
		name: 'TestWeapon',
		gamePlay: {
			launches: TestProjectile,
			rateOfFire: 12,
			speed: 10,
		},
		appearance: {
			shape: ['v2.1', {
				src: 'assets/images/weapons/purple_dominator.png',
			}],
		},
	});
}