function Trident(){
    return updateSome(new userObject, {
        name: 'Trident',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    '5c2-teal.png',
            }],
            displayName: 'HSV Trident',
        },
        gamePlay: {
            maxHP: 5000,
            shieldRegen: 2,
            maxShields: 1200,
            speed: 9.75,
            rotateSpeed: 3,
            damageMultiplier: 3,
        },
        physics: {
            mass: 600,
        },
    });
}