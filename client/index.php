<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>DEV client: Segwayv the Game</title>
<?php
	$role = 'client';
	require("../includeJS.php");
?>
</head>

<body id="client">
	<script>
	//facebook script
		window.fbAsyncInit = function() {
			FB.init({
			appId	  : '393442104112984',
			xfbml	  : true,
			version	: 'v2.6'
			});
		};
		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	</script>
	<div id="wrapper">
		<div id="control_buttons">
<?php includeAuthButtons() ?>
			<!--
			<button type='button' onclick="window.location = 'spectator'">
				Choose to Spectate instead
			</button>
			-->
			<button id='client-request' type="button" onclick='functions.gameMessage({action:"join",target:"server"})' disabled='true'>
				Request to join the server
			</button>
			<span id='geek'>
				<input type='checkbox'> I'm a Geek
			</span>
		</div>
		<canvas id="canvas" class='centerAll'></canvas>
		<div id='stateLog'></div>
		<div id='winner' class='centerAll'>Winner!</div>
		<button id='addRobot' class='myButton' onclick='functions.objectFactory("Mothership",{},{save:true});this.blur();'>Add a ROBOT</button>
		<br/>
		<div class="fb-like" data-share="true" data-width="450" data-show-faces="true"></div>
		<!--<div id="firechat-wrapper"></div>-->
	</div>
</body>
</html>
