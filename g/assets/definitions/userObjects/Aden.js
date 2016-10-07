function Aden(){
    return updateSome(new userObject, {
        name: 'Aden',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5concepts-blue.png',
            }],
            displayName: 'FTLS Gulf of Aden',
        },
        gamePlay: {
            maxShields: 700,
            maxHP: 400,
            shieldRegen: 2.9,
            speed: 16,
            weaponKeywords: ['Sword', 'TestWeapon'],
            rotateSpeed: 8,
            damageMultiplier: 1.5,
        },
        physics: {
            mass: 100,
        }
    });
}