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
				src: 'assets/images/projectiles/blue-lazer.png',
			}],
		},
		leaveArena: function(){
			return true; //die
		},
	});
}