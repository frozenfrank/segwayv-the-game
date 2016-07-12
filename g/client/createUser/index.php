<?php
	$role = 'createUser';
	$root = realpath('../../');
	$dontclosehead = true;
	require("../../includeJS.php");

	//we need to get a list of the userObjects
	if(!$minifiedCode){
		echo "\n<script>fromPHP.userObjects = [";
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root.'/assets/definitions/WAITuserObjects')) as $filename){
			if(substr($filename,-1) === ".")
				continue; //skip if its a directory
	
			//take off the last three characters ('.js')
			$name = substr(basename($filename), 0, -3);
			//dump it on the page
			echo "'$name',";
		}
		echo "].sort();</script>\n";
		
		echo "<style type='text/css'>\n";
		readfile(realpath('dark-form-theme.css'));
		echo "</style>\n";
	}
?>
<!--Google fonts-->
<link href='https://fonts.googleapis.com/css?family=Ranchers' rel='stylesheet' type='text/css'/>
</head>
<body id="create-user">
	<div id="wrapper">
		<div id="control_buttons">
<?php includeAuthButtons() ?>
		</div>
		<div id='sprite_options'>
			<!--stage 1 and 1.5 -> pick the sprite that you want-->
			<input type="checkbox" id='interested'/>
			<label for="interested" class='stage1'>
				<a type='button' class='myButton' onclick='scrollTo("selection")'></a>
			</label>
			<div id='stage1' class='stage1'>
				<div id='options-wrapper'></div>
			</div>

			<!--stage 2 -> pick a username-->
			<input type="checkbox" id='pickUsername'/>
			<label for="pickUsername" class='stage2'>
				<a type='button' class="myButton" id='selection' onclick='scrollTo("username")'>Continue to pick a username</a>
			</label>
			<div id='stage2' class='stage2'>
				<input type='text' id='username' value='' onkeyup="this.setAttribute('value', this.value)" onclick="this.setAttribute('value', this.value);scrollTo('finish');" placeholder='<?php
	echo striplinebreaks(strtolower(randomLine(realpath("adjectives.txt"))) . strtoupper(randomLine(realpath("nouns.txt"))));
?>' onfocus='if(!this.value) this.value = this.placeholder;$(this).select();'/>

				<!--then, finish-->
				</br>
				<a class='myButton' id='finish' onclick='authObject.completeForm()'>Finish!</a>
			</div>
		</div>
		<div class='help-tip'>
			<al>
				<p class="c0">This screen is designed to help you choose the space ship that you like the best and will give you the best fit to your personality. In a perfect world, they are all equal in the end. But the world is not perfect and I'm only a HS student so there are a few that need to be altered.</p>
				<p class="c0">Click on a few sprites to "select them". They will turn purple. If you already know which one you want, you can select <b>exactly one</b> and then continue. If not, select a few and then click the button at the top. This will hide all of the sprites that you didn't select and give you more detail on the one that you did. At this point, <b>deselect</b> the sprites that you don't want (process of elimination) until you have <b>one</b> sprite. Now continue.</p>
				<p class="c0">Now type your favorite username. A random on is provided as a placeholder, but you are not obligated to use it. Now just click continue!</p>
			</al>
		</div>

		<canvas id='canvas' style='display:none;visibility:hidden'></canvas>
		<br/>
	</div>
</body>
</html>
