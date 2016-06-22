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
<button id='logout' type='button' onclick='authObject.logout()'>Sign out</button>
<button id='ownerButton' typer='button' onclick='authObject.ownerLogin()'>Login as Owner</button>
EOT;

}
//whatever, just testing
function sendText($to,$message){
    $domain = 'messaging.sprintpcs.com';
    mail("$to@$domain", "", $message, "From: James Finlinson <the30clues@gmail.com>\r\n");
    codeComment("Sent message to '$to@$domain' with message '$message'",'html');
}
// sendText(8014000584,"Testing PHP messge sends");
?>