<?php
codeComment("PreReq scripts",'html');

//google analytics
// include('googleAnalytics.php');

//firebase
echo '<script src="https://www.gstatic.com/firebasejs/3.0.2/firebase.js"></script>'."\n";
echo '<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js"></script>'."\n";
echo '<script src="https://apis.google.com/js/platform.js" async defer></script>'."\n";

//jQuery
echo '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>'."\n";

if($role === 'client'){
    //Firechat
    // echo "<link rel='stylesheet' href='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.css'/>\n";
    // echo "<script src='https://cdn.firebase.com/libs/firechat/2.0.1/firechat.min.js'></script>\n";
}

//init the firebase
echo "<script>// Initialize Firebase\n";
if($DEVserver){
    //temporary
    echo 'var config = {
    apiKey: "AIzaSyD_P5MwG5tcTtel2k7R0ROC19QclAvTwQE",
    authDomain: "temporary-segwayv.firebaseapp.com",
    databaseURL: "https://temporary-segwayv.firebaseio.com",
    storageBucket: "",
  };';
}else{
    echo '   var config = {
    apiKey: "AIzaSyDgeXBDGiUXgwFHyvZdE1xBK-PljmSi6xY",
    authDomain: "segwayv-the-game-v10.firebaseapp.com",
    databaseURL: "https://segwayv-the-game-v10.firebaseio.com",
    storageBucket: "",
  };';
}
echo "\nfirebase.initializeApp(config);\n";
echo "var mainFirebase = firebase.database().ref();\n</script>\n";
?>