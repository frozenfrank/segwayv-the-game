<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Segwayv the Game</title>
	<link rel='shortcut icon' href='favicon.ico' type='image/x-icon'/>

	<!--google fonts-->
	<link href='https://fonts.googleapis.com/css?family=Ranchers|Roboto:400|Electrolize' rel='stylesheet'/>

	<!--font awesome-->
	<!--TODO: combine these stylesheets-->
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet"/>
	<link href="https://netdna.bootstrapcdn.com/font-awesome/3.2.0/css/font-awesome.css" rel="stylesheet"/>

	<!--jQuery 2.2.0 -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>

	<!--angular 1.5.7-->
	<!--angular: ngSanitize-->
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/angular-sanitize/1.5.8/angular-sanitize.min.js"></script>

	<!--firebase 3.2.0-->
	<script src="https://www.gstatic.com/firebasejs/3.2.0/firebase.js"></script>
	<!--<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>-->
	<!--<script src="https://apis.google.com/js/platform.js" async defer></script>-->

	<!-- AngularFire 2.0.1 -->
	<script src="https://cdn.firebase.com/libs/angularfire/2.0.1/angularfire.min.js"></script>

	<!--Firechat-->
	<!--<link rel='stylesheet' href='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.css'/>-->
	<!--<script src='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.js'></script>-->

	<!--tracking scripts-->
	<script>
		//development segwayv facebook app
		window.fbAsyncInit=function(){FB.init({appId:'180067475769760',xfbml:true,version:'v2.7'});};
		(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id)){return;}
		js=d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));

		//segwayv (minimized) facebook
		window.b=function(){FB.c({a:"393442104112984",f:!0,version:"v2.6"})};var a,c=
		document.getElementsByTagName("script")[0];document.getElementById("facebook-jssdk")
		||(a=document.createElement("script"),a.id="facebook-jssdk",
		a.src="//connect.facebook.net/en_US/sdk.js",c.parentNode.insertBefore(a,c));

		//google analytics
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-75806746-1', 'auto');ga('send', 'pageview');

		//go squared
		!function(g,s,q,r,d){r=g[r]=g[r]||function(){(r.q=r.q||[]).push(
		arguments)};d=s.createElement(q);q=s.getElementsByTagName(q)[0];
		d.src='//d1l6p2sc9645hc.cloudfront.net/tracker.js';q.parentNode.
		insertBefore(d,q)}(window,document,'script','_gs');
		_gs('GSN-825728-Y');
	</script>
