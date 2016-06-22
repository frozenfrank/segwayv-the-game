<?php
    //helper files
    require('helper.php');
    require("config.php");

    //define some variables
    $otherSourcesToLoad = array();
    if(!$root) $root = realpath("../");
    //allow the $root to be predefined

    if($minifiedCode)   $path = $root;
    else                $path = $root . "/assets";

    //scripts
    require("gamePreReqs.php");

    echo '<script>'."\n";
    if($minifiedCode){
        codeComment("Common files");
        readfile($path."/all.js");
        echo "\n";

        codeComment("Our role is: $role");
        //read out the min.js in the folder
        readfile(realpath('min.js'));
        echo "\n";

        //and min.css IF IT EXISTS
        if(file_exists(realpath('min.css')))
            readfile(realpath('min.css'));
        echo "\n";
    }else{
        codeComment("Common Files");
        //serve the files that every role needs
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path)) as $filename){
            if(preg_match($noLoadPattern,$filename) === 1)
                continue;

            $toRead = false;
            $toProvideName = false;
            switch (findExtension($filename)){
                case "js":
                    $toRead = true;
                    break;
                case "png":
                case "jpg":
                case "jpeg":
                case 'gif':
                    // $toProvideName = true;
                    //these actually can be loaded ad-hoc
                    break;
                case "":
                case " ":
                case 'php':
                case "css":
                    //do nothing
                    break;
                default:
                    echo "Didn't recognize this file: $filename, with extension: ".findExtension($filename)."\n";
            }
            if($toRead){
                readfile($filename);
                echo "\n";
                // echo toWebPath($filename)." ---- ".findExtension($filename)."\n";
            } elseif ($toProvideName){
                array_push($otherSourcesToLoad,toWebPath($filename));
                // echo "Other source: $filename ==> extension: ".findExtension($filename)."\n";
                // echo chr(9).toWebPath($filename)."\n";
            }
        }

        codeComment("Other required sources");
        echo "var fromPHP = {};\n";

        //read out game.js
        readfile($root . "/assets/game.js");

        //serve some files based on the role
        codeComment("OUR role is: $role");
        readfile(realpath('script.js'));
        //we will always load the script.js file that is in the current folder
    }
    echo "</script>\n";

    codeComment("Styles","html");

    //styles
    echo "<style type='text/css'>\n";
    readfile($path."/game.css"); //the path variable already accounts for minimized / not
    if(file_exists(realpath('style.css')))
        readfile(realpath('style.css')); //read out the style.css file in the folder IF IT EXISTS
    echo "\n";
    echo "</style>";
?>