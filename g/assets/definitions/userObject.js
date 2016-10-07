function userObject() {
	return updateSome(new displayObject(), {
		class: 'userObject',
		appearance: {
			sizeScale: {
				0: 0.8 * variables.sizeScale,
				1: 1.3 * variables.sizeScale,
				2: 1.0 * variables.sizeScale,
			},
		},
		gamePlay: {
			buttonMapping: {
				cw: 82, //change weapon
				cw_last_pressed: -1, //utility
				up: [38, 87], //up
				dn: [40, 83], //down
				lt: [37, 65], //left
				rt: [39, 68], //right
				fi: 32, //fire
				sb: 81, //size bigger
				ss: 69, // "" smaller
				dl: 90, //dodge left
				dr: 67, //dodge right
			},
			HP: 1500,
			maxHP: 2000,
			resizeSpeed: 15,
			rotateSpeed: 5,
			shieldRegen: 5,
			shieldBurnOut: 125,
			currentShieldBurnOut: 0,
			maxShields: 300,
			dodging: {
				dodgeDistance: 12,
				extraSpeed: 5,
				rechargeTime: 21,
				current: 0, //utilities
				currentRecharge: 0,
			},
			speed: 15,
			damageMultiplier: 1,
			projectileSpeed: 1,
			weaponKeywords: ['Sniper', 'Sword', 'GrenadeLauncher', 'TestWeapon', 'Lazer'],
			isDead: false,
		},
		physics: {
			mass: 300,
			userVelocity: [0, 0],
		},
		user: {
			keyboard: {},
			level: 0,
			mouse: {
				x: 0,
				y: 0,
				down: false,
			},
			name: 'Johnny Appleseed',
			stats: {
				dateCreated: firebase.database.ServerValue.TIMESTAMP,
				lastLogin: firebase.database.ServerValue.TIMESTAMP,
				stats: 'other stats',
				totalTimePlayed: 0,
			},
			upgrades: {
				damageBoost: 1,
			},
			username: 'J. Appleseed',
			xp: 0,
			xpNeeded: 4000,
			publicProfileImg: 'assets/images/defaultProfilePic.png',
			availableToPublic: true,
			summary: function() {
				return "This is a very fast ship with moderate sheilds, but damage to destroy all enemies forever!";
			},
		},
		minimalToRender: {
			// appearance: false,
			gamePlay: {
				shields: true,
				weaponKeywords: true,
				HP: true,
			},
			physics: {
				velocity: true,
			},
			user: {
				publicProfileImg: true,
				username: true,
			},
		},
		leaveArena: function(direction, extras) {
			var p = this.physics,
				pos = this.appearance.position,
				can = variables.canvas;

			switch (direction) {
				case 'left':
				case 'right':
					p.velocity[0] = 0;
					pos[0] = direction === 'left' ? extras[direction] : can.width - extras[direction];
					//account for the top of full canvas width
					break;
				case 'top':
				case 'bottom':
					p.velocity[1] = 0;
					pos[1] = direction === 'top' ? extras[direction] : can.height - extras[direction];
					//ditto, height
					break;
			}

			this.physics = p;
			this.appearance.position = pos;
			// console.log(this.uid, ": left the", direction, 'arena!');
		},
		gameCycle: function() {
			//wrapper to allow robots to use it also
			if(this.gamePlay.isDead)
				return; //stop doing everything while dead

			this.applyGameLogic();

			if (this.isOwner())
			// if(variables.timeStamp % (1 || variables.userSaveFrequency) === 0)
				this.save();
		},
		applyGameLogic: function() {
			//shorthand
			var obj = this,
				v = variables,
				ap = obj.appearance,
				pos = ap.position,
				g = obj.gamePlay,
				d = g.dodging,
				w = g.weapons,
				p = obj.physics,
				up = this.isPressed('up'),
				dn = this.isPressed('dn'),
				lt = this.isPressed('lt'),
				rt = this.isPressed('rt'),
				dr = this.isPressed('dr'),
				dl = this.isPressed('dl'),
				fi = this.isPressed('fi'),
				speed,
				i;

			//things that only happen on the owner object
			if (this.isOwner()) {
				//keenan's new userMovent plan
				//Rotate: only change your rotation with the buttons
				if (lt + rt === 1){
					if (lt) ap.rotate -= g.rotateSpeed;
					else ap.rotate += g.rotateSpeed;
				}

				//clean the angle and dont fire directly into walls
				//maybe you should be allowed to shoot into the walls
				if ((ap.rotate = ap.rotate.cleanAngle()) % 90 === 0)
					++ap.rotate;

				//movement rules:
					//only move towards where you are facing
					//dont move if pressing both btns --> maybe change so that you can 'creep' forward
					//move slower when backing up
					//move slower when firing
				p.userVelocity = [g.speed * (up - dn) * (dn * 0.5 || 1) * (fi * 0.5 || 1), ap.rotate.toRadians()].toCartesian();

				//movement: but move sideways with a press of the dodge buttons, with a delay between each dodge
				if(d.currentRecharge > 0){
					--d.currentRecharge;
				}else if(d.current !== 0){
					if(d.current > 0)		--d.current;
					else					++d.current;

					var direction = d.current > 0 ? 1 : -1;
					//turn on boosters to slow down at the end
					if(Math.abs(d.current) <= 3)
						direction *= -1;

					var dodge = [d.extraSpeed * g.speed * direction /* insert timing function here */, (ap.rotate + 90).toRadians()].toCartesian();

					p.userVelocity[0] += dodge[0];
					p.userVelocity[1] += dodge[1];

					//introduce a wait time before going again
					if(d.current === 0)
						d.currentRecharge = d.rechargeTime;
				}else if(dl + dr === 1){
					d.current = d.dodgeDistance * (dr - dl);
				}

				//change in size: for each of these, each iteration should move a certain percent
				var sm = this.isPressed('ss'), //size smaller
					sb = this.isPressed('sb');

				resizing: if (sm + sb === 1) {
						var ss = ap.sizeScale,
							sizeChangeSpeed = (ss[1] - ss[0]) / g.resizeSpeed;

						//change size
						if (sm) sizeChangeSpeed *= -1;

						//keep size within limits
						if (sm && ss[0] >= ss[2]) break resizing;
						if (sb && ss[1] <= ss[2]) break resizing;

						//EFFECTS!
						//balancing multipliers
						var hpMultiplier = 25,
							otherMultiplier = 0.04,
							hpPercent = g.HP / g.maxHP; //cache this

						//as you get bigger you also...
						//** work **
						ss[2] += sizeChangeSpeed; //get bigger
						g.maxHP -= sizeChangeSpeed * hpMultiplier; //lose max hp
						g.maxShields -= sizeChangeSpeed * hpMultiplier; //lose max shields
						g.shieldRegen -= sizeChangeSpeed * otherMultiplier * 1.1; //lose shield regen
						g.speed -= sizeChangeSpeed * otherMultiplier * 4; //lose speed
						g.damageMultiplier += sizeChangeSpeed * otherMultiplier; //increase dmg

						g.HP = hpPercent * g.maxHP; //keep hp at the same %
						//we could do the same thing for the shields, but i wont because that would be easy to abuse
					}

				//launch projectiles & decrease weapon cooldowns
				if ((--w[0].gamePlay.cooldown) <= 0 && fi)
					this.fireWeapon();

				//swap weapons
				if (this.isPressed('cw') && g.cw_last_pressed !== (i = this.isPressed('cw', true))) {
					g.cw_last_pressed = i;
					this.changeWeapon();
				}

				speed = v.accelerationConst / p.mass;

				//use exponential growth to simulate acceleration
				// p.velocity = p.userVelocity; //bypass the acceleration
				p.velocity[0] += speed * (p.userVelocity[0] - p.velocity[0]);
				p.velocity[1] += speed * (p.userVelocity[1] - p.velocity[1]);
			}

			//regain some shields
			if (this.isOwner())
				if (g.currentShieldBurnOut-- <= 0) g.shields += g.shieldRegen; //only regen if its not burned out
			g.shields = Math.min(g.shields, g.maxShields); //only allow the alloted shields

			//check HP
			g.HP = Math.min(g.HP, g.maxHP);

			//apply the velocity to the position for rendering
			pos[0] += p.velocity[0];
			pos[1] += p.velocity[1];
		},
		isPressed: function(code, returnTimestamp) {
			var bt = this.gamePlay.buttonMapping;
			return functions.isPressed(bt[code], returnTimestamp);
		},
		draw: function() {
			if(this.gamePlay.isDead)
				return; //stop drawing while dead

			//render me
			functions.renderObject(this.appearance);

			//render my weapon
			functions.renderObject(updateSome(this.gamePlay.weapons[0], {
				appearance: {
					//make sure that it is where we are
					position: this.appearance.position,
					rotate: this.appearance.rotate,
				},
			}).appearance);

			var vars = variables.display,
				ctnr = vars.HPbar, //container
				ctx = variables.context,
				pos = this.appearance.position,
				barHeight = ctnr.height,
				barWidth = ctnr.width,
				bars = [],
				bar,
				g = this.gamePlay,
				d = g.dodging,
				xGive = ctnr.width / 2,
				yGive = ctnr.y_offset + barHeight * 1.5,
				reposition = [0, 0];

			//shift the bars to the center when close to the outside
			if (pos[0] < xGive) reposition[0] = xGive - pos[0];
			else if (variables.canvas.width - pos[0] < xGive) reposition[0] = variables.canvas.width - pos[0] - xGive;
			if (pos[1] < yGive) reposition[1] = +ctnr.y_offset * 1.9;

			//**work optimize this --> we dont need to set it every time for every object (probably)
			ctx.setFontSize(barHeight + 'px');

			bars.push({
				present: ctnr.HPcolor.present,
				absent: ctnr.HPcolor.absent,
				percent: g.HP / g.maxHP,
				text: Math.round(g.HP) + " / " + Math.round(g.maxHP),
			}); //HP bar

			var shieldMsg = '';
			shieldMsg = (g.currentShieldBurnOut > 0 && this.isOwner()) ? //only the owner can see this info
				//ulterior motive: i didn't want to send g.currentShieldBurnOut over the bandwidth AND it caused bugs
				"Burned out for: " + Math.ceil(g.currentShieldBurnOut / 10) :
				shieldMsg = Math.round(g.shields).min(0) + " / " + Math.round(g.maxShields).min(0);

			bars.push({
				present: ctnr.shieldColor.present,
				absent: ctnr.shieldColor.absent,
				percent: g.shields / g.maxShields,
				text: shieldMsg,
			}); //shields bar

			if (this.isOwner() && this.class === 'userObject') {
				//only the active user can see the cooldown remaining:
				//save bandwidth
				//identify yourself amoung the rest of the users
				var w = g.weapons[0],
					wg = w.gamePlay;
				bars.push({
					present: ctnr.weaponColor.present,
					absent: ctnr.weaponColor.absent,
					percent: (wg.rateOfFire - wg.cooldown.min(0)) / wg.rateOfFire,
					text: w.name,
				});
			} //weapon bar

			//show dodging
			if (d.current !== 0 || d.currentRecharge !== 0) {
				bars.push({
					present: ctnr.dodgeColor.present,
					absent: ctnr.dodgeColor.absent,
					//**work --> it does something wrong when dodging to the left
					percent: (d.current ? Math.abs(d.current) + d.rechargeTime : d.currentRecharge) / (d.dodgeDistance + d.rechargeTime),
					text: 'Moving Sideways!',
					backwards: d.current < 0,
				});
			}


			//draw all of the bars based on the array
			ctx.textAlign = 'start';


			for (var i = 0; i < bars.length; i++) {
				/*
				    each array element is stacked on top of the element before it
				    every element should be an object with these properties:
				        absent:     the color to be where the missing stuff is
				        present:    the color to be everywhere else
				        percent:    percent of the full bar that should be covered up
				        text:       text to be displayed in the bar
				        backwards:  optional: start the bar from the right side. default: false
				*/
				bar = bars[i];
				ctx.fillStyle = bar.absent || 'white';
				ctx.fillRect(
					pos[0] + reposition[0] - barWidth / 2,
					pos[1] + reposition[1] - ctnr.y_offset - barHeight * i, //stack the bars vertically starting at the bottom
					barWidth,
					barHeight
				);
				ctx.fillStyle = bar.present || 'black';
				if (bar.backwards) {
					var width = barWidth * bar.percent.minMax(0, 100);
					ctx.fillRect(
						pos[0] + reposition[0] - barWidth / 2 + (barWidth - width),
						pos[1] + reposition[1] - ctnr.y_offset - barHeight * i,
						width,
						barHeight
					);
				} else {
					ctx.fillRect(
						pos[0] + reposition[0] - barWidth / 2,
						pos[1] + reposition[1] - ctnr.y_offset - barHeight * i, //ditto
						barWidth * bar.percent.minMax(0, 100), //we only cover up part of it
						barHeight
					);
				}
				//write the text
				if (bar.text) {
					ctx.fillStyle = vars.usernameColor;
					ctx.fillText(
						bar.text,
						pos[0] + reposition[0] - barWidth / 2 + ctnr.left_pad,
						pos[1] + reposition[1] - ctnr.y_offset - barHeight * (i - 1) - ctnr.bottom_pad
					);
					//maybe this could be optimized by going through the loop twice to avoid multiple switches
				}
			}

			//then write our username
			ctx.textAlign = 'center';
			ctx.fillText(
				this.user.username,
				pos[0] + reposition[0],
				pos[1] + reposition[1] - ctnr.y_offset - barHeight * bars.length
			);

			//draw our profile pic
			var profileImg = new Image,
				picVar = vars.profilePic;

			profileImg.src = this.user.publicProfileImg;
			ctx.drawImage(
				profileImg,
				pos[0] + reposition[0] + picVar.x_offset,
				pos[1] + reposition[1] - picVar.y_from_HPbar - ctnr.y_offset,
				picVar.size,
				picVar.size);
		},
		erase: function() {
			//erase me
			functions.renderObject(this.appearance, true);

			//erase my weapon
			functions.renderObject(this.gamePlay.weapons[0].appearance, true);

			//erase my pic and stat bars and username
			var pos = this.appearance.position,
				d = variables.display,
				bar = d.HPbar,
				ctnr = bar,
				xMin = Math.max(bar.width / 2, d.profilePic.x_offset * -1) * -1,
				//2 for HP and shields
				//2 to account for the blank space and the username
				//1 more for the dodging
				barCount = 5,
				xGive = bar.width / 2,
				yGive = bar.y_offset + bar.height * 1.5,
				reposition = [0, 0];

			if (this.isOwner() && this.class === 'userObject')
				barCount++; //account for the cooldown bar

			var height = bar.height * barCount;
			var width = xMin * -1 + bar.width / 2;

			//erase from the correct position
			if (pos[0] < xGive) reposition[0] = xGive - pos[0];
			else if (variables.canvas.width - pos[0] < xGive) reposition[0] = variables.canvas.width - pos[0] - xGive;
			if (pos[1] < yGive) reposition[1] = +ctnr.y_offset * 1.9;

			//there was some strange positioning on the y-axis
			//erase the info box above our heads with a 1 px clearance on every side to be safe
			variables.context.clearRect(xMin + pos[0] + reposition[0] - 1, pos[1] + reposition[1] - bar.y_offset - (height - bar.height) + 1, width + 2, height + 2);
		},
		fireWeapon: function() {
			//add in our damage multiplier
			var bonuses = {
				damage: this.gamePlay.damageMultiplier,
				speed: this.gamePlay.projectileSpeed,
				//TODO: also add in a bonus from our upgrades
			};
			if (this.class === 'robot')
				bonuses['immuneTo'] = [this.uid, 'robot'];
			//dont kill other robots

			this.gamePlay.weapons[0].fire(bonuses);
		},
		changeWeapon: function() {
			var g = this.gamePlay,
				w = g.weapons,
				wKeys = g.weaponKeywords;

			//do the shifting
			w.move(0, -1);
			wKeys.move(0, -1);
			w[0].gamePlay.cooldown = w[0].gamePlay.rateOfFire; //reset the cooldown

			//i know that this leads to bugs when reloading the browser multiple times
			if(!variables.singlePlayerMode)
				variables.activeUserGameServer.child('gamePlay/weaponKeywords/0').set(w[0].name); //save
			// console.log(id + " just swapped weapons");
		},
		takeDamage: function(damage) {
			var g = this.gamePlay,
				thisHP = g.HP,
				thisSH = g.shields;

			if (!this.isOwner())
				return; //for the cross user, dont kill them from another machine

			//I dont need this anymore because its actually pretty common
			// if (thisSH < 0)
			// 	console.log("negetive sheilds!");

			if (damage <= thisSH && g.currentShieldBurnOut <= 0)
				thisSH -= damage; //if we can take all of the damage from the shield
			else {
				thisSH = 0; //if not, then we dont have any shields
				if (g.currentShieldBurnOut <= 0)
					g.currentShieldBurnOut = g.shieldBurnOut;
				//I would like for it to start with full shields again
				//lets not compound the problem for the user

				var remainingDamage = damage - thisSH;
				thisHP -= remainingDamage;
			}

			//idk why i need these, i just want the things to pass by reference
			//UPDATE: its because thisHP and thisSH are numbers so they are passed by value;
			//but ill keep it that way because i dont see a good reason to change it
			this.gamePlay.HP = thisHP;
			this.gamePlay.shields = thisSH;
		},
		collideWith: function(otherOBJ) {
			var movement = [this.gamePlay.speed / this.physics.mass],
				pos = this.appearance.position,
				thatPos = otherOBJ.appearance.position,
				thatg = otherOBJ.gamePlay;

			switch (otherOBJ.class) {
				case 'projectile':
					this.takeDamage(otherOBJ.gamePlay.damage);
					break;
				case 'userObject':
				case 'robot':
					//move away from the collision
					movement[1] = getStandardAngle(pos[0], pos[1], thatPos[0], thatPos[1]).toRadians();
					movement = movement.toCartesian();

					//actually move
					this.physics.velocity[0] += movement[0];
					this.physics.velocity[1] += movement[1];

					//damage computations
					//TODO: find a better way to deal with ramming damage
					this.takeDamage(thatg.HP * thatg.damageMultiplier / variables.reduceRammingDmg);
					break;
				default:
					console.warn(otherOBJ.class, "unknown class of other object");
			}
		},
		die: function() {
			//de-clutter the screen
			this.erase();

			//dont kill us from another machine
			if (!this.isOwner())
				return;

			//mark as dead
			this.gamePlay.isDead = true;

			//tell the user
			functions.modalBox({
				color: 'red',
				modal: true,
				icon: 'life-saver',
				message: "You just died! Respawn...",
				onclick: function(){
					variables.interactingObjects[variables.activeUser].respawn();
					//TODO: force a time period to pass
				},
			});
		},
		respawn: function() {
			var g = this.gamePlay,
				pos = this.appearance.position;

			//unmark as dead
			g.isDead = false;

			//reset your shields
			g.HP = g.maxHP;
			g.shields = g.maxShields;
			g.currentShieldBurnOut = 0;

			//respawn somewhere else
			//TODO: dont spawn near enemies, maybe means making ships smaller
			this.appearance.rotate = rand(0, 360);
			pos[0] = rand(0, variables.canvasSize[0]);
			pos[1] = rand(0, variables.canvasSize[1]);

			//zero out velocity
			this.physics.velocity = [0, 0];
			this.physics.userVelocity = [0, 0];
		},
		onCompleteConstruction: function() {
			var g = this.gamePlay,
				wKeys = g.weaponKeywords;

			//construct the weapons
			g.weapons = [];
			for (var i in wKeys)
				if (isNaN(parseInt(i, 10)) === false)
					g.weapons[i] = functions.objectFactory(wKeys[i]);

				//completely fill the health and shield bars
			g.HP = g.maxHP;
			g.shields = g.maxShields;
		},
	});
}