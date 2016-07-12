<?php
    $role = 'client';
    $mode = 'singleplayer';
    $root = realpath('../../');
    $dontclosehead = true;
    require("$root/includeJS.php");
?>
<!--winning font-->
<link href="https://fonts.googleapis.com/css?family=Righteous" rel="stylesheet">
</head>
<body id='client' mode='singleplayer'>
    <div id='wrapper'>
        <div id='control_buttons'>
            <!--manual change some game variables since it doesnt matter-->
        </div>
<?php includeclientelements(); ?>
        <div class='help-tip'>
            <al>
                <p>You are now playing against an AI. He doesn't have any more controls than you, so the only advantage that he has over you is experience (I made him with my very experienced hand).</p>
                <p>But you still need to learn your controls. It uses a common ASDW layout with few extra keys for more functionality. You will want to know these</p>
                <table><tbody>
                    <tr><td colspan='2' hint>Normal stuff</td></tr>
                    <tr><td>A | &#8592;</td><td>rotate your ship to the left (counter-clockwise)</td></tr>
                    <tr><td>D | &#8594;</td><td>rotate your ship to the right (clockwise)</td></tr>
                    <tr><td>W | &#8593;</td><td>move forwards (to where you're facing)</td></tr>
                    <tr><td>S | &#8595;</td><td>move backwards (from where you're facing)</td></tr>
                    <tr><td><bracket>[</bracket>space<bracket>]</bracket></td><td>fire your weapon</td></tr>
                    <tr><td colspan='2' hint>Extra functionality</td></tr>
                    <tr><td>R</td><td>change the weapon that you fire</td></tr>
                    <tr><td>Q</td><td>increase the size of your ship. This also increases damage, but decreases speed, max shields, and max HP</td></tr>
                    <tr><td>E</td><td>the inverse of Q</td></tr>
                    <tr><td>Z</td><td>strafe to the left. While strafing, you move directly sideways but all other system functions are disabled. You can't fire or rotate or move in any other directing while strafing.</td></tr>
                    <tr><td>C</td><td>strafe to the right</td></tr>
                </tbody></table>
            </al>
        </div>
    </div>
</body>
</html>