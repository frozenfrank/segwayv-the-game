<?php
codeComment("PreReq scripts",'html');

//google analytics
// include('googleAnalytics.php');

//title
$extra = $_GET['mode'] ? " ($mode)" : "";
$prefix = $DEVserver ? "DEV " : "";

echo "<title>$prefix$role$extra: $gameName</title>\n";

//firebase
echo '<script src="https://www.gstatic.com/firebasejs/3.0.2/firebase.js"></script>'."\n";
echo '<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>'."\n";
echo '<script src="https://apis.google.com/js/platform.js" async defer></script>'."\n";

//jQuery
echo '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>'."\n";

//the favicon
echo "<link rel='shortcut icon' href='/g/favicon.ico' type='image/x-icon'/>\n";

if($role === 'client'){
    //Firechat
    // echo "<link rel='stylesheet' href='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.css'/>\n";
    // echo "<script src='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.js'></script>\n";
}

//init the firebase
echo "<script>// Initialize Firebase\n";
if($DEVserver){
    //temporary
    echo 'var config = {apiKey: "AIzaSyD_P5MwG5tcTtel2k7R0ROC19QclAvTwQE",authDomain: "temporary-segwayv.firebaseapp.com",databaseURL: "https://temporary-segwayv.firebaseio.com",storageBucket: "",};';
}else{
    echo 'var config = {apiKey: "AIzaSyDgeXBDGiUXgwFHyvZdE1xBK-PljmSi6xY",authDomain: "segwayv-the-game-v10.firebaseapp.com",databaseURL: "https://segwayv-the-game-v10.firebaseio.com",storageBucket: "",};';
}
echo "\nfirebase.initializeApp(config);var mainFirebase = firebase.database().ref();\n";

//facebook
echo 'window.b=function(){FB.c({a:"393442104112984",f:!0,version:"v2.6"})};var a,c=document.getElementsByTagName("script")[0];document.getElementById("facebook-jssdk")||(a=document.createElement("script"),a.id="facebook-jssdk",a.src="//connect.facebook.net/en_US/sdk.js",c.parentNode.insertBefore(a,c));'."\n";


if($minifiedCode)
    echo "</script>\n";
?>