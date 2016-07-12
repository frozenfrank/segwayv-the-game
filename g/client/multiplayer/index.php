<?php
    $role = 'client';
    $mode = 'multiplayer';
    $root = realpath('../../');
    require("$root/includeJS.php");
?>
<body id='client' mode='multiplayer'>
    <div id='wrapper'>
        <div id='control_buttons'>
			<button id='client-request' type="button" onclick='client.join()' disabled='true'>
				Request to join the server
			</button>
            <!--
                <button type='button' onclick="location = 'spectator'">
                    Choose to Spectate instead
                </button>
            -->
        </div>
<?php includeclientelements(); ?>
        <div class='help-tip'>
            <al>
                <h2>Explaination</h2>
                <p>This mode has all of the same controls and singleplayer mode except that you're not fighting a robot. You are now fighting other users from around the globe. Your controls remain the same.</p>
                <p>You might not be able to play in this mode because of some technical difficulties.</p>
                <p>If you are an owner of the game, you can solve the problem yourself by starting a server.</p>
                <h2>Techy explaination:</h2>
                <p>As a security measure, you must be on a whitelist to play in this mode. Due to my limited resources, I do <b><big>not</big></b> have a dedicated server to perform this task. The server always accepts you, it just isn't running all of the time and after you log off, you removes you from the whitelist (unless its not running). Which is a pain for people who want to play multiplayer without me, but required if I ever get bigger.</p>
                <h2>Solution:</h2>
                <p><b><big>Pay me money</big></b> and I can have a dedicated server and better graphics and a more balanced game. I realize this isn't going to happen, but that means I can't provide you with the customer service that I would like to.</p>
                <p>If you totally don't know me but are interested in my work, you can email me at <a href="mailto:the30clues@gmail.com">the30clues@gmail.com</a> and I will probably respond within a day.</p>
            </al>
        </div>
    </div>
</body>
</html>