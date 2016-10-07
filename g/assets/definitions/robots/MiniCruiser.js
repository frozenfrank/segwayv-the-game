function MiniCruiser(){
    return updateSome(new robot,{
        name: 'MiniCruiser',
        appearance: {
            shape: ['v2.1',{
                src: '/g/assets/images/robots/' +
                    'orange/cruiser.png',
            }],
            sizeScale: {
                2: 0.5 * variables.sizeScale,
            },
        },
        gamePlay: {
            weaponKeywords: ['LittleSister'],
            robotValue: 3,
            speed: 13,
            rotateSpeed: 9,
            damageMultiplier: .20,
            maxHP: 1000, //2000
            maxShields: 250,
            shieldRegen: 1.2,
        },
        physics: {
            mass: 200, //400
        },
        user: {
            username: 'Mini Cruiser',
        },
        ai: {
            stateStack: ['attack'],
            states: {
                attack: function(){
                    var me = AI.user.me,
                        c = AI.count;

                    //change this to count of these attacking
                    if(c[me.name] >= 3)
                        me.ai.addState('wander');
                        //avoid over population
                },
                wander: function(){
                    var me = AI.user.me,
                        c = AI.count;

                    //change this to count of these attacking
                    if(c[me.name] < 3)
                        me.ai.removeState();
                }
            },
        }
    });
}