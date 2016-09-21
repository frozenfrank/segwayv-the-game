function Basilisk(){
    return updateSome(new userObject, {
        name: 'Basilisk',
        appearance: {
            shape: ['v2.1',{
                src:'/g/assets/images/sprites/' +
                    '5c2-orange.png',
            }],
            displayName: 'CSS Basilisk',
        },
        gamePlay: {
            maxHP: 2300,
            resizeSpeed: 20,
            shieldRegen: 2.4,
            maxShields: 500,
            speed: 13,
            weaponKeywords: ['GrenadeLauncher', 'Pistol','Lazer'],
            damageMultiplier: 1.1,
        },
        physics: {
            mass: 120,
        }
    });
}