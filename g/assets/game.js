//define the segments of the firebase as global
var mainFirebase, database, gameServer, whitelistRef, objectsRef, pingsRef, messageRef;

var client = {
    resetObjects: function(hardReset) {
        //reset the objects to only be the signed-in user
        var v = variables;

        //clear the interactiveObjects first
        v.interactingObjects = {};

        if (!hardReset && v.constructedUser)
        //create me from the locale cache
        //return a promise to keep things consistent
            return new Promise(function(resolve, reject) {
            v.interactingObjects[v.activeUser] = v.constructedUser;
            resolve();
        });
        else
        //create me from the database
            return database.child(v.activeUser).once('value').then(function(snapshot) {
            var s = snapshot.val();

            v.interactingObjects[v.activeUser] = v.constructedUser = functions.objectFactory(s.name, s, {
                save: true
            });
        });
    },
    activate: function() {
        //called after we are whiteListed
        var v = variables,
            t = v.timeouts;

        if (v.debugFlags.showStagesPerformed)
            console.log(v.activeUser + ": We just got accepted to the game");

        client.resetObjects().then(function() {
            //restore the backup if there is one
            if (v.userBackup)
                v.interactingObjects[v.activeUser] = v.userBackup;

            //add event listeners that store the data on the locale client
            var saveLocation = function() {
                return v.interactingObjects[v.activeUser].user;
            };
            $('body').keydown(function(e) {
                if (!saveLocation().keyboard[e.keyCode]) { //only on the initial event
                    saveLocation().keyboard[e.keyCode] = [true, v.timeStamp]; //on the user (locale)
                    if (v.debugFlags.showKeyboardActions)
                        console.log(e.keyCode + ' is pressed');
                }
            });
            $('body').keyup(function(e) {
                delete saveLocation().keyboard[e.keyCode];
                if (v.debugFlags.showKeyboardActions)
                    console.log(e.keyCode + ' is released');
            });
            /* these dont work or aren't used anymore
            $('body').blur(function(){
                //I want to stop moving/firing when the window loses focus
                saveLocation().keyboard = {};
                if(true || v.debugFlags.showKeyboardActions)
                    console.log("The window lost focus");
            });
            $('body').mousemove(function(e){
                var pos = functions.getMousePos(e);
                if([pos.x,pos.y] !== [saveLocation().mouse.x,saveLocation().mouse.y]){
                    updateSome(saveLocation().mouse, {x:pos.x, y:pos.y});
                    if(v.debugFlags.showKeyboardActions)
                        console.log("Mouse is at: " + pos.x + ',' + pos.y);
                }
            });
            $('body').mousedown(function(){
                updateSome(saveLocation().mouse, {down: true}); //locale copy
                if(v.debugFlags.showKeyboardActions)
                    console.log("The mouse is down");
            });
            $('body').mouseup(function(){
                updateSome(saveLocation().mouse, {down: false}); //locale copy
                if(v.debugFlags.showKeyboardActions)
                    console.log("The mouse is up");
            });
            */

            //take some measures to ensure we dont get multiple of these called at once
            v.leaveGame = true;
            setTimeout(function() {
                v.leaveGame = false;

                var me = v.interactingObjects[v.activeUser];

                //initially add our user to the gameServer
                if (!v.singlePlayerMode)
                    v.activeUserGameServer.set(
                        functions.standardizeForFirebase(me, true)
                    );

                variables.timeouts.clear();

                me.respawn();
                setTimeout(gameLoop, v.gameSpeed);
                t.canvasClearing = setInterval(functions.clearCanvas, v.eraseFullBoardFrequency);
            }, v.gameSpeed * 3);
            //stoping the game for a few game cycles will force other threads
            //(for a lack of a better word) to stop running and only have this one going

            //tell the user
            functions.userMessage("You have been accepted into the game!<br><b>Good Luck :)</b>", 'success');
        }).catch(function(error) {
            functions.userMessage("Something bad happened while collecting your data :(",'error');
            throw error;
        });
    },
    deactivate: function() {
        var v = variables;

        if (v.debugFlags.showStagesPerformed)
            console.log(v.activeUser + ": We were just rejected/ejected from the game");

        //bring back the control buttons
        document.getElementById("control_buttons").style.display = '';

        //leave the game
        v.leaveGame = true; //maybe deprecated now...

        //clear timeouts
        v.timeouts.clear();

        //remove jQuery event handlers
        $('body').off();

        //create a backup in case the user gets re-accepted in the same session
        v.userBackup = v.interactingObjects[v.activeUser];

        //then delete it from the firebase which will cause it to be deleted from this client (and every other client)
        //we also should delete the objects that are owned by us --> thats for later
        v.activeUserGameServer.set(null);

        //alert the user
        functions.userMessage("You have been kicked from the game<br><b>Sorry...</b> Play nice next time, you'll make more friends", 'error');
    },
    join: function() {
        //ask to join the server
        functions.gameMessage({
            action: "join",
            target: "server"
        });
    },
    ping: function() {
        //we now add our own ping time --> instead of telling the server to
        pingsRef.child(variables.activeUser).set(firebase.database.ServerValue.TIMESTAMP);
    },
    waitForWhitelist: function() {
        //send an initial request
        client.join();

        //listen for our uid to be added to the whitelist
        //TODO: and not on the blacklist
        var v = variables;
        whitelistRef.on('child_added', function(snapshot) {
            if (snapshot.key === v.activeUser)
                if (snapshot.val() === true) client.activate();
                else if (snapshot.val() === false) client.deactivate();
            else console.warn("Weird value in the firebase");
        });
        whitelistRef.on('child_changed', function(snapshot) {
            if (snapshot.key === v.activeUser)
                if (snapshot.val() === true) client.activate();
                else if (snapshot.val() === false) client.deactivate();
            else console.warn("Weird data value in the firebase");
        });
        whitelistRef.on('child_removed', function(snapshot) {
            if (snapshot.key === v.activeUser) client.deactivate();
        });
    },
    listenToMessages: function() {
        var v = variables;
        messageRef.on('child_added', function(snapshot) {
            var s = snapshot.val();
            /*
            this will probably be the means of telling who killed who etc
                        if (s.target === "all" || s.target === v.activeUser) {
                            if (s.action === 'post') {
                                //    console.log(s.localeTimestamp,s.gameTimestamp,s.origin,s.target,s.message);
                            }
                        }
            */
            if (s.target === v.activeUser) {
                snapshot.ref.remove();
            }
        });
    },
    joinGameServer: function(serverName) {
        //some variables require special actions to apply their effects
        var v = variables,
            useVariables = function(variable) {
                switch (variable) {
                    case "canvasSize":
                        //change the width of the canvas
                        v.canvas.width = v.canvasSize[0];
                        v.canvas.height = v.canvasSize[1];
                        break;
                }
            };

        client.leaveGameServer();

        gameServer = mainFirebase.child("gameServer/" + serverName);

        whitelistRef = gameServer.child('whiteList');
        objectsRef = gameServer.child('interactingObjects/active');
        pingsRef = gameServer.child('lastPings');
        messageRef = gameServer.child('messages');

        v.activeUserGameServer = objectsRef.child(v.activeUser);

        //start pinging
        v.timeouts.ping = setInterval(client.ping, v.pingFrequency);

        //load and keep the initial game variables current
        gameServer.child("gameVariables").on('child_added', function(snapshot) {
            v[snapshot.key] = snapshot.val();
            useVariables(snapshot.key);
        });
        gameServer.child("gameVariables").on('child_changed', function(snapshot) {
            v[snapshot.key] = snapshot.val();
            useVariables(snapshot.key);
        });
    },
    leaveGameServer: function() {
        //TODO: kill any old connections
        /*
        gameServer.off();
        whitelistRef.off();
        objectsRef.off();
        pingsRef.off();
        messageRef.off();
        */

        console.log('TODO: cleanup');
    }
};
var serverHelper = {
    resizeCanvas: function(v) {
        gameServer.child("gameVariables/canvasSize").update(
            (function() {
                var el = document.getElementById(v.target), //element
                    w = el.querySelector("#width"),
                    h = el.querySelector("#height"),
                    size = [v.width || 0, v.height || 0];

                if (v.auto)
                    size = [window.innerWidth - 2, window.innerHeight - 2];
                else if (v.target)
                    size = [parseInt(w.value, 10), parseInt(h.value, 10)];

                var toReturn = {};

                if (size[0] > 0 && !isNaN(size[0])) {
                    toReturn[0] = size[0];
                    w.value = size[0];
                }
                if (size[1] > 0 && !isNaN(size[1])) {
                    toReturn[1] = size[1];
                    h.value = size[1];
                }
                return toReturn;
            })()
        );
    },
    cleanUsers: function() {
        console.log("cleaning users");
        pingsRef.child(variables.activeUser).set(firebase.database.ServerValue.TIMESTAMP).then(function() {
            // first set the my last check in time to the firebase as the servervalue.timestamp --> this is the current time
            pingsRef.once('value').then(function(data) {
                //download all of the pings
                var d = data.val();

                for (var user in d) {
                    if (!d.hasOwnProperty(user))
                        continue;

                    if (d === variables.activeUser)
                        continue; //dont kick the server off

                    if (d.server - d[user] > variables.pingAllowance + variables.pingFrequency)
                        serverHelper.bootUser(user); //kick them off if they have been inactive
                }
            });
        }).catch(function(error) {
            console.error(error);
        });
    },
    bootUser: function(uid) {
        whitelistRef.child(uid).remove();
        objectsRef.child(uid).remove();
        // pingsRef.child(uid).remove();
        console.log("removed:", uid);
    },
    acceptUser: function(uid) {
        //add the user to the whitelist
        whitelistRef.child(uid).set(true);
        if (variables.debugFlags.showStagesPerformed)
            console.log("accepted " + uid + " to the game");
    },
    startServer: function() {
        //just to be the computer that is accepting people to the server
        //require password
        if (!authObject.isOwnerLoggedIn())
            if (!authObject.ownerLogin()) {
                functions.userMessage("Sorry, you can't start a server", 'error');
                return;
            }

        $('#control_buttons > #start').html("Server started");
        variables.activeUser = 'server';

        //listen for new messages and act on them (to accept them to the game)
        messageRef.on('child_added', function(snapshot) {
            var s = snapshot.val();
            if (s.target === 'server') {
                switch (s.action) {
                    case 'join':
                        serverHelper.acceptUser(s.origin);
                        break;
                }
            }
            if (s.target === variables.activeUser)
                snapshot.ref.remove(); //delete the message after reading it
        });

        //clean up the old users
        setTimeout(function() {
            setInterval(serverHelper.cleanUsers, variables.cleanUsersFrequency);
        }, 20000); //wait a period of time initially to just let things settle down :)
    },
};

