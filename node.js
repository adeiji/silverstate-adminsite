function start ()
{
	var http = require("http");
	var fs = require("fs");
	var express = require('express');
	var app = express();

	

	app.use(express.static(__dirname));	
	app.listen(process.env.PORT || 8080);
};

exports.start = start;