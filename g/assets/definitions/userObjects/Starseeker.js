function Starseeker(){
    return updateSome(new userObject, {
        name: 'Starseeker',
        appearance: {
            shape: ['v2.1',{
                src:'/g/assets/images/sprites/' +
                    '5c2-blue.png',
            }],
            displayName: 'UES Starseeker',
        },
        gamePlay: {
            maxHP: 3000,
            shieldRegen: 2,
            maxShields: 300,
            damageMultiplier: 1.9,
        },
        physics: {
            mass: 300,
        },
    });
}