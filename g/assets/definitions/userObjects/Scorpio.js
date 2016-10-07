function Scorpio(){
    return updateSome(new userObject, {
        name: 'Scorpio',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    'aliensh.png',
            }],
            displayName: 'JFF Scorpio',
        },
        gamePlay: {
            maxHP: 2700,
            resizeSpeed: 20,
            rotateSpeed: 6.5,
            shieldRegen: 6,
            shieldBurnOut: 90,
            maxShields: 3500,
            speed: 19,
            damageMultiplier: 4,
            weaponKeywords: ['GrenadeLauncher','Pistol','Lazer','Shotgun','TestWeapon','Sword','LittleSister'],
        },
        physics: {
            mass: 60,
        },
        user: {
            availableToPublic: false,
        },
    });
}