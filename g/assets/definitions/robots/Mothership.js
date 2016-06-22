var AI; //stupic warnings
function Mothership(){
    return updateSome(new robot,{
        name: 'Mothership',
        appearance: {
            shape: ['v2.1',{
                src: '/g/assets/images/robots/' +
                    'orange/tribase3.png',
            }],
            rotateAdjust: -15, //not working
        },
        gamePlay: {
            weaponKeywords: ['Shotgun'],
            damageMultiplier: 7,
            maxShields: 2000, //10k
            shieldRegen: 8, //12
            shieldBurnOut: 400,
            maxHP: 15000,
            attackThreshold: 85,
            projectileSpeed: .9,
            robotValue: 10,
            attackRange: 900,
        },
        physics: {
            mass: 1500,
        },
        user: {
            username: "MOTHERSHIP",
            // publicProfileImg: '',
        },
        ai: {
            stateStack: ['wander'],
            states: {
                attack: function(){
                    //target, then fire once, then change

                    //moved this into the fireweapon function --> more complete
                },
                wander: function(){
                    //just wander around and wait to change state
                    var u = AI.user,
                        dist = u.distanceToUser,
                        ai = u.me.ai;

                    if(dist.isLow){
                        ai.addState('flee');
                        return;
                    }

                    if(u.myShields.value < u.me.gamePlay.attackThreshold){
                        ai.addState('attack');
                        return;
                    }

                    if(AI.count.total < AI.config.maxRobots){
                        ai.changeState('spawn');
                        return;
                    }
                },
                spawn: function(){
                    //spawn until the user is close or we finish spawning
                        //or we are attacked
                    var u = AI.user,
                        dist = u.distanceToUser,
                        ai = u.me.ai;

                    if(dist.isLow){
                        ai.addState('flee');
                        return;
                    }

                    if(u.myShields.value < u.me.gamePlay.attackThreshold){
                        ai.addState('attack');
                        return;
                    }

                    if(AI.count.total >= AI.config.maxRobots){
                        ai.changeState('wander');
                        return;
                    }
                },
                flee: function(){
                    //run until were at a safe distance
                    var u = AI.user,
                        ai = u.me.ai;

                    if(u.distanceToUser.isMedium){
                        ai.removeState();
                        return;
                    }
                },
            },
        },
        fireWeapon: function(){
            //add in our damage multiplier
            var bonuses = {
                damage: this.gamePlay.damageMultiplier,
                speed: this.gamePlay.projectileSpeed,
                //TODO: also add in a bonus from our upgrades
            };
            bonuses['immuneTo'] = [this.uid,'robot'];
                //dont kill other robots

            this.gamePlay.weapons[0].fire(bonuses);

            //stop attacking
            this.ai.removeState();
        },
    });
}