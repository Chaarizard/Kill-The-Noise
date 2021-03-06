/**
 * Custom Commands
 *
 * This is bascially where most of the core custom commands goes.
 * Commands Table of Contents:
 * General, Money, Tour, Override, Staff
 */

var customCommands = {
	/*********************************************************
	 * General commands
	 *********************************************************/
	serverhelp: 'sh',
	sh: function(target, room, user) {
		if (!this.canBroadcast()) return false;

        if (!target) {
        	return this.sendReplyBox('' +
        	'/profile - Displays the user\'s money, rank, rating tier, tournament wins, and status.<br/>' +
        	'/status - Sets up or change your status.<br/>' +
			'/pickrandom - [option 1], [option 2], ... - Randomly chooses one of the given options.<br/>' +
			'/poof - Disconnects you from the server and leaves a special message in chat.<br/>' +
			'/shop - Displays a shop. Use /buy to buy things from the shop.<br/>' +
			'/stafflist - Displays a popup showing the list of staff.<br/>'+
			'/transferbucks <i>username</i> - Transfer bucks to other users.<br/>'+
			'/ratingtier - Tells you about rating tiers. <br/>' +
			'/earnbucks - Shows other ways to earn bucks. <br/>' +
			'/tell - Tells a user a message. <br/>' +
			'/regdate <em>username</em> - Shows the registration date of the user<br/><br/>'+
			'<b>For more commands or help:</b> Do /serverhelp with either of the following categories: <em>tour</em>, <em>profile</em>, <em>staff</em> Example - /serverhelp <em>tour</em>, <em>hangman</em>, <em>poll</em><br/>');
        }

		if (target.toLowerCase() === 'tour') {
			return this.parse('/tour help');
		}

		if (target.toLowerCase() === 'hangman') {
			return this.parse('/hangmanhelp');
		}

		if (target.toLowerCase() === 'poll') {
			return this.sendReply('/poll, /vote, /votes, /pr');
		}

		if (target.toLowerCase() === 'profile') {
			return this.sendReply('|raw|<img src="http://i.imgur.com/sd7CkSw.png" width="100%">');
		}

		if (target.toLowerCase() === 'staff') {
			if (!user.can('lock')) return this.sendReply('|raw|/serverhelp <i>staff</i> - Access denied.');
			return this.sendReplyBox('' +
			'/hide - Hide your symbol REQUIRES: ~<br/> ' +
			'/show - Show your symbol REQUIRES: ~<br/> ' +
			'/frt <i>user</i> - Changes a user\'s name REQUIRES: ~ <br/>' +
			'/imgdeclare <i>image</i> - Declares an image REQUIRES: &~# <br/>' +
			'/reload - Similar to hotpatch command but better REQUIRES: ~ <br/>' +
			'/pmall - Private messages all users in the server REQUIRES: ~ <br/>' +
			'/moneylog - Sees money transactions between all users REQUIRES: % <br/>' +
			'/givemoney <i>user</i>, <i>amount</i> - Give money to a user REQUIRES: ~ <br/>' +
			'/takemoney <i>user</i>, <i>amount</i> - Take money from a user REQUIRES: ~ <br/>' +
			'/away - Sets user to away REQUIRES: % <br/>' +
			'/back - Sets use back from away REQUIRES: % <br/>' +
			'/db <em>file</em> -  Displays database files REQUIRES: ~ <br/>' +
			'/kick <i>user</i> - Kicks the user from the room. REQUIRES: %@&~');
		}

		return this.sendReply('Could not find ' + target + '.');
	},

	earnmoney: 'earnbucks',
	earnbucks: function(target, room, user) {
		if (!this.canBroadcast()) return false;

		return this.sendReplyBox('' +
		'Follow <a href="https://github.com/CreaturePhil"><u><b>CreaturePhil</b></u></a> on Github for 5 bucks. Once you done so pm an admin. If you don\'t have a Github account' +
		' you can make on <a href="https://github.com/join"><b><u>here</b></u></a>.');
	},

	ratingtiers: 'ratingtier',
	ratingtier: function(target, room, user) {
		if (!this.canBroadcast()) return false;

		return this.sendReplyBox('' +
		'<font color="#8C7853"><b>Bronze</b></font>: Less Than 8 Tournament Wins. (Top 100%) <br/>' +
		'<font color="#545454"><b>Silver</b></font>: Between 8 to 19 Tournament Wins. (Top 80%-46.5%)<br/>' +
		'<font color="#FFD700"><b>Gold</b></font>: Between 20 to 39 Tournamenet Wins. (Top 46.5%-13%)<br/>' +
		'<font color="#C0C0C0"><b>Platinum</b></font>: Between 40 to 59 Tournament Wins. (Top 13%-1.5%)<br/>' +
		'<font color="#236B8E"><b>Diamond</b></font>: Between 60 to 99 Tournament Wins. (Top 1.5%-0.1%)<br/>' +
		'<font color="#FF851B"><b>Legend</b></font>: Over 100 Tournament Wins. (Top 0.1%)');
	},

	pr: 'pickrandom',
	pickrandom: function(target, room, user) {
		if (!this.canBroadcast()) return false;
		return this.sendReply(target.split(',').map(function (s) { return s.trim(); }).randomize()[0]);
	},

	d: 'poof',
	cpoof: 'poof',
	poof: (function () {
		var messages = [
			"has vanished into nothingness!",
			"used Explosion!",
			"fell into the void.",
			"went into a cave without a repel!",
			"has left the building.",
			"was forced to give BlakJack's mom an oil massage!",
			"was hit by Magikarp's Revenge!",
			"ate a bomb!",
			"is blasting off again!",
			"(Quit: oh god how did this get here i am not good with computer)",
			"was unfortunate and didn't get a cool message.",
			"The Immortal accidently kicked {{user}} from the server!",
		];

		return function(target, room, user) {
			if (Config.poofOff) return this.sendReply("Poof is currently disabled.");
			if (target && !this.can('broadcast')) return false;
			if (room.id !== 'lobby') return false;
			var message = target || messages[Math.floor(Math.random() * messages.length)];
			if (message.indexOf('{{user}}') < 0)
				message = '{{user}} ' + message;
			message = message.replace(/{{user}}/g, user.name);
			if (!this.canTalk(message)) return false;

			var colour = '#' + [1, 1, 1].map(function () {
				var part = Math.floor(Math.random() * 0xaa);
				return (part < 0x10 ? '0' : '') + part.toString(16);
			}).join('');

			room.addRaw('<strong><font color="' + colour + '">~~ ' + sanitize(message) + ' ~~</font></strong>');
			user.disconnectAll();
		};
	})(),

	regdate: function(target, room, user, connection) { 
		if (!this.canBroadcast()) return;
		if (!target || target == "." || target == "," || target == "'") return this.sendReply('/regdate - Please specify a valid username.');
		var username = target;
		target = target.replace(/\s+/g, '');
		var util = require("util"),
    	http = require("http");

		var options = {
    		host: "www.pokemonshowdown.com",
    		port: 80,
    		path: "/forum/~"+target
		};

		var content = "";   
		var self = this;
		var req = http.request(options, function(res) {

		    res.setEncoding("utf8");
		    res.on("data", function (chunk) {
	        content += chunk;
    		});
	    	res.on("end", function () {
			content = content.split("<em");
			if (content[1]) {
				content = content[1].split("</p>");
				if (content[0]) {
					content = content[0].split("</em>");
					if (content[1]) {
						regdate = content[1];
						data = username+' was registered on'+regdate+'.';
					}
				}
			}
			else {
				data = username+' is not registered.';
			}
			self.sendReplyBox(data);
			room.update();
		    });
		});
		req.end();
	},

	stafflist: function(target, room, user, connection) {
		var buffer = {
			admins: [],
			leaders: [],
			mods: [],
			drivers: [],
			voices: []
		};

		var path = require("path");
		var fs = require("fs");

		var staffList = fs.readFileSync(path.join(__dirname, '../', './config/usergroups.csv'), 'utf8').split('\n'); 
		var staff;

		var len = staffList.length;
		while (len--) {
			staff = staffList[len].split(',');
			if (staff[1] === '~') {
				buffer.admins.push(staff[0]);
			}
			if (staff[1] === '&') {
				buffer.leaders.push(staff[0]);
			}
			if (staff[1] === '@') {
				buffer.mods.push(staff[0]);
			}
			if (staff[1] === '%') {
				buffer.drivers.push(staff[0]);
			}
			if (staff[1] === '+') {
				buffer.voices.push(staff[0]);
			}
		}

		buffer.admins = buffer.admins.join(', ');
		buffer.leaders = buffer.leaders.join(', ');
		buffer.mods = buffer.mods.join(', ');
		buffer.drivers = buffer.drivers.join(', ');
		buffer.voices = buffer.voices.join(', ');

		connection.popup('Administrators: \n--------------------\n' + buffer.admins + '\n\nLeaders:\n-------------------- \n' + buffer.leaders + '\n\nModerators:\n-------------------- \n' + buffer.mods + '\n\nDrivers: \n--------------------\n' + buffer.drivers + '\n\nVoices:\n-------------------- \n' + buffer.voices);
	},

	tell: function(target, room, user) {
		if (!target) return false;
		var message = this.splitTarget(target);
		if (!message) return this.sendReply("You forgot the comma.");
		if (user.locked) return this.sendReply("You cannot use this command while locked.");

		message = this.canTalk(message, null);
		if (!message) return false;

		if (!global.tells) global.tells = {};
		if (!tells[toUserid(this.targetUsername)]) tells[toUserid(this.targetUsername)] = [];
		if (tells[toUserid(this.targetUsername)].length > 5) return this.sendReply("User " + this.targetUsername + " has too many tells queued.");

		tells[toUserid(this.targetUsername)].push(Date().toLocaleString() + " - " + user.getIdentity() + " said: " + message);
		return this.sendReply("Message \"" + message + "\" sent to " + this.targetUsername + ".");
	},

	/*********************************************************
	 * Money commands
	 *********************************************************/
	givebucks: 'gb',
	givemoney: 'gb',
	gb: function (target, room, user) {
	    if (!user.can('lockdown')) return this.sendReply('/givemoney - Access denied.');
	    if (!target) return this.sendReply('|raw|Give money to a user. Usage: /givemoney <i>username</i>, <i>amount</i>');
	    if (target.indexOf(',') >= 0) {
	        var parts = target.split(',');
	        parts[0] = this.splitTarget(parts[0]);
	        var targetUser = this.targetUser;
	    }
	    if (!targetUser) {
	        return this.sendReply('User ' + this.targetUsername + ' not found.');
	    }
	    if (isNaN(parts[1])) {
	        return this.sendReply('Very funny, now use a real number.');
	    }
	    if (parts[1] < 0) {
	        return this.sendReply('Number cannot be negative.');
	    }
	    var p = 'bucks';
	    var cleanedUp = parts[1].trim();
	    var giveMoney = Number(cleanedUp);
	    if (giveMoney === 1) {
	        p = 'buck';
	    }
	    io.stdoutNumber('db/money.csv', targetUser, 'money', giveMoney);
	    this.sendReply(targetUser.name + ' was given ' + giveMoney + ' ' + p + '. This user now has ' + targetUser.money + ' ' + p + '.');
	    targetUser.send(user.name + ' has given you ' + giveMoney + ' ' + p + '.');
	    fs.appendFile('logs/transactions.log', '\n' + Date() + ': ' + targetUser.name + ' was given ' + giveMoney + ' ' + p + ' from ' + user.name + '. ' + 'They now have ' + targetUser.money + ' ' + p + '.');
	},

	takebucks: 'takemoney',
	takemoney: function (target, room, user) {
	    if (!user.can('lockdown')) return this.sendReply('/takemoney - Access denied.');
	    if (!target) return this.sendReply('|raw|Take away from a user. Usage: /takemoney <i>username</i>, <i>amount</i>');
	    if (target.indexOf(',') >= 0) {
	        var parts = target.split(',');
	        parts[0] = this.splitTarget(parts[0]);
	        var targetUser = this.targetUser;
	    }
	    if (!targetUser) {
	        return this.sendReply('User ' + this.targetUsername + ' not found.');
	    }
	    if (isNaN(parts[1])) {
	        return this.sendReply('Very funny, now use a real number.');
	    }
	    if (parts[1] < 0) {
	        return this.sendReply('Number cannot be negative.');
	    }
	    var p = 'bucks';
	    var cleanedUp = parts[1].trim();
	    var takeMoney = Number(cleanedUp);
	    if (takeMoney === 1) {
	        p = 'buck';
	    }
	    io.stdoutNumber('db/money.csv', targetUser, 'money', -takeMoney);
	    this.sendReply(targetUser.name + ' has had ' + takeMoney + ' ' + p + ' removed. This user now has ' + targetUser.money + ' ' + p + '.');
	    targetUser.send(user.name + ' has removed ' + takeMoney + ' ' + p + ' from you.');
	    fs.appendFile('logs/transactions.log', '\n' + Date() + ': ' + targetUser.name + ' losted ' + takeMoney + ' ' + p + ' from ' + user.name + '. ' + 'They now have ' + targetUser.money + ' ' + p + '.');
	},

	transferbucks: 'transfermoney',
	transfermoney: function (target, room, user) {
	    if (!target) return this.sendReply('|raw|Transfer money between users. Usage: /transfermoney <i>username</i>, <i>amount</i>');
	    if (target.indexOf(',') >= 0) {
	        var parts = target.split(',');
	        if (parts[0].toLowerCase() === user.name.toLowerCase()) {
	            return this.sendReply('You can\'t transfer money to yourself.');
	        }
	        parts[0] = this.splitTarget(parts[0]);
	        var targetUser = this.targetUser;
	    }
	    if (!targetUser) {
	        return this.sendReply('User ' + this.targetUsername + ' not found.');
	    }
	    if (isNaN(parts[1])) {
	        return this.sendReply('Very funny, now use a real number.');
	    }
	    if (parts[1] <= 0) {
	        return this.sendReply('Number cannot be negative nor zero.');
	    }
	    if (String(parts[1]).indexOf('.') >= 0) {
	        return this.sendReply('You cannot transfer money with decimals.');
	    }
	    if (parts[1] > user.money) {
	        return this.sendReply('You cannot transfer more money than what you have.');
	    }
	    var p = 'bucks';
	    var cleanedUp = parts[1].trim();
	    var transferMoney = Number(cleanedUp);
	    if (transferMoney === 1) {
	        p = 'buck';
	    }
	    io.stdoutNumber('db/money.csv', user, 'money', -transferMoney);
	    setTimeout(function() {
	    	io.stdoutNumber('db/money.csv', targetUser, 'money', transferMoney);
	    	fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has transferred '+transferMoney+' '+p+' to ' + targetUser.name + '. ' +  user.name +' now has '+user.money + ' ' + p + ' and ' + targetUser.name + ' now has ' + targetUser.money +' ' + p +'.');
	    }, 1000);
	    this.sendReply('You have successfully transferred ' + transferMoney + ' to ' + targetUser.name + '. You now have ' + user.money + ' ' + p + '.');
	    targetUser.send(user.name + ' has transferred ' + transferMoney + ' ' + p + ' to you.');
	},

	shop: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center><h4><b><u>Kill The Noise\'s Shop</u></b></h4><table border="1" cellspacing="0" cellpadding="3"><tr><th>Command</th><th>Description</th><th>Cost</th></tr><tr><td>Symbol</td><td>Buys a custom symbol to go infront of name and puts you at top of userlist. (temporary until restart)</td><td>5</td></tr><tr><td>Fix</td><td>Buys the ability to alter your current custom avatar or trainer card. (don\'t buy if you have neither)</td><td>10</td></tr><tr><td>Poof</td><td>Buys the ability to add a custom poof.</td><td>15</td></tr><tr><td>Custom</td><td>Buys a custom avatar to be applied to your name. (you supply)</td><td>20</td></tr><tr><td>Animated</td><td>Buys an animated avatar to be applied to your name. (you supply)</td><td>25</td></tr><tr><td>Trainer</td><td>Buys a trainer card which shows information through a command such as <i>/blakjack</i>.</td><td>30</td></tr><tr><td>Room</td><td>Buys a chatroom for you to own. (within reason, can be refused)</td><td>50</td></tr><tr><td>Voice</td><td>Buys a promotion to global voice.</td><td>100</td></tr><tr><td>Player</td><td>Buys a promotion to room player of any room you want.</td><td>250</td></tr></table></table><br/>To buy an item from the shop, use /buy <i>command</i>. <br/></center>');
	},

	buy: function(target, room, user) {
		if (!target) return this.sendReply('|raw|Usage: /buy <i>command</i>');
		var data = fs.readFileSync('config/db/money.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toUserid(parts[0]);
			if (user.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		user.money = money;
		var price = 0;
		if (target === 'symbol') {
			price = 5;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a custom symbol. You will have this until you log off for more than an hour.');
				this.sendReply('|raw|Use /customsymbol <i>symbol</i> to change your symbol now.');
				this.add(user.name + ' has purchased a custom symbol.');
				user.canCustomSymbol = true;
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'fix') {
			price = 10;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a fix for a custom avatar or trainer card. Private Message an admin to alter it for you.');
				this.add(user.name + ' has purchased a fix for his custom avatar or trainer card.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'poof') {
			price = 15;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a the ability to add a custom poof. Private Message an admin to add it in.');
				this.add(user.name + ' has purchased the ability to add a custom poof.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'custom') {
			price = 20;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased an Custom Avatar. Private Message an admin add it in.');
				this.add(user.name + ' has purchased a custom avatar.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'animated') {
			price = 25;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased an Animated Avatar. Private Message an admin add it in.');
				this.add(user.name + ' has purchased a animated avatar.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'trainer') {
			price = 30;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a trainer card. You need to message an admin capable of adding this.');
				this.add(user.name + ' has purchased a trainer card.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'room') {
			price = 50;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a room. Private Message an admin to make the room.');
				this.add(user.name + ' has purchased a room.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' bucks. ' + user.name + ' now has ' + user.money + ' bucks' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'voice') {
			price = 100;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a promotion to global voice. Private Message an admin to promote you.');
				this.add(user.name + ' has purchased a promotion to voice.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' PokeDollars. ' + user.name + ' now has ' + user.money + ' PokeDollars' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target === 'player') {
			price = 250;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a promotion to global player. Private Message an admin to promote you.');
				this.add(user.name + ' has purchased a promotion to player.');
				fs.appendFile('logs/transactions.log','\n'+Date()+': '+user.name+' has bought a ' + target + ' for ' + price + ' PokeDollars. ' + user.name + ' now has ' + user.money + ' PokeDollars' + '.');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (match === true) {
			var re = new RegExp(line,"g");
			fs.readFile('config/db/money.csv', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, user.userid+','+user.money);
			fs.writeFile('config/db/money.csv', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			});
		} else {
			var log = fs.createWriteStream('config/db/money.csv', {'flags': 'a'});
			log.write("\n"+user.userid+','+user.money);
		}
	},

	customsymbol: function(target, room, user) {
		if(!user.canCustomSymbol) return this.sendReply('You need to buy this item from the shop to use.');
		if(!target || target.length > 1) return this.sendReply('|raw|/customsymbol <i>symbol</i> - changes your symbol (usergroup) to the specified symbol. The symbol can only be one character');
		var a = target;
		if (a === "+" || a === "$" || a === "%" || a === "@" || a === "&" || a === "~" || a === "#" || a === "a" || a === "b" || a === "c" || a === "d" || a === "e" || a === "f" || a === "g" || a === "h" || a === "i" || a === "j" || a === "k" || a === "l" || a === "m" || a === "n" || a === "o" || a === "p" || a === "q" || a === "r" || a === "s" || a === "t" || a === "u" || a === "v" || a === "w" || a === "x" || a === "y" || a === "z" || a === "!" || a === "?" || a === "\u2605") {
			return this.sendReply('Sorry, but you cannot change your symbol to this for safety/stability reasons.');
		}
		user.getIdentity = function(){
			if(this.muted)	return '!' + this.name;
			if(this.locked) return '‽' + this.name;
			return target + this.name;
		};
		user.updateIdentity();
		user.canCustomSymbol = false;
		user.hasCustomSymbol = true;
	},

	resetsymbol: function(target, room, user) {
		if (!user.hasCustomSymbol) return this.sendReply('You don\'t have a custom symbol!');
		user.getIdentity = function() {
			if (this.muted) return '!' + this.name;
			if (this.locked) return '‽' + this.name;
			return this.group + this.name;
		};
		user.hasCustomSymbol = false;
		user.updateIdentity();
		this.sendReply('Your symbol has been reset.');
	},

	/*********************************************************
	 * Tour commands
	 *********************************************************/
	j: function(target, room, user) {
		return this.parse('/tour join');
	},

	l: function(target, room, user) {
		return this.parse('/tour leave');
	},

	dq: function(target, room, user) {
		return this.parse('/tour dq' + target);
	},

	/*********************************************************
	 * Override commands
	 *********************************************************/
	join: function(target, room, user, connection) {
		if (!target) return false;
		var targetRoom = Rooms.get(target) || Rooms.get(toId(target));
		if (!targetRoom) {
			return connection.sendTo(target, "|noinit|nonexistent|The room '" + target + "' does not exist.");
		}
		if (targetRoom.isPrivate && !user.named) {
			return connection.sendTo(target, "|noinit|namerequired|You must have a name in order to join the room '" + target + "'.");
		}
		if (!user.joinRoom(targetRoom || room, connection)) {
			return connection.sendTo(target, "|noinit|joinfailed|The room '" + target + "' could not be joined.");
		}
		if (target.toLowerCase() == "lobby") {
			return connection.sendTo('lobby','|html|<div class="infobox" style="border-color:blue"><center><img src="http://i.imgur.com/wQhEBCY.gif"><br/><br/><b><u>Welcome to the Kill The Noise Server!' +
			'</u></b></center><br/><center><a href ="https://gist.github.com/E4Arsh/8577715"><b>This Server is hosted By BlakJack</b></a></center><br/><br/> ' +
			'&nbsp;&nbsp;&nbsp;Battle users in the ladder or in tournaments, learn how to play Pokemon or just chat in lobby! ' +
			'Make sure to type <b>/serverhelp</b> or <b>/help</b> to get a list of commands that you can use and <b>/faq</b> to check out frequently asked questions. ' +
			'<br/><br/>&nbsp;&nbsp;&nbsp;If you have any questions, issues or concerns should be directed at someone with a rank such as Voice (+), Driver (%), Moderator (@) and Leader (&). ' +
			'Only serious issues or questions should be directed to Administrators (~).</div>');
		}
	},

	makechatroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		var id = toId(target);
		if (Rooms.rooms[id]) {
			return this.sendReply("The room '"+target+"' already exists.");
		}
		if (Rooms.global.addChatRoom(target)) {
			tour.reset(id);
			hangman.reset(id);
			return this.sendReply("The room '"+target+"' was created.");
		}
		return this.sendReply("An error occurred while trying to create the room '"+target+"'.");
	},

	pm: 'msg',
	whisper: 'msg',
	w: 'msg',
	msg: function(target, room, user) {
		if (!target) return this.parse('/help msg');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) {
			this.sendReply("You forgot the comma.");
			return this.parse('/help msg');
		}
		if (!targetUser || !targetUser.connected) {
			if (targetUser && !targetUser.connected) {
				this.popupReply("User " + this.targetUsername + " is offline.");
			} else if (!target) {
				this.popupReply("User " + this.targetUsername + " not found. Did you forget a comma?");
			} else {
				this.popupReply("User "  + this.targetUsername + " not found. Did you misspell their name?");
			}
			return this.parse('/help msg');
		}

		if (Config.modchat.pm) {
			var userGroup = user.group;
			if (Config.groups.bySymbol[userGroup].globalRank < Config.groups.bySymbol[Config.modchat.pm].globalRank) {
				var groupName = Config.groups.bySymbol[Config.modchat.pm].name || Config.modchat.pm;
				this.popupReply("Because moderated chat is set, you must be of rank " + groupName + " or higher to PM users.");
				return false;
			}
		}

		if (user.locked && !targetUser.can('lock', user)) {
			return this.popupReply("You can only private message members of the moderation team (users marked by " + Users.getGroupsThatCan('lock', user).join(", ") + ") when locked.");
		}
		if (targetUser.locked && !user.can('lock', targetUser)) {
			return this.popupReply("This user is locked and cannot PM.");
		}
		if (targetUser.ignorePMs && !user.can('lock')) {
			if (!targetUser.can('lock')) {
				return this.popupReply("This user is blocking Private Messages right now.");
			} else if (targetUser.can('hotpatch')) {
				return this.popupReply("This " + (Config.groups.bySymbol[targetUser.group].name || "Administrator") + " is too busy to answer Private Messages right now. Please contact a different staff member.");
			}
		}

		target = this.canTalk(target, null);
		if (!target) return false;

		var message = '|pm|' + user.getIdentity() + '|' + targetUser.getIdentity() + '|' + target;
		user.send(message);
		if (targetUser !== user) {
			if (Spamroom.isSpamroomed(user)) {
				Spamroom.room.add('|c|' + user.getIdentity() + "|__(Private to " + targetUser.getIdentity() + ")__ " + target);
			} else {
				targetUser.send(message);
			}
		}
		targetUser.lastPM = user.userid;
		user.lastPM = targetUser.userid;

		if (targetUser.userid === toUserid(botName)) {
			fs.appendFile('logs/botpms.log', '\n' + Date() + ': ' + user.group + '**' + user.name + '**' + ' sent this message, "' + sanitize(target) + '".');
		}
	},

	hotpatch: function(target, room, user) {
		if (!this.can('hotpatch')) return false;

		this.parse('/reload');
	},

	/*********************************************************
	 * Staff commands
	 *********************************************************/
	hide: 'hideauth',
	hideauth: function(target, room, user) {
		if (!this.can('hideauth')) return false;
		target = target || Config.groups.default.global;
		if (!Config.groups.global[target]) {
			target = Config.groups.default.global;
			this.sendReply("You have picked an invalid group, defaulting to '" + target + "'.");
		} else if (Config.groups.bySymbol[target].globalRank >= Config.groups.bySymbol[user.group].globalRank)
			return this.sendReply("The group you have chosen is either your current group OR one of higher rank. You cannot hide like that.");

		user.getIdentity = function (roomid) {
			var identity = Object.getPrototypeOf(this).getIdentity.call(this, roomid);
			if (identity[0] === this.group)
				return target + identity.slice(1);
			return identity;
		};
		user.updateIdentity();
		return this.sendReply("You are now hiding your auth as '" + target + "'.");
	},

	show: 'showauth',
	showauth: function(target, room, user) {
		if (!this.can('hideauth')) return false;
		delete user.getIdentity;
		user.updateIdentity();
		return this.sendReply("You are now showing your authority!");
	},

	kick: function(target, room, user){
		if (!this.can('lock')) return this.sendReply('/kick - Access Denied');
		if (!target) return this.sendReply('|raw|/kick <em>username</em> - kicks the user from the room.');
		var targetUser = Users.get(target);
		if (!targetUser) return this.sendReply('User '+target+' not found.');
		if (targetUser.can('lockdown') || targetUser.name === botName) {
			return this.sendReply('This user can\'t be room kicked.');
		}
		if (!Rooms.rooms[room.id].users[targetUser.userid]) return this.sendReply(target+' is not in this room.');
		targetUser.popup('You have been kicked from room '+ room.title +' by '+user.name+'.');
		targetUser.leaveRoom(room);
		room.add('|raw|'+ targetUser.name + ' has been kicked from room by '+ user.name + '.');
		this.logModCommand(user.name+' kicked '+targetUser.name+' from ' +room.id);
	},

	frt: 'forcerenameto',
	forcerenameto: function(target, room, user) {
		if (!target) return this.parse('/help forcerenameto');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!target) {
			return this.sendReply('No new name was specified.');
		}
		if (!this.can('forcerenameto', targetUser)) return false;

		if (targetUser.userid === toUserid(this.targetUser)) {
			var entry = ''+targetUser.name+' was forcibly renamed to '+target+' by '+user.name+'.';
			this.privateModCommand('(' + entry + ')');
			targetUser.forceRename(target, undefined, true);
		} else {
			this.sendReply("User "+targetUser.name+" is no longer using that name.");
		}
	},

	imgdeclare: function(target, room, user) {
		if (!this.can('declare', room)) return false;
		if (!target) return this.parse('/help declare');

		if (!this.canTalk()) return;

		this.add('|raw|<img src="'+target+'">');
		this.logModCommand(user.name + " imgdeclared " + target);
	},

	reload: function (target, room, user) {
	    if (!this.can('hotpatch')) return false;

	    try {
	        var path = require("path"),
	            fs = require("fs");

	        this.sendReply('Reloading command-parser.js...');
	        CommandParser.uncacheTree(path.join(__dirname, '../', 'command-parser.js'));
	        CommandParser = require(path.join(__dirname, '../', 'command-parser.js'));

	        this.sendReply('Reloading system-operators.js...');
	        CommandParser.uncacheTree('./source/system-operators.js');
	        systemOperators = require('./system-operators.js').SystemOperatorOverRide();

	        this.sendReply('Reloading poll.js...');
	        CommandParser.uncacheTree('./source/poll.js');
	        tour = require('./poll.js').tour();

	        this.sendReply('Reloading hangman.js...');
	        CommandParser.uncacheTree('./source/hangman.js');
	        hangman = require('./hangman.js').hangman();

	        this.sendReply('Reloading utilities.js...');
	        CommandParser.uncacheTree('./source/utilities.js');
	        Utilities = require('./utilities.js').Utilities;

	        this.sendReply('Reloading bot.js...');
	        CommandParser.uncacheTree('./source/bot.js');
	        global.botCommands = require('./bot.js').botCommands;

	        this.sendReply('Reloading io.js...');
	        CommandParser.uncacheTree('./source/io.js');
	        io = require('./io.js');

	        this.sendReply('Reloading profile.js...');
	        CommandParser.uncacheTree('./source/profile.js');
	        profile = require('./profile.js');
	        
	        var runningTournaments = Tournaments.tournaments;
			CommandParser.uncacheTree(path.join(__dirname, '../', 'tournaments/frontend.js'));
			Tournaments = require(path.join(__dirname, '../', 'tournaments/frontend.js'));
			Tournaments.tournaments = runningTournaments;
	        
	        this.sendReply('Reloading custom-commands.js...');
	        CommandParser.uncacheTree('./source/custom-commands.js');
	        customcommands = require('./custom-commands.js');
	        CommandParser.uncacheTree('./source/trainer-cards.js');
	        trainercards = require('./trainer-cards.js');

	        return this.sendReply('All files have been reloaded.');
	    } catch (e) {
	        return this.sendReply('Something failed while trying to reload: \n' + e.stack);
	    }
	},

	masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!this.can('pmall')) return false;
	    if (!target) return this.sendReply('|raw|/pmall <em>message</em> - Sends a PM to every user in a room.');

	    var pmName = Users.users[toUserid(botName)].group + botName;

	    for (var i in Users.users) {
	        var message = '|pm|' + pmName + '|' + Users.users[i].getIdentity() + '|' + target;
	        Users.users[i].send(message);
	    }
	},

	buckslog: 'moneylog',
	moneylog: function(target, room, user, connection) {
		if (!this.can('lock')) return false;
		try {
			var log = fs.readFileSync('logs/transactions.log','utf8');
            return user.send('|popup|' + '**Current Date:** ' + Date() + '\n' + log);
		} catch (e) {
			return user.send('|popup|You have not set made a transactions.log in the logs folder yet.\n\n ' + e.stack);
		}
	},

	afk: 'away',
	away: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (!user.isAway) {
			var originalName = user.name;
			var awayName = user.name + ' - Away';
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);
			this.add('|raw|-- <b><font color="#4F86F7">' + originalName +'</font color></b> is now away. '+ (target ? " (" + target + ")" : ""));
			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as away, type /back if you are now back');
		}
		user.updateIdentity();
	},

	unafk: 'unafk',
	back: function(target, room, user, connection) {
		if (!this.can('broadcast')) return false;
		if (user.isAway) {
			var name = user.name;
			var newName = name.substr(0, name.length - 7);
			delete Users.get(newName);
			user.forceRename(newName, undefined, true);
			user.authenticated = true;
			this.add('|raw|-- <b><font color="#4F86F7">' + newName + '</font color></b> is no longer away');
			user.isAway = false;
		}
		else {
			return this.sendReply('You are not set as away.');
		}
		user.updateIdentity();
	},

	database: 'db',
	db: function(target, room, user, connection) {
		if (!this.can('db')) return false;
		if(!target) return user.send('|popup|You much enter a target.');
		try {
			var log = fs.readFileSync(('config/db/'+target+'.csv'),'utf8');
            return user.send('|popup|'+log);
		} catch (e) {
			return user.send('|popup|Something bad happen:\n\n ' + e.stack);
		}
	},

	bpl: 'botpmlog',
	botpmlog: function(target, room, user, connection) {
		if (!this.can('lockdown')) return false;
		try {
			var log = fs.readFileSync('logs/botpms.log','utf8');
            return user.send('|popup|'+'**Current Date:** ' + Date() + '\n' + log);
		} catch (e) {
			return user.send('|popup|You have not set made a botpms.log in the logs folder yet.\n\n ' + e.stack);
		}
	},

	truncate: function(target, room, user, connection) {
		if (!this.can('lockdown')) return false;
		if (!target) return this.sendReply('You must put a target. For logs, transactions and botpms');
		var parts = target.split(', ');
		if(parts[0] === 'logs') {
			try {
				fs.truncateSync(('logs/'+parts[1]+'.log'), 0);
				return this.sendReply('Truncate Sucessful.');
			} catch (e) {
				return user.send('|popup|File not found or something bad happen:\n\n ' + e.stack);
			}
		}
		if(parts[0] === 'db') {
			try {
				fs.truncateSync(('config/db/'+parts[1]+'.csv'), 0);
				return this.sendReply('Truncate Sucessful.');
			} catch (e) {
				return user.send('|popup|File not found or something bad happen:\n\n ' + e.stack);
			}
		}
		this.sendReply(target + ' could not be found.');
	},

	e: function(target, room, user, connection, cmd, message) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/eval - Access denied.");
		}
		if (!this.canBroadcast()) return;

		if (!this.broadcasting) this.sendReply('||>> ' + target);
		try {
			var battle = room.battle;
			var me = user;
			if (target.indexOf('-h') >= 0 || target.indexOf('-help') >= 0) {
				return this.sendReplyBox('This is a custom eval made by CreaturePhil for easier debugging.<br/>' +
					'<b>-h</b> OR <b>-help</b>: show all options<br/>' +
					'<b>-k</b>: object.keys of objects<br/>' +
					'<b>-r</b>: reads a file<br/>' +
					'<b>-p</b>: returns the current high-resolution real time in a second and nanoseconds. This is for speed/performance tests.');
			}
			if (target.indexOf('-k') >= 0) {
				target = 'Object.keys(' + target.split('-k ')[1] + ');';
			}
			if (target.indexOf('-r') >= 0) {
				target = 'fs.readFileSync("' + target.split('-r ')[1] + '","utf-8");';
			}
			if (target.indexOf('-p') >= 0) {
				target = 'var time = process.hrtime();' + target.split('-p')[1] + 'var diff = process.hrtime(time);this.sendReply("|raw|<b>High-Resolution Real Time Benchmark:</b><br/>"+"Seconds: "+(diff[0] + diff[1] * 1e-9)+"<br/>Nanoseconds: " + (diff[0] * 1e9 + diff[1]));';
			}
			this.sendReply('||<< ' + eval(target));
		} catch (e) {
			this.sendReply('||<< error: ' + e.message);
			var stack = '||' + ('' + e.stack).replace(/\n/g,'\n||');
			connection.sendTo(room, stack);
		}
	},
	
};

Object.merge(CommandParser.commands, customCommands);
exports.customCommands = customCommands;
