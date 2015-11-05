var master = require('./twitch_master'),
	pub = require('./lib/comm').sender(),
	map = require('./map.json'),
	TIMEOUT = 500,
	length = 0;

function iter()
{
	var next = Object.keys(map)[length];
  
	if (next != null) {
		console.log('Sending: ' + next + ' -> ' + map[next]);
		pub.send(['qemu-manager', map[next] + '\n']);

		length++;
		setTimeout(iter, TIMEOUT);
	} else {
		console.log('Done!');
	}
}

setTimeout(iter, TIMEOUT);
