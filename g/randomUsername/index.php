<?php
	require('../helper.php');
	$count = $_GET['count'];
	if(!$count) $count = 1;
	$made = 0;

	while(++$made <= $count){
		echo striplinebreaks(strtolower(randomLine(realpath("adjectives.txt"))) . strtoupper(randomLine(realpath("nouns.txt"))));
		if($made != $count)
			echo "\n";
	}
?>