function Destroyer(){
    return updateSome(new robot,{
        name: 'Destroyer',
        appearance: {
            shape: ['v2.1',{
                src: '/g/assets/images/robots/' +
                    'orange/destroyer.png',
            }],
        },
        gamePlay: {
            rotateSpeed: 4,
            weaponKeywords: ['Lazer','LittleSister'],
            robotValue: 8,
            damageMultiplier: .8,
            shieldBurnOut: 150,
            attackRange: 700,
            maxHP: 8000,
            maxShields: 1000,
        },
        physics: {
            mass: 1500,
        },
        user: {
            username: 'Destroyer',
        },
        ai: {
            stateStack: ['attack'],
            states: {
                attack: function(){
                    var u = AI.user,
                        me = u.me;

                    if(u.userShields.isLow)
                        //add cooldown
                        me.changeWeapon();

                    //transition
                    // if(u.myShields.isLow || u.myShields.isMedium)
                    //     u.me.ai.addState('regen');
                        //start regen when not full shields
                },
            },
        }
    });
}