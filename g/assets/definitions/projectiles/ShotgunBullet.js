function ShotgunBullet(){
	//this is a variation of the bullet
	return updateSome(new Bullet, {
		name: 'ShotgunBullet',
		gamePlay: {
			damage: 12,
			HP: 150,
		},
		appearance: {
			shape: ['v2.1',{
				src: '/g/assets/images/projectiles/blue-lazer.png',
			}],
			sizeScale: {
				2: 45,
			}
		},
		leaveArena: function(){
			return true; //die
		},
	});
}