//place holders - import this data from the firebase database
//default values for playing singleplayer before joining a gameServer
var variables = {
    accelerationConst: 7,
    activeUser: 'generic',
    canvasID: 'canvas',
    debugFlags: {},
    display: {
        HPbar: {
            HPcolor: {
                absent: "#B21000",
                present: "#09B256"
            },
            bottom_pad: 1.5,
            height: 12,
            left_pad: 2,
            shieldColor: {
                absent: "#B28400",
                present: "#003BA8"
            },
            dodgeColor: {
                absent: "#67147F",
                present: "#FFDB30"
            },
            weaponColor: {
                absent: "#FF6125",
                present: "#00AB8C"
            },
            width: 150,
            x_offset_near_sides: 50,
            y_offset: 100,
            y_offset_at_top: -160
        },
        profilePic: {
            size: 35,
            x_offset: -120,
            y_from_HPbar: 22
        },
        usernameColor: "#fff"
    },
    eraseFullBoardFrequency: 1500,
    gameSpeed: 20,
    interactingObjects: {},
    leaveGame: false,
    projectileSaveFrequency: 60,
    reduceRammingDmg: 8,
    singlePlayerMode: false,
    sizeScale: 100,
    timeStamp: 0,
    timeouts: {
        clear: function() {
            //function to remove all timeouts/intervals that were stored in the timeouts object
            var t = variables.timeouts;
            for (var timeout in t)
                if (typeof t[timeout] === 'number')
                    clearTimeout(t[timeout]);
        },
    },
}


