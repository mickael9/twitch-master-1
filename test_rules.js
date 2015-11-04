// This program makes sures the legacy map of commands give the
// same result in the new rule system
var fs  = require('fs');
var rules = require('./lib/rules');
var util = require('util');

var TIMEOUT = 500;

// Load json command mapping
var map = {}

function map_load() {
  fs.exists('map.json', function() {
    try {
      var map_new = JSON.parse(fs.readFileSync('map.json', 'utf8'));
      map = map_new;
      console.log('(Re)loaded map.json');
    } catch (ex) {
      console.log('Could not load map.json');
      console.log(ex);
    }
  });
}

map_load();

setTimeout(function() {
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
}, TIMEOUT);

process.stdin.on('data', function(d) {
  data = d.toString().trim();
  console.log(data + ": " + rules.resolve(data));
});
