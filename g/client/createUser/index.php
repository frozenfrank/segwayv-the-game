<?php
	$role = 'createUser';
	$root = realpath('../../');
	$dontclosehead = true;
	require("../../includeJS.php");

	//we need to get a list of the userObjects
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
	
	// Google fonts
	echo "<link href='https://fonts.googleapis.com/css?family=Ranchers' rel='stylesheet' type='text/css'/>\n";
?>
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

		<canvas id='canvas' style='display:none;visibility:hidden'></canvas>
		<br/>
	</div>
</body>
</html>
