function modeInit(){
    var clientRequestButton = $('#control_buttons > #client-request');
        
    //ask to join the server
    functions.gameMessage({action:"join",target:"server"},true);

    //change the values of the buttons
    clientRequestButton.html("Requested to join the server");

    //let the user re-request after a period of time
    setTimeout(function(){
        clientRequestButton.removeAttr("disabled").html(
            "The request has timed out. Request again..."
        );
    },20000);

    listenToObjectsRef();
    waitForWhitelist();
    // listenToMessages();
}