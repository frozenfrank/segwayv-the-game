<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>DEV server: Segwayv the Game</title>
<?php
	$role = 'server';
	require("../includeJS.php");
?>
</head>

<body id="server">
	<div id="wrapper">
		<div id="control_buttons">
			<button id='start' type="button" onclick="initiateWorld()">
				Start the Server!
			</button>
			<button type="button" onclick="gameServer.update({'interactingObjects':null,'messages':null,'whiteList':null})">
				Reset the Firebase data
			</button>
			<button type='button' onclick="gameServer.update({'whiteList/server':true})">
			    Whitelist the server
			</button>
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
		</div>
		<div id="user-list"></div>
		<canvas id="canvas" class='centerAll'></canvas>
	</div>
</body>
</html>
