function LittleSister(){
	return updateSome(new weapon, {
		name: 'LittleSister',
		gamePlay: {
			launches: SisterShell,
			rateOfFire: 10,
		},
		appearance: {
			shape:['v2.1',{
				src: '/g/assets/images/weapons/Type-31_Rifle.png',
			}],
			sizeScale: {
				2: 50,
			},
		}
	});
}