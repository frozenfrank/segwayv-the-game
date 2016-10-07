function Pistol(){
	return updateSome(new weapon, {
		name: 'Pistol',
		gamePlay: {
			launches: Bullet,
			rateOfFire: 20,
		},
		appearance: {
			shape: ['v2.1',{
				src:'assets/images/projectiles/missle-gray1.png',
			}],
		}
	});
}