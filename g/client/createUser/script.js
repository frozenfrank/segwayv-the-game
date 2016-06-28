var fromPHP,target,updateSome,variables,authObject,functions,rand,database,location,$; //stupid warnings
function init(){
    console.log("Logged in as "+authObject.authData.email);
}
updateSome(authObject,{
    completeForm: function(){
        var selectedSprites = $('.objectBox:checked'),
            username = $('#username').val(),
            error = '';

        if(selectedSprites.length > 1) error += 'You can only pick one ship to be yours</br>';
        if(username === '') error += "You haven't picked a username!</br>";
        if(!this.authData) error += 'You need to login in before saving your choice</br>';

        if(error){
            console.warn(error);
            functions.userMessage(error.trim(),'validation');
            return;
        }

        //make it easy to change
        objectsRef.child(this.authData.uid).remove();
        this.generateSprite(selectedSprites[0].id,username);
    },
	generateSprite: function(sprite,username){
		var d = this.authData,
		    f = functions.objectFactory(sprite,{
                    //as much data as I can possibly harvest
                    appearance: undefined,
                    user: {
                        name: d.displayName,
                        email: d.email,
                        publicProfileImg: d.providerData[0].photoURL,
                        isAnonymous: d.isAnonymous,
                        username: username,
                    },
                    gamePlay: {
                        owner: d.uid,
                        provider: d.providerData[0].providerId,
                    },
                    uid: d.uid,
                });

        //safetyify it for firebase
		f = functions.standardizeForFirebase(f,true);

		database.child(d.uid).set(f).then(function(){
            //success message
            functions.userMessage("Successfully named your <b>"+sprite+
                "</b> as <b>"+username+"</b> and saved it to the account of <b>"+d.email+
                "</b></br><b>Redirecting you back to the game</b>",'success');

            //delayed redirecting back to the game to read the message
            setTimeout(function(){
                location = '../';
            },2000);
		}).catch(function(error){
			console.warn(error);
		});
	},
})
$(document).ready(function(){
    //now get the target --> after the doc has loaded
     target = document.getElementById('options-wrapper')

    //set of stats that will be displayed
    var stats = [
        {
            displayName: 'Shields',
            pathInSprite: 'gamePlay.maxShields',
            important: true,
        },
        {
            displayName: 'Shields Regen',
            pathInSprite: 'gamePlay.shieldRegen',
        },
        // {
        //     displayName: "Shield Burnout",
        //     pathInSprite: 'gamePlay.shieldBurnOut',
        //     inverted: true,
        // },
        {
            displayName: "Health",
            pathInSprite: 'gamePlay.maxHP',
            important: true,
        },
        {
            displayName: 'Max Speed',
            pathInSprite: 'gamePlay.speed',
            important: true,
        },
        // {
        //     displayName: "Rotate Speed",
        //     pathInSprite: 'gamePlay.rotateSpeed'
        // },
        {
            displayName: 'Mass',
            pathInSprite: 'physics.mass',
            important: true,
            inverted: true,
        },
        {
            displayName: 'Damage',
            pathInSprite: 'gamePlay.damageMultiplier',
            important: true,
        },
    ];
    //finish constructing the stats
    for(var i=0;i<stats.length;i++)
        updateSome(stats[i], {
            min: +Infinity,
            max: -Infinity,
            // sum: 0,
            // count: 0,
            // avg: function(){
            //     return this.sum / this.count;
            // }
        });

    //record the stats in all of the areas of interest
    var v,sprite,ii,ss;
    for(i=0;i<fromPHP.userObjects.length;i++){
        sprite = fromPHP.userObjects[i] = functions.objectFactory(fromPHP.userObjects[i]);
        if(!sprite.user.availableToPublic)
            if(!authObject.isOwnerLoggedIn()){ //allow me to see my rigged sprite
                fromPHP.userObjects.splice(i--,1);
                continue;
            }

        for(ii=0;ii<stats.length;ii++){
            ss = stats[ii], //statSet
            v = Object.byString(sprite,ss.pathInSprite); //value in this sprite

            ss.min = v < ss.min ? v : ss.min;
            ss.max = v > ss.max ? v : ss.max;
            // ss.sum += v;
            // ss.count++;
        }
    }

    //now generate all of the cards
    target.innerHTML = '';
    for(i=0;i<fromPHP.userObjects.length;i++) generateCard(fromPHP.userObjects[i]);

    //functions
    function generateCard(sprite){
        var u = sprite,
            value;

        value = "<input class='objectBox' type='checkbox' id='"+u.name+"'><label for='"+u.name+"'><div class='userObject'><div class='wrapper'><h1 class='title'>"+u.appearance.displayName+"</h1><div class='stat-bars'>";
        //generate the bars
        value += (function (sprite){
            var bars = '',ss,v;
            for(var i=0;i<stats.length;i++){
                ss=stats[i];
                v = Object.byString(sprite,ss.pathInSprite);

                //optionally add the important class
                //make the width change based on its percent of the maximum found for its category
                //and display it with its (formatted) name and number
                //invert the bar if were told to
                bars += "<div class='"+(ss.important ? "important" : '')+"'><div class='bar' style='width:"
                +((ss.inverted ? (ss.max - v + ss.min) : v ) / ss.max * 90)+"%'></div><div class='value'>"+ss.displayName+': '+v+"</div></div>";
            }
            return bars;
        })(u);
        value += "</div><div class='image'><img src='"+u.appearance.shape[1].src+"'></img></div><div class='summary'>"+u.user.summary()+"</div></div></div></label>";

        target.innerHTML += value;
    }
});