function weapon(){
    return updateSome(new displayObject(), {
        class: 'weapon',
        gamePlay: {
            spread: 0,
            launchCount: 1,
            launches: Bullet,
            rateOfFire: 30,
            cooldown: 0,
            speedMultiplier: 1,
            damageMultiplier: 1,
            rangeMultiplier: 1,
        },
        appearance: {
            sizeScale: {
                2: 150,
            },
        },
        fire: function(bonuses){
            /* bonuses avaiable
                damage:             boosts damage of projectile
                speed:              boosts speed of projectile
                range:              the time the projectile stays on the screen. Therefore distance traveled
                immuneTo:           people that is is immuneTo (override)
            */

            //reset the cooldown
            this.gamePlay.cooldown = this.gamePlay.rateOfFire;

            var projectile,
                a = this.appearance,
                p = this.physics,
                g = this.gamePlay,
                angles = [],
                count = g.launchCount,
                spread = g.spread;

            if(count === 1)
                angles = [spread];
            else {
                angles[count - 1] = 0; //last one
                angles[0] = spread; //first one
                for(var i = 1;i<count-1;i++) //account for the first and last already
                    angles[i] = spread / (count - 1) * i;
            }

            for(i=0;i<angles.length;i++){
                //we wont upgrade this to the objectFactory because we dont need it.
                //it would also get messy with the upgrades and stuff
                projectile = new this.gamePlay.launches;

                //bonus from the weapon and the user
                projectile.gamePlay.damage  *= (bonuses.damage || 1) * this.gamePlay.damageMultiplier;
                projectile.gamePlay.speed   *= (bonuses.speed || 1) * this.gamePlay.speedMultiplier;
                projectile.gamePlay.HP      *= (bonuses.range || 1) * this.gamePlay.rangeMultiplier;

                projectile = updateSome(projectile, {
                    appearance: {
                        position: a.position,
                        rotate: a.rotate,
                    },
                    gamePlay: {
                        immuneTo: bonuses.immuneTo || [variables.activeUser],
                    },
                    physics: {
                        velocity: [projectile.gamePlay.speed, (a.rotate + (angles[i] - spread / 2)).toRadians() * -1].toCartesian(),
                            //add in the angle spread and shift it over to split 0 instead of starting at 0
                    },
                });

                variables.interactingObjects[projectile.uid] = projectile;
                projectile.save();
            }
        },
    });
}
//	other weapon ideas:
//	flameThrower, missleLauncher, rocketLauncher, bomb, gatlingGun
