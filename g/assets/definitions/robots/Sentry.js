function Sentry(){
    return updateSome(new robot,{
        name: 'Sentry',
        appearance: {
            shape: ['v2.1',{
                src: 'assets/images/robots/' +
                    'orange/tribase2.png',
            }],
        },
        gamePlay: {
            weaponKeywords: ['Lazer'],
            robotValue: 6,
            damageMultiplier: .5,
            shieldBurnOut: 150,
            rotateSpeed: 6,
        },
        physics: {
            mass: 1200,
        },
        user: {
            username: 'Sentry',
        },
        ai: {
            stateStack: ['attack'],
            states: {
                attack: function(){
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = 'assets/images/robots/orange/tribase2.png';

                    //transition
                    if(u.myShields.isLow)
                        u.me.ai.addState('regen');
                        //start regen when not full shields
                },
                kamakazi: function(){
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = 'assets/images/robots/orange/tribase1.png';

                    //transition
                    if(u.myShields.isMassive)
                        u.me.ai.removeState();
                        //go back to attack when i get full shields
                },
                regen: function(){
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = 'assets/images/robots/orange/tribase2.png';

                    //transition
                    if(u.myShields.isHigh){
                        u.me.ai.removeState();
                        //after recovery continue attacking
                        return;
                    }

                    if(u.myHP.isLow || u.myHP.isMedium)
                        u.me.ai.addState('kamakazi');
                        //if middle or low health enter kamakize mode
                }
            },
        }
    });
}