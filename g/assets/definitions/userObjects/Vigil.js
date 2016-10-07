function Vigil(){
    return updateSome(new userObject, {
        name: 'Vigil',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5concepts-red.png',
            }],
            displayName: 'EFS Vigil',
        },
        gamePlay: {
            maxHP: 1400,
            resizeSpeed: 25,
            shieldRegen: 2.8,
            maxShields: 1000,
            speed: 12,
            weaponKeywords: ['Sword', 'Sniper'],
        },
        physics: {
            mass: 90,
        }
    });
}