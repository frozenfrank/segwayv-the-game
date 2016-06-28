<?php
    //helper files
    require('helper.php');
    require("config.php");

    //define some variables
    $otherSourcesToLoad = array();
    if(!$mode)      $mode = strtolower(readCookie('mode'));
    if(!$sprite)    $sprite = readCookie('sprite');
    if(!$root)      $root = realpath("../");
    //allow the these to be predefined

    if($minifiedCode)   $path = $root;
    else                $path = $root . "/assets";

    //clean up some cookies
    if($role === 'client' && $mode !== 'singleplayer' && $mode !== 'multiplayer'){
		deleteCookie('mode');
		deleteCookie('sprite');
		$mode = 'chooserole';
    }
    
    //start the file
    if(true){
echo "<!doctype html>\n";
if($minifiedCode)
echo <<<EOT
<!--
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
-->

EOT;
echo <<<EOT
<html>
<head>
<meta charset="utf-8">
EOT;
    }

    //scripts
    require("gamePreReqs.php");
    
    if($minifiedCode){
        if(file_exists(realpath('min/min.php')))
            require(realpath('min/min.php'));
        else
            echo "<script>alert('this file is not minimized');</script>\n";
    }else{
    
        // echo '<script>'."\n"; //gamePreReqs already has a script
        codeComment("Common Files");
        //serve the files that every role needs
        readfilesindir($path);

        codeComment("Other required sources");
        echo "var fromPHP = {};\n";

        //read out game.js
        readfile("$root/assets/game.js");

        //serve some files based on the role
        codeComment("OUR role is: $role");
        readfile(realpath('script.js'));
        //we will always load the script.js file that is in the current folder
        
        //mode
        if(true){
            if($role === 'client'){
                $message = "Our mode is: $mode";
                
                if($mode === 'singleplayer' && $sprite){
                    codecomment("$message, listing out Robots");
                    readfilesindir("$root/assets/definitions/WAITrobots",'/\/NOLOAD/');
                    
                    codecomment("My user: '$sprite'");
                    readfile("$root/assets/definitions/WAITuserObjects/$sprite.js");
                }elseif ($mode === 'multiplayer')
                    listallsprites();
                else{
                    $mode = 'chooserole';
                    listallsprites();
                }
                
                readfile(realpath("$mode.js"));
            }else
                //don't make them work for the other data
                listallsprites();
    	}
        echo "</script>\n";
       
        codeComment("Styles","html");
    
        //styles
        echo "<style type='text/css'>\n";
        readfile("$path/game.css"); //the path variable already accounts for minimized / not
        if(file_exists(realpath('style.css')))
            readfile(realpath('style.css')); //read out the style.css file in the folder IF IT EXISTS
        echo "\n";
        echo "</style>";
    }


//close the head
if(!$dontCloseHead)
echo <<<EOT
</head>
EOT;
?>