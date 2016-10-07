<?php
// https://css-tricks.com/snippets/css/compress-css-with-php/
	ob_start ("ob_gzhandler");
	header("Content-type: text/css; charset: UTF-8");
	header("Cache-Control: must-revalidate");
	$offset = 60 * 60 ;
	$ExpStr = "Expires: " .
	gmdate("D, d M Y H:i:s",
	time() + $offset) . " GMT";
	header($ExpStr);

	header("Content-type: text/css; charset: UTF-8");
	require('config.php');
	require('helper.php');

	//define some variables
	$otherSourcesToLoad = array();
	if(!$root)      	$root = realpath('');
	//allow the these to be predefined

	//only serve js filess
	codeComment("Common Files");
	readfilesindir("$root/assets","/css$/");

	//I removed this folder too
	// codecomment("case specific files");
	// readfilesindir("$root/views","/css$/");
?>