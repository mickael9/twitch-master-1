// This program makes sures the legacy map of commands give the
// same result in the new rule system
var	fs = require('fs'),
	rules = require('./lib/rules'),
	util = require('util'),
	map = require('./map.json');

var keys = Object.keys(map);
var errors = [];

keys.forEach(function(x) {
	var resolved = rules.resolve(x);
	if (resolved !== map[x]) {
		errors.push([x, resolved, map[x]]);
	}
});

if (errors.length != 0) {
	console.log("Some keys did not match:");
	errors.forEach(function(x) {
		console.log("key: " + x[0] + ", got: " + x[1] + ", expected: " + x[2]);
	});
} else {
	console.log("All keys match!");
}

process.stdin.on('data', function(d) {
	data = d.toString().trim();
	console.log(data + ": " + rules.resolve(data));
});
