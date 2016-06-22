function Sentry(){
    return updateSome(new robot,{
        name: 'Sentry',
        appearance: {
            shape: ['v2.1',{
                src: '/g/assets/images/robots/' +
                    'orange/tribase2.png',
            }],
        },
        user: {
            username: 'Sentry',
        },
        gamePlay: {
            weaponKeywords: ['Lazer'],
            robotValue: 5,
            damageMultiplier: .5,
            shieldBurnOut: 150,
        },
        physics: {
            mass: 1200,
        },
        ai: {
            stateStack: ['attack'],
            states: {
                attack: function(){
                    /*
                    //then check transitions:
                        //IF                            =>      new state

                        //other robots are attacking    =>      retreat
                        //low shields                   =>      retreat
                        //low robot count               =>      spawn
                        //close to user                 =>      kamakazi
                        //low hp                        =>      kamakazi
*/
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = '/g/assets/images/robots/orange/tribase2.png';

                    //transition
                    if(u.myShields.isLow || u.myShields.isMedium)
                        u.me.ai.addState('regen');
                        //start regen when not full shields
                },
                kamakazi: function(){
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = '/g/assets/images/robots/orange/tribase1.png';

                    //transition
                    if(u.myShields.isHigh)
                        u.me.ai.removeState();
                        //go back to attack when i get full shields
                },
                regen: function(){
                    var u = AI.user;

                    //act
                    u.me.appearance.shape[1].src = '/g/assets/images/robots/orange/tribase2.png';

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