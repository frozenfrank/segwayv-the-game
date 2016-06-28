<?php
	$role = 'client';
	require("../includeJS.php");
?>
<body id="client" mode="<?php echo $mode; ?>">
	<script>//facebook script
window.b=function(){FB.c({a:"393442104112984",f:!0,version:"v2.6"})};var a,c=document.getElementsByTagName("script")[0];document.getElementById("facebook-jssdk")||(a=document.createElement("script"),a.id="facebook-jssdk",a.src="//connect.facebook.net/en_US/sdk.js",c.parentNode.insertBefore(a,c));</script>
	<div id="wrapper">
		<div id="control_buttons">
<?php
if($mode === 'chooserole'){
includeAuthButtons();
echo <<<EOT
			<button type='button' class='gamemode' onclick="playMultiplayer()" disabled='true'>
				Play Multiplayer
			</button>
			<button type='button' class='gamemode' onclick="playSingleplayer()" disabled='true'>
				Play Singleplayer
			</button>
			<button type='button' onclick="location='createUser'">
				Pick a new user
			</button>

EOT;
}elseif($mode === 'multiplayer'){
echo <<<EOT
			<button id='client-request' type="button" onclick='functions.gameMessage({action:"join",target:"server"})' disabled='true'>
				Request to join the server
			</button>
EOT;
// 			<!--
// 			<button type='button' onclick="location = 'spectator'">
// 				Choose to Spectate instead
// 			</button>
// 			-->

// EOT;
}
?>
		</div>
		<canvas id="canvas" class='centerAll'></canvas>
		<div id='stateLog'></div>
		<div id='winner' class='centerAll'>Winner!</div>
		<div id='back2chooseRole' onclick='goToMenu()' class='arrow_box'>&#8668; Go Back <small>from: <?php echo $mode; ?></small></div>
		<br/>
		<div class="fb-like" data-share="true" data-width="450" data-show-faces="true"></div>
		<!--<div id="firechat-wrapper"></div>-->
	</div>
</body>
</html>