function gameLoop() {
    var v = variables;
    if (v.leaveGame) return;

    //reset the log
    //**work
    if (v.singlePlayerMode)
        AI.user.stateLog.innerHTML = '';

    for (var i in v.interactingObjects) {
        // only act on the objects that we created, this would also allow delegation of computation
        var obj = variables.interactingObjects[i],
            ap = obj.appearance,
            p = obj.physics,
            pos = ap.position,
            isDead = false;
        //now we flag when its dead and kill it at the end instead of actually killing it
        //at some random point in the loop

        //erase its old position
        obj.erase();

        isDead = obj.gameCycle(); //this is critical!

        if (!isDead && obj.gamePlay.HP <= 0)
            isDead = true; //check for 0 hitpoints

        //collision detection
        if (!isDead && obj.isOwner() && (obj.class === 'userObject' || obj.class === 'robot')) {
            //only do collision on robots and users
            //and only on the owner
            var thisCorners = p.hitBox.corners.toPolygonPathForm(ap.position, ap.sizeScale[2]),
                thatCorners, thatObj, thatAP,
                id = obj.uid;

            for (var thatSprite in v.interactingObjects) {
                if (id === thatSprite)
                    continue;

                thatObj = v.interactingObjects[thatSprite];

                //id & class immunity
                if (thatObj.gamePlay.immuneTo.indexOf(id) !== -1) continue;
                if (thatObj.gamePlay.immuneTo.indexOf(obj.class) !== -1) continue;

                thatAP = thatObj.appearance;
                thatCorners = thatObj.physics.hitBox.corners.toPolygonPathForm(thatAP.position, thatAP.sizeScale[2], thatAP.rotate.toRadians());

                //convert to sat.js --> idk how important that is though
                if (doPolygonsIntersect(thisCorners, thatCorners)) {
                    //both objects need to react
                    obj.collideWith(thatObj);
                    thatObj.collideWith(obj);
                }
            }
        }

        //error checking --> make sure the object does not leave the bounds
        if (!isDead) {
            var y2t = (ap.sizeScale[2] * p.hitBox.simple[0]) * -1,
                x2r = (ap.sizeScale[2] * p.hitBox.simple[1]) * +1,
                y2b = (ap.sizeScale[2] * p.hitBox.simple[2]) * +1,
                x2l = (ap.sizeScale[2] * p.hitBox.simple[3]) * -1,
                passingObj = {
                    top: y2t,
                    bottom: y2b,
                    left: x2l,
                    right: x2r,
                };
            //y (axis) [distance] to top, x to right, y to bottom, x to left
        }

        //collisions with the walls
        if (!isDead && pos[0] < x2l) isDead = obj.leaveArena('left', passingObj);
        if (!isDead && pos[0] > v.canvas.width - x2r) isDead = obj.leaveArena('right', passingObj);
        if (!isDead && pos[1] < y2t) isDead = obj.leaveArena('top', passingObj);
        if (!isDead && pos[1] > v.canvas.height - y2b) isDead = obj.leaveArena('bottom', passingObj);

        if (isDead) isDead = obj.die();
    }

    functions.renderWorld();
    v.timeStamp++;
    setTimeout(gameLoop, v.gameSpeed);
}