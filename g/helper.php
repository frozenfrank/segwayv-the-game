<?php
function countFilesInDir($dir){
    //http://stackoverflow.com/a/12801447/2844859
    // integer starts at 0 before counting
    $i = 0;
    if ($handle = opendir($dir)) {
        while (($file = readdir($handle)) !== false){
            if (!in_array($file, array('.', '..')) && !is_dir($dir.$file))
                $i++;
        }
    }
    // prints out how many were in the directory
    return $i;
}
function readFilesInDir($dir,$noLoadPattern = false){
    if(!$noLoadPattern)
        global $noLoadPattern;
    global $listOtherFiles;
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $filename){
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
                echo "Didn't recognize this file: '$filename', with extension: '".findExtension($filename)."'\n";
        }

        if($toRead){
            readfile($filename);
            // echo $filename;
            echo "\n";
        } elseif ($toProvideName){
            array_push($otherSourcesToLoad,toWebPath($filename));
            // echo "Other source: $filename ==> extension: ".findExtension($filename)."\n";
            // echo chr(9).toWebPath($filename)."\n";
        }
    }
    if($listOtherFiles){
        //list out the files
    }
}
function toWebPath($serverPath){
    $path = $_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'];
    $path = str_replace($_SERVER['DOCUMENT_ROOT'], '', $serverPath);
    return $path;
}
function findExtension($filename){
    $filename = strtolower($filename) ;
    $exts = explode(".", $filename) ;
    $n = count($exts)-1;
    $exts = $exts[$n];
    return $exts;
}
function codeComment($comment,$lang="js"){
    global $minifiedCode;
    if($minifiedCode){
        return; //dont put comments in mini code
    }

    $base = '////################################################';

    switch($lang){
        case "js":
        case "css":
            $open = "/*";
            $close = "*/";
            break;
        case "html":
            $open = "<!--";
            $close = "-->";
            break;
        default:
            echo "Unknown language: $lang";
            return;
    }

echo <<<EOT
\n\n$open
$base
$base
////  $comment
$base
$base
$close\n\n
EOT;
}
function randomLine($file){
    $f_contents = file($file);
    $line = $f_contents[rand(0, count($f_contents) - 1)];
    return $line;
}
function stripLineBreaks($string){
    return preg_replace( "/\r|\n/", "", $string);
}
function includeAuthButtons(){

echo <<<EOT
<button id='login' type='button' onclick='authObject.login({app:"google"});this.innerHTML="Logging in..."'>Login with Google</button>
<button id='logout' type='button' onclick='authObject.logout()' disabled='true'>Sign out</button>
<button id='ownerButton' typer='button' onclick='authObject.ownerLogin()'>Login as Owner</button>
EOT;

}
function searchfilereturnline($file,$searchfor){
    $file = realpath($file);

    // get the file contents, assuming the file to be readable (and exist)
    $contents = file_get_contents($file);
    // escape special characters in the query
    $pattern = preg_quote($searchfor, '/');
    // finalise the regular expression, matching the whole line
    $pattern = "/^.*$pattern.*\$/m";
    // search, and store all matching occurences in $matches
    if(preg_match_all($pattern, $contents, $matches)){
    //   echo "Found matches:\n";
       echo implode("\n", $matches[0]);
    }
    else{
    //   echo "No matches found";
    }
}
function listallsprites(){
    global $root;
    global $minifiedCode;
    codecomment("Listing all sprites");

    if($minifiedCode)       readfilesindir("$root/assets/definitions/WAITuserObjects",'/\/NOLOAD/');
    else                    readfile("$root/client/min/sprite.js");
}
function includeMainMenuBtn(){
    global $mode;
    global $role;

    if($mode)   $from = $mode;
    else        $from = $role;

	echo "<div id='mainMenuBtn' onclick='location.href=\"/g\"' class='arrow_box'>&#8668; Main Menu <small>from: $from</small></div>";
}
function includeClientElements(){
includeMainMenuBtn();
echo <<<EOT
<canvas id="canvas" class='centerAll'></canvas>
<div id='stateLog'></div>
<div id='winner' class='centerAll'>Winner!</div>
<br/>
<!--<div class="fb-like" data-share="true" data-width="450" data-show-faces="true"></div>-->
<!--<div id="firechat-wrapper"></div>-->

EOT;
}

//cookies
function makeCookie($name,$value='',$duration=0){
    setcookie($name, $value, $duration !== 0 ? time() + (86400 * $duration) : 0, "/");
}
function readCookie($name){
    return $_COOKIE[$name];
}
function deleteCookie($name){
    setcookie($name,'',time() - 1000,"/");
}


//whatever, just testing
function sendText($to,$message){
    $domain = 'messaging.sprintpcs.com';
    $recepient = "$to@$domain";

    mail($recepient, "", $message, "From: James Finlinson <the30clues@gmail.com>\r\n");
    codeComment("Sent message to '$recepient' with message '$message'",'html');
}
// sendText(8014000584,"Testing PHP message sends");
?>