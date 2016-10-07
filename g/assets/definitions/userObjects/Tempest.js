function Tempest(){
    return updateSome(new userObject, {
        name: 'Tempest',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5c2-purple.png',
            }],
            displayName: 'EAS Tempest',
        },
        gamePlay: {
            maxHP: 3330,
            shieldRegen: 2,
            maxShields: 300,
            damageMultiplier: 2,
        },
        physics: {
            mass: 300,
        },
    });
}