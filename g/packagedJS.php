<?php
	require('config.php');
    require('helper.php');

    //define some variables
    $otherSourcesToLoad = array();
    if(!$root)      	$root = realpath('');
    //allow the these to be predefined

	//where are these now?
	// Initialize Firebase
		//temporary segwayv -- or -- segwayv v1!0
		// if($DEVserver)		echo 'var config={apiKey:"AIzaSyD_P5MwG5tcTtel2k7R0ROC19QclAvTwQE",authDomain:"temporary-segwayv.firebaseapp.com",databaseURL:"https://temporary-segwayv.firebaseio.com",storageBucket:"",};'."\n";
		// else				echo 'var config={apiKey:"AIzaSyDgeXBDGiUXgwFHyvZdE1xBK-PljmSi6xY",authDomain:"segwayv-the-game-v10.firebaseapp.com",databaseURL:"https://segwayv-the-game-v10.firebaseio.com",storageBucket:"",};'."\n";


	// firebase.initializeApp(config);var mainFirebase = firebase.database().ref();
?>
	var fromPHP = {};fromPHP.userObjects = [<?php
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$root/assets/definitions/userObjects")) as $filename){
			if(substr($filename,-1) === ".")
				continue; //skip if its a directory

			//take off the last three characters ('.js')
			$name = substr(basename($filename), 0, -3);
			//dump it on the page
			echo "'$name',";
		}
?>].sort();
<?php
	// ^^^^^^^^ had to list out some sprites for createUser

    //read out game.js
    // serve this first
    readfile("$root/assets/game.js");

	//only serve js filess
    codeComment("Common Files");
    readfilesindir("$root/assets","/js$/");

	// I removed that folder
    // codecomment("case specific files");
    // readfilesindir("$root/views","/js$/");
?>