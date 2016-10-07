function Pathfinder(){
    return updateSome(new userObject, {
        name: 'Pathfinder',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5concepts-orange.png',
            }],
            displayName: 'HMS Pathfinder',
        },
        gamePlay: {
            maxHP: 2700,
            shieldRegen: 2.1,
            maxShields: 350,
            damageMultiplier: 1.6,
        },
        physics: {
            mass: 220,
        }
    });
}