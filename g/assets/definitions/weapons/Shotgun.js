function Shotgun(){
	return updateSome(new weapon, {
		name: 'Shotgun',
		gamePlay: {
			launches: ShotgunBullet,
			rateOfFire: 50,
			spread: 18,
			launchCount: 4,
			speedMultiplier: 0.9,
		},
		appearance: {
			shape: ['v2.1',{
				src:'assets/images/weapons/shotgun.png',
			}],
		},
	});
}