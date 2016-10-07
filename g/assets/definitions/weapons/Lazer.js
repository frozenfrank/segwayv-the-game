function Lazer(){
	return updateSome(new weapon, {
		name: 'Lazer',
		gamePlay: {
			launches: LazerBeam,
			rateOfFire: 20,
			speed: 50,
		},
		appearance: {
			shape: ['v2.1',{
				src: 'assets/images/weapons/kraad.png',
			}],
		},
	});
}