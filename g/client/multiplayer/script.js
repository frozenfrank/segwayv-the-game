function modeInit(){
    var clientRequestButton = $('#control_buttons > #client-request');

    //change the values of the buttons
    clientRequestButton.html("Requested to join the server");

    //let the user re-request after a period of time
    setTimeout(function(){
        clientRequestButton.removeAttr("disabled").html(
            "The request has timed out. Request again..."
        );
    },20000);

    functions.listenToObjectsRef();
    client.waitForWhitelist();
    // client.listenToMessages();
}