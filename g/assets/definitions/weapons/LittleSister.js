function LittleSister(){
	return updateSome(new weapon, {
		name: 'LittleSister',
		gamePlay: {
			launches: SisterShell,
			rateOfFire: 7,
		},
		appearance: {
			shape:['v2.1',{
				src: 'assets/images/weapons/Type-31_Rifle.png',
			}],
		}
	});
}