</head>
<body ng-app='segwayv' ng-controller='angularController' id='app' noscroll='arena credits' class='{{ currentMode }} {{ authObject.owner.isOwner ? "owner" : "" }}'>
	<div id="wrapper" style='position: absolute; height: 100%; width: 100%;'>
		<div id='features'>
			<div id='gameTitle' modes='mainMenu lobby'>Segwayv&nbsp;the&nbsp;Game</div>
			<div id='mainMenuBtn' modes='singleplayer multiplayer arena lobby credits createUser' ng-click='mainMenu()' class='arrow_box'>&#8668; Main Menu <small>from: {{ currentMode }}</small></div>
			<div id='top-left-features'>
				<div id='stateLog' ng-show='authObject.owner.isOwner' modes='arena'></div>
				<div id='userInfo' modes='mainMenu multiplayer lobby createUser'>
					<div ng-hide='authObject.authData' class='signedOut'>
						<h2>Login</h2>
						<div>
							<!-- [name to pass to login [, fa icon to use]] -->
							<div ng-repeat='authService in [["google"],["facebook"],["twitter"],["github"],["anonymous","user-secret"]] track by $index' ng-click='authObject.login({app:authService[0]})' class='loginOption'>
								<i class='fa fa-fw fa-{{ authService[1] || authService[0] }}'></i>
								<p>{{ authService[0] }}</p>
							</div>
						</div>
					</div>
					<div ng-show='authObject.authData' class='singedOut'>
						<img src='{{ authObject.authData.photoURL || authObject.authData.providerData[0].photoURL || "assets/images/defaultProfilePic.png" }}'/>
						<span>
							<h2>{{ authObject.name() }}</h2>
							<button ng-show='authObject.authData' ng-click='authObject.logout()' class='gleaming'>Logout</button>
							<!-- <button ng-show='authObject.owner.isOwner' ng-click='authObject.owner.login()'>Login as Owner</button> -->
							<button ng-show='authObject.owner.isOwner' ng-click='authObject.owner.logout()'>Logout as Owner</button>
						</span>
					</div>
				</div>
				<div id='help-tip' ng-hide='authObject.owner.isOwner' modes='mainMenu arena multiplayer createUser'>
					<al modes='mainMenu'>
						<p>Your goal is to sign into the computer and then pick a mode to play in. Your choice is non-committal, so dont hesitate.</p>
						<p>Step 1: Sign in. Click <code>Sign in with Google</code> and an auth box will pop up asking you to "sign in with Google".</p>
						<p>Step 2: It will probably redirect you to a page to pick the user that you want to be and to pick a username.</p>
						<p>Step 3: Pick a mode to play in. For the sake of the tutorial, please pick singleplayer mode.</p>
					</al>
					<al modes='arena'>
						<h2><i class='fa fa-paper-plane fa-fw'></i>You, your goal &amp; your ship</h2>
						<p>Your ship is the one on the screen with your <b>profile picture</b> next to it and your <b>username</b> next to it. You're ship also has three stat bars above it instead of two on the others.</p>
						<p ng-show="readExternal('variables').singlePlayerMode">In singleplayer mode, the objective of the game is to be the <b>last one standing</b>, which means eliminating all of the AI's from the game. The robots don't have any more controls than you, so the only they advantage have over you is experience (I made him with my very experienced hand).</p>
						<p ng-hide="readExternal('variables').singlePlayerMode">In multiplayer mode, the objective is to kill enemies times more than they kill you. Remember to be nice because you opponents are <b>real people</b> with human emotions somewhere else in the world.</p>
						<h2><i class='fa fa-sliders fa-fw'></i>Stat Bars:</h2>
						<ol>
							<li>The first turquoise bar represents your <b>weapon</b>. It provides you with the name of the weapon and the time left until you can fire again. Each weapon has a different rate of fire.</li>
							<li>The second bar is blue and represents the <b>shields</b> on your ship. Shields protect you from damage and <b>automatically regenerate</b> over time.</li>
							<li>The green bar on the bottom indicates your <b>HP</b> (Hit Points or Health Points). Damage taken here <b>is lost forever</b>, but you will respawn if you die.</li>
						</ol>
						<h2><i class='fa fa-gamepad fa-fw'></i>Controls</h2>
						<p>The controls use a common ASDW (or &#8593;&#8595;&#8592;&#8594;) layout with few extra keys for more functionality. You will want to know these:</p>
						<table><tbody>
							<tr><td colspan='2' hint>Normal stuff</td></tr>
							<tr><td>A | &#8592;</td><td>rotate your ship to the left (counter-clockwise)</td></tr>
							<tr><td>D | &#8594;</td><td>rotate your ship to the right (clockwise)</td></tr>
							<tr><td>W | &#8593;</td><td>move forwards (to where you're facing)</td></tr>
							<tr><td>S | &#8595;</td><td>move backwards (from where you're facing)</td></tr>
							<tr><td><bracket>[</bracket>space<bracket>]</bracket></td><td>fire your weapon</td></tr>
							<tr><td colspan='2' hint>Extra functionality</td></tr>
							<tr><td>R</td><td>change the weapon that you fire</td></tr>
							<tr><td>Q</td><td>increase the size of your ship. This also increases damage, but decreases speed, max shields, and max HP</td></tr>
							<tr><td>E</td><td>the inverse of Q</td></tr>
							<tr><td>Z</td><td>dodge to the left</td></tr>
							<tr><td>C</td><td>dodge to the right</td></tr>
						</tbody></table>
					</al>
					<al modes='createUser'>
						<p>This screen is designed to help you choose the space ship that you like the best and will give you the best fit to your personality. In a perfect world, they are all equal in the end. But the world is not perfect and I'm only a HS student so there are a few that need to be altered.</p>
						<p>Click on a few sprites to "select them". They will turn purple. If you already know which one you want, you can select <b>exactly one</b> and then continue. If not, select a few and then click the button at the top. This will hide all of the sprites that you didn't select and give you more detail on the one that you did. At this point, <b>deselect</b> the sprites that you don't want (process of elimination) until you have <b>one</b> sprite. Now continue.</p>
						<p>Now type your favorite username. A random on is provided as a placeholder, but you are not obligated to use it. Now just click continue!</p>
					</al>
					<al modes='multiplayer'>
						<h2>Explaination</h2>
						<p>This mode has all of the same controls and singleplayer mode except that you're not fighting a robot. You are now fighting other users from around the globe. Your controls remain the same.</p>
						<p>You might not be able to play in this mode because of some technical difficulties.</p>
						<p>If you are an owner of the game, you can solve the problem yourself by starting a server.</p>
						<h2>Techy explaination:</h2>
						<p>As a security measure, you must be on a whitelist to play in this mode. Due to my limited resources, I do <b><big>not</big></b> have a dedicated server to perform this task. The server always accepts you, it just isn't running all of the time and after you log off, you removes you from the whitelist (unless its not running). Which is a pain for people who want to play multiplayer without me, but required if I ever get bigger.</p>
						<h2>Solution:</h2>
						<p><b><big>Pay me money</big></b> and I can have a dedicated server and better graphics and a more balanced game. I realize this isn't going to happen, but that means I can't provide you with the customer service that I would like to.</p>
						<p>If you totally don't know me but are interested in my work, you can email me at <a href="mailto:the30clues@gmail.com">the30clues@gmail.com</a> and I will probably respond within a day.</p>
					</al>
				</div>
			</div>
			<div id='winner' class='centerAll' modes='arena'>Winner!</div>
			<div class="fb-like" modes='mainMenu' data-share="true" data-width="450" data-show-faces="true"></div>
			<div id='social-bar' modes='mainMenu credits lobby createUser'>
				<a href='https://www.instagram.com/frozenfrank7/' target='_blank' class='instagram'>
					<i class='fa fa-instagram'></i>
				</a>
				<a href='https://twitter.com/frozenfrank7' target='_blank' class='twitter'>
					<i class='fa fa-twitter'></i>
				</a>
				<a href='https://www.facebook.com/frozenfrank77' target='_blank' class='facebook'>
					<i class='fa fa-facebook'></i>
				</a>
				<a href='https://plus.google.com/u/0/+JamesFinlinson' target='_blank' class='google'>
					<i class='fa fa-google-plus-circle'></i>
				</a>
			</div>
		</div>
		<div modes='mainMenu'>
			<div class='menuButtons'>
				<button ng-click='changeMode("lobby")' ng-disabled='!authObject.authData' class='primary gleaming'>
					Get your Wings in the Air!
				</button>
				<a href='http://the30clues.wixsite.com/segwayvthegame' target='_blank'>
					<button>
						About Me
					</button>
				</a>
				<button ng-click='changeMode("credits")'>
					Credits
				</button>
			</div>
		</div>
		<credits modes='credits'>
			<span>
				<h1>Segwayv the Game</h1>
				<h2>Written by:</h2>
				<p>James Finlinson 2016</p>
				<h2>Images:</h2>
				<p>millionthvector</p>
				<p>Font Awesome</p>
				<p>Google Fonts</p>
				<p>pickywallpapers.com</p>
				<h2>Minified with:</h2>
				<p>MinifyCode.com</p>
				<p>Google Closure Compiler Service</p>
				<h2>Third party libraries</h2>
				<p>Firebase</p>
				<p>Angular</p>
				<p>jQuery</p>
				<p>AngularFire</p>
				<h2>Special thanks to:</h2>
				<p>My Family</p>
				<p>Chris Woods</p>
				<p>Brett Simms</p>
				<p>Cloud9 IDE</p>
			</span>
		</credits>
		<div modes='lobby'>
			<div class='menuButtons'>
				<button ng-click='changeMode("multiplayer")' class='half primary gleaming'>
					<span class='intro'>Play</span>Multiplayer
				</button>
				<button ng-click='changeMode("singleplayer")' class='half primary gleaming'>
					<span class='intro'>Play</span>Singleplayer
				</button>
				<button ng-click='changeMode("createUser")' class='full'>
					Customize your ship
				</button>
				<button disabled ng-click='changeMode("tutorial")' class='full'>
					Tutorial (Coming Soon...)
				</button>
			</div>
		</div>
		<div modes='multiplayer' ng-controller='multiplayerController'>
			<div id="user-list" modes='host'></div>
			<div id='serverList' class='menuButtons'>
				<table>
					<thead>
						<td>Host Name</td>
						<td>Server Name</td>
						<td># of Players</td>
						<td>JOIN</td>
					</thead>
					<tbody>
						<tr>
							<td>Frozenfrank7</td>
							<td>Google Chrome</td>
							<td>3</td>
                            <td ng-click='requestToJoin("chrome")'>Click here!</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div modes='createUser' ng-controller='spriteController'>
			<form novalidate id='sprites' class='{{ interested ? "interested" : "" }}'>
				<button class='myButton' ng-click='interested = !interested'>
					{{ interested ? "GO back" : "Select a few to compare with more detail" }}
				</button>
				<div id='options-wrapper'>
					<div ng-repeat='u in generation.sprites' class='userObject {{ u.user.availableToPublic ? "" : "private" }} {{ isSelected(u.name) ? "selected" : "" }}' sprite='{{ u.name }}' ng-click='toggleSprite(u.name)'>
						<h1 class='title'>
							{{ u.appearance.displayName }}
						</h1>
						<div class='stat-bars'>
							<div ng-repeat='ss in generation.stats track by $index'>
								<div class='{{ ss.important ? "important" : "" }}'>
									{{ v = u.values[ss.displayName]; '' }}
									{{ cap = u.user.availableToPublic ? 90 : 98; '' }}
									{{ check = 14; '' }}
									<!-- TODO: fix the non-inverted values -->
									<!--<div class='bar' style='width:{{ ((ss.inverted ? (ss.max - v + ss.min) : ss.max + v - ss.min) / ss.max * cap).minMax(12,cap) }}%'></div>-->
									<div class='bar' style='width:{{ ((ss.inverted ? (ss.max - v + ss.min) : v) / ss.max * cap).minMax(check,cap) }}%'></div>
									<div class='value'>
										{{ ss.displayName }}: {{ v }}
									</div>
								</div>
							</div>
						</div>
						<div class='image'>
							<img src='{{ u.appearance.shape[1].src }}'/>
						</div>
						<div class='summary'>
							{{ u.user.summary() }}
						</div>
					</div>
				</div>

				<div>
					<div id='usernameField'>
						<input type='text' ng-model='username.value' value='{{ username.value }}' placeholder='{{ values[index] }}'
							ng-focus='setPreset($event)' ng-click='setPreset($event)' required/>
						<button ng-click='update()' ng-hide='username.value != undefined' type='refresh'>
							<i class="fa fa-fw fa-refresh {{ fetching ? 'fa-spin' : '' }}"></i>
						</button>
						<button ng-click='username.value = undefined' ng-hide='username.value == undefined' type='trash'>
							<i class="fa fa-fw fa-trash"></i>
						</button>
					</div>
					<a class='myButton' ng-click='completeForm()'>Finish!</a>
				</div>
			</form>
		</div>
		<p>
		<!--
		<div id="control_buttons">
			<span modes='host'>
				<button id='start' type="button" onclick="initiateWorld()">
					Start the Server!
				</button>
				<button type="button" onclick="gameServer.update({'interactingObjects':null,'messages':null,'whiteList':null})">
					Reset the Firebase data
				</button>
				<!--
				<button type='button' onclick="gameServer.update({'whiteList/server':true})">
				    Whitelist the server
				</button>
				--><!--
				<button type="button" onclick="serverHelper.resizeCanvas({auto:true,target:'canvasSize'})">
					Update canvas size to match this screen
				</button>
				<div id="canvasSize">
					X: <input type='number' id="width"/>
					Y: <input type="number" id="height"/>
					<button type='button' onclick="serverHelper.resizeCanvas({target:'canvasSize'});">
						Submit size declarations
					</button>
				</div>
			</span>
		</div>
		-->
		</p>
		<div id="overlay" ng-controller='modalController' ng-click='modal ? "" : stage.hide()' class='hide'>
			<div class="dialog {{ color }}{{ modal ? ' modal' : '' }}">
				<div class="label-dialog"><i class="fa-{{ icon }} icon-{{ icon }}"></i></div>
				<div class="body-dialog">
					<p ng-bind-html='message'>{{ message }}</p>
				</div>
				<div class="ok-dialog" ng-click='stage.hide()'><i class="icon-ok-sign"></i></div>
			</div>
		</div>
		<canvas id="canvas" class='centerAll' modes='arena'></canvas>
	</div>

	<style type='text/css'>
		/*control css*/
		/*hide things with the modes attribute*/
		[modes]:not([modes~='{{ currentMode }}']) {
			visibility: hidden;
			display: none;
		}
		[modes~='{{ currentMode }}']{
			/*maybe the this part isnt required*/
			visibility: visible;
		}
		/*todo: fix this!*/
		#app[noscroll~='{{ currentMode }}']{
			overflow: hidden;
		}
	</style>
	<script src="angularController.js"></script>

	<link type='text/css' rel='stylesheet' href='/g/packagedCSS.php'/>
	<script type="text/javascript" src="/g/packagedJS.php"></script>
</body>
</html>