function Sniper(){
	return updateSome(new weapon, {
		name: 'Sniper',
		gamePlay: {
			launches: Bullet,
			rateOfFire: 20,
			speedMultiplier: 1.5,
			damageMultiplier: 3.5,
		},
		appearance: {
			shape:['v2.1',{
				src: '/g/assets/images/weapons/pulse_rifle.png',
			}],
		}
	});
}