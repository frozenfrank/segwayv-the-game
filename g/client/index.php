<?php
	$role = 'client';
	$mode = 'chooserole';
	$dontclosehead = true;
	require("../includeJS.php");

	echo "<script>";
	readfile('chooserole.js');
	echo "</script></head>";
?>
<body id="client" mode="chooserole">
	<div id="wrapper">
		<div id="control_buttons">
<?php includeAuthButtons(); ?>
			<button type='button' onclick="location='multiplayer'" disabled='true' class='gamemode'>
				Play Multiplayer
			</button>
			<button type='button' onclick="location='singleplayer'" disabled='true' class='gamemode'>
				Play Singleplayer
			</button>
			<button type='button' onclick="location='createUser'">
				Pick a new user
			</button>
		</div>
		<div class='help-tip'>
			<al>
				<p>Your goal is to sign into the computer and then pick a mode to play in. Your choice is non-committal, so dont hesitate.</p>
				<p>Step 1: Sign in. Click <code>Sign in with Google</code> and an auth box will pop up asking you to "sign in with Google".</p>
				<p>Step 2: It will probably redirect you to a page to pick the user that you want to be and to pick a username.</p>
				<p>Step 3: Pick a mode to play in. For the sake of the tutorial, please pick singleplayer mode.</p>
			</al>
		</div>
	</div>
</body>
</html>
