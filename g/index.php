<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Segwayv the Game</title>
	<link rel='shortcut icon' href='/g/favicon.ico' type='image/x-icon'/>

	<!--google fonts-->
	<link href='https://fonts.googleapis.com/css?family=Ranchers|Righteous|Roboto:400,700|Electrolize' rel='stylesheet'/>

	<!--font awesome-->
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet"/>

	<!--angular 1.5.7-->
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>

	<!--firebase 3.2.0-->
	<script src="https://www.gstatic.com/firebasejs/3.2.0/firebase.js"></script>
	<!--<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>-->
	<!--<script src="https://apis.google.com/js/platform.js" async defer></script>-->

	<!-- AngularFire 2.0.1 -->
	<script src="https://cdn.firebase.com/libs/angularfire/2.0.1/angularfire.min.js"></script>

	<!--jQuery 2.2.0 -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>

	<!--Firechat-->
	<!--<link rel='stylesheet' href='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.css'/>-->
	<!--<script src='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.js'></script>-->

	<!--tracking scripts-->
	<script>
		//facebook
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
<body ng-app='segwayv' ng-controller='angularController' id='app' class='{{ currentMode }} {{ authObject.owner.isOwner ? "owner" : "" }} {{ authObject.authData ? "loggedIn" : "" }} {{ isPlaying ? "playing" : "" }}'>
	<div id="wrapper">
		<div id="control_buttons">
			<span modes='mainMenu createUser createServer' class='authBtn'>
				<button ng-disabled='authObject.authData' ng-click='authObject.login({app:"google"})'>
					{{ authObject.loginStatus }}
				</button>
				<button ng-disabled='!authObject.authData' ng-click='authObject.logout()'>
					Sign out
				</button>
				<button ng-hide='authObject.owner.isOwner' ng-click='authObject.owner.login()'>
					Login as Owner
				</button>
				<button ng-show='authObject.owner.isOwner' ng-click='authObject.owner.logout()'>
					Logout as owner
				</button>
			</span>
			<span modes='multiplayer'>
				<button id='client-request' onclick='client.join()' ng-disabled='modes.multiplayer.requestDisabled'>
					{{ modes.multiplayer.joinStatus }}
				</button>
			</span>
			<span modes='mainMenu'>
				<span ng-disabled='!authObject.authData'>
					<button ng-click='changeMode("multiplayer")' ng-disabled='!authObject.authData' class='bigStartButtonSS gleaming'>
						Play Multiplayer
					</button>
					<button ng-click='changeMode("singleplayer")' ng-disabled='!authObject.authData' class='bigStartButtonSS gleaming'>
						Play Singleplayer
					</button>
				</span>
				<button ng-click='changeMode("createUser")'>
					Pick a new user
				</button>
			</span>
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
				-->
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
		<div class='help-tip' ng-hide='authObject.owner.isOwner' modes='mainMenu singleplayer multiplayer createUser'>
			<al modes='mainMenu'>
				<p>Your goal is to sign into the computer and then pick a mode to play in. Your choice is non-committal, so dont hesitate.</p>
				<p>Step 1: Sign in. Click <code>Sign in with Google</code> and an auth box will pop up asking you to "sign in with Google".</p>
				<p>Step 2: It will probably redirect you to a page to pick the user that you want to be and to pick a username.</p>
				<p>Step 3: Pick a mode to play in. For the sake of the tutorial, please pick singleplayer mode.</p>
			</al>
			<al modes='singleplayer'>
                <p>You are now playing against an AI. He doesn't have any more controls than you, so the only advantage that he has over you is experience (I made him with my very experienced hand).</p>
                <p>But you still need to learn your controls. It uses a common ASDW layout with few extra keys for more functionality. You will want to know these</p>
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
                    <tr><td>Z</td><td>dodge to the left. While dodging, you move directly sideways but all other system functions are disabled. You can't fire or rotate or move in any other directing while dodging.</td></tr>
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
		<canvas id="canvas" class='centerAll' modes='singleplayer multiplayer'></canvas>
		<div id='features'>
			<div id='mainMenuBtn' modes='singleplayer multiplayer createServer createUser' ng-click='mainMenu()' class='arrow_box'>&#8668; Main Menu <small>from: {{ currentMode }}</small></div>
			<div id='stateLog' ng-show='authObject.owner.isOwner' modes='singleplayer'></div>
			<div id='winner' class='centerAll' modes='singleplayer'>Winner!</div>
			<div id="user-list" modes='host'></div>
			<div modes='mainMenu' class="fb-like" data-share="true" data-width="450" data-show-faces="true"></div>
		</div>
		<credits modes>
			Segwayv the Game
			Written by: James Finlinson 2016

			Images:
			millionth vector (millionthvector)
			google images

			Minified with:
			http://minifycode.com/html-minifier/
			https://closure-compiler.appspot.com/home

			Special thanks to:
			Chris Woods
			Cloud9
		</credits>
		<div modes='createUser' ng-controller='spriteController'>
			<form novalidate id='sprites' class='{{ interested ? "interested" : "" }}'>
				<button class='myButton' ng-click='interested = !interested'>
					{{ interested ? "GO back" : "Select a few to compare with more detail" }}
				</button>
				<div id='options-wrapper'>
					{{ generation.run(); '' }}
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
	</style>
	<script src="angularController.js"></script>

	<link type='text/css' rel='stylesheet' href='/g/packagedCSS.php'/>
	<script type="text/javascript" src="/g/packagedJS.php"></script>
</body>
</html>