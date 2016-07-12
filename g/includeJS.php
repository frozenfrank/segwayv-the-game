<?php
    //helper files
    require('helper.php');
    require("config.php");

    //define some variables
    $otherSourcesToLoad = array();
    if(!$root)      	$root = realpath("../");
    //allow the these to be predefined

    if($minifiedCode)   $path = $root;
    else                $path = $root . "/assets";

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

                if($mode === 'singleplayer'){
                    codecomment("$message, listing out Robots");
                    readfilesindir("$root/assets/definitions/WAITrobots",'/\/NOLOAD/');
                }

                if($mode !== 'chooserole'){
                    readfile("$root/client/script.js");
                }
            }

            //its not worth only keeping some sprites
            listallsprites();
    	}
        echo "</script>\n";

        codeComment("Styles","html");

        //styles
        echo "<style type='text/css'>\n";

        readfile("$path/game.css"); //the path variable already accounts for minimized / not
        readfile("$path/other/helps.css");
        if(file_exists(realpath('style.css')))
            readfile(realpath('style.css')); //read out the style.css file in the folder IF IT EXISTS

        //bad!! **work**
        if($role === 'client' && $mode !== 'chooserole')
            readfile("$root/client/style.css");
        echo "\n";
        echo "</style>";
    }

//close the head
if(!$dontCloseHead)
echo <<<EOT
</head>
EOT;

?>