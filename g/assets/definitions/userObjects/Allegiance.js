function Allegiance(){
    return updateSome(new userObject, {
        name: 'Allegiance',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5concepts-purple.png',
            }],
            displayName: 'EFS Allegiance',
        },
        gamePlay: {
            maxHP: 3200,
            maxShields: 265,
            shieldRegen: 1.7,
            damageMultiplier: 1.3,
        },
        physics: {
            mass: 175,
        }
    });
}