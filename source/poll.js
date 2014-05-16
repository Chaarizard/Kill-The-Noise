/*********************************************************
 * Functions
 *********************************************************/

exports.tour = function(t) {
  if (typeof t != "undefined") var tour = t; else var tour = new Object();
	var tourStuff = {
		tiers: new Array(),
		timerLoop: function() {
			setTimeout(function() {
				tour.currentSeconds++;
				for (var i in tour.timers) {
					var c = tour.timers[i];
					var secondsNeeded = c.time * 60;
					var secondsElapsed = tour.currentSeconds - c.startTime;
					var difference = secondsNeeded - secondsElapsed;
					var fraction = secondsElapsed / secondsNeeded;
					function sendIt(end) {
						if (end) {
							Rooms.rooms[i].addRaw("<h3>The tournament was canceled because of lack of players.</h3>");
							return;
						}
						Rooms.rooms[i].addRaw("<i>The tournament will begin in " + difference + " second" + (difference == 1 ? '' : 's') + ".</i>");
					}
					if (fraction == 0.25 || fraction == 0.5 || fraction == 0.75) sendIt();
					if (fraction >= 1) {
						if (tour[i].players.length < 3) {
							tour.reset(i);
							sendIt(true);
						}
						else {
							if (tour[i].status == 1) {
								tour[i].size = tour[i].players.length;
								tour.reportdue(Rooms.rooms[i]);
								tour.start(i);
							}
						}
						delete tour.timers[i];
					}
				}
				tour.timerLoop();
			}, 1000);
		},
		reset: function(rid) {
			tour[rid] = {
				status: 0,
				tier: undefined,
				size: 0,
				roundNum: 0,
				usergroup: undefined,
				players: new Array(),
				winners: new Array(),
				losers: new Array(),
				round: new Array(),
				history: new Array(),
				byes: new Array(),
				playerslogged: new Array(),
				battles: new Object(),
				battlesended: new Array(),
				battlesinvtie: new Array(),
				question: undefined,
				answerList: new Array(),
				answers: new Object()
			};
		},
		shuffle: function(list) {
		  var i, j, t;
		  for (i = 1; i < list.length; i++) {
			j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
			if (j != i) {
				t = list[i];                        // swap list[i] and list[j]
				list[i] = list[j];
				list[j] = t;
			}
		  }
		  return list;
		},
		splint: function(target) {
			//splittyDiddles
			var cmdArr =  target.split(",");
			for (var i = 0; i < cmdArr.length; i++) cmdArr[i] = cmdArr[i].trim();
			return cmdArr;
		},
		username: function(uid) {
			if (Users.get(uid)) {
				var n = Users.get(uid).name;
				if (toId(n) != uid) return uid;
				return n;
			} else {
				return uid;
			}
		},
		maxauth: function(user) {
			if (user.can('forcewin')) return true;
			return false;
		},
		highauth: function(user) {
			//room auth is not enough
			if (!config.tourhighauth && user.can('ban')) return true;
			if (config.tourhighauth && config.groupsranking.indexOf(user.group) >= config.groupsranking.indexOf(config.tourhighauth)) return true;
			return false;
		},
		midauth: function(user, room) {
			if (!config.tourmidauth && user.can('broadcast')) return true;
			if (config.tourmidauth && config.groupsranking.indexOf(user.group) >= config.groupsranking.indexOf(config.tourmidauth)) return true;
			if (room.auth && room.auth[user.userid]) return true;
			return false;
		},
		lowauth: function(user, room) {
			if (!config.tourlowauth && user.can('broadcast')) return true;
			if (config.tourlowauth && config.groupsranking.indexOf(user.group) >= config.groupsranking.indexOf(config.tourlowauth)) return true;
			if (room.auth && room.auth[user.userid]) return true;
			return false;
		},
		remsg: function(apparent, nonhtml) {
			if (!isFinite(apparent)) return '';
			if (apparent === 0) return ' The first round of the tournament starts now.';
			if (nonhtml) return (' ' + apparent + ' slot' + ( apparent === 1 ? '' : 's') + ' remaining.' );
			return (' <b><i>' + apparent + ' slot' + ( apparent === 1 ? '' : 's') + ' remaining.</b></i>' );
		},
		reportdue: function(room, connection) {
			var trid = tour[room.id];
			var remslots = trid.size - trid.players.length;
			if (trid.players.length == trid.playerslogged.length) {
				if (connection) connection.sendTo(room, 'There is nothing to report.');
			} else if (trid.players.length == trid.playerslogged.length + 1) {
				var someid = trid.players[trid.playerslogged.length];
				room.addRaw('<b>' + tour.username(someid) + '</b> has joined the tournament.' + tour.remsg(remslots));
				trid.playerslogged.push(trid.players[trid.playerslogged.length]);
			} else {
				var someid = trid.players[trid.playerslogged.length];
				var prelistnames = '<b>' + tour.username(someid) + '</b>';
				for (var i = trid.playerslogged.length + 1; i < trid.players.length - 1; i++) {
					someid = trid.players[i];
					prelistnames = prelistnames + ', <b>' + tour.username(someid) + '</b>';
				}
				someid = trid.players[trid.players.length - 1];
				var listnames = prelistnames + ' and <b>' + tour.username(someid) + '</b>';
				room.addRaw(listnames + ' have joined the tournament.' + tour.remsg(remslots));
				
				trid.playerslogged.push(trid.players[trid.playerslogged.length]);
				for (var i = trid.playerslogged.length; i < trid.players.length - 1; i++) { //the length is disturbed by the push above
					trid.playerslogged.push(trid.players[i]);
				}
				trid.playerslogged.push(trid.players[trid.players.length - 1]);
			}
		},
		joinable: function(uid, rid) {
			var players = tour[rid].players;
			for (var i=0; i<players.length; i++) {
				if (players[i] == uid) return false;
			}
			if (!config.tourallowalts){
				for (var i=0; i<players.length; i++) {
					if (players[i] == uid) return false;
				}
				for (var i=0; i<players.length; i++) {
					for (var j=0; j<Users.get(uid).getAlts().length; j++) {
						if (players[i] == toId(Users.get(uid).getAlts()[j])) return false;
					}
				}
				for (var i=0; i<players.length; i++) {
					for (var j in Users.get(uid).prevNames) {
						if (players[i] == toId(j)) return false;
					}
				}
				for (var i=0; i<players.length; i++) {	
					for (var j=0; j<Users.get(uid).getAlts().length; j++) {
						for (var k in Users.get(Users.get(uid).getAlts()[j]).prevNames) {
							if (players[i] == toId(k)) return false;
						}
					}
				}

			}
			return true;
		},
		lose: function(uid, rid) {
			/*
				if couldn't disqualify return false
				if could disqualify return the opponents userid
			*/
			var loser = "";
			var r = tour[rid].round;
			var tier = toUserid(Tools.data.Formats[tour[rid].tier].name);
			for (var i in r) {
				if (r[i][0] == uid) {
					var key = i;
					var p = 0;
					break;
				} else if (r[i][1] == uid) {
					var key = i;
					var p = 1;
					break;
				}
			}
			if (!key) {
				//user not in tour
				return -1;
			}
			else {
				if (r[key][1] == undefined) {
					//no opponent
					return 0;
				}
				if (r[key][2] != undefined && r[key][2] != -1) {
					//already did match
					return 1;
				}
				var winner = 0;
				var loser = 1;
				if (p == 0) {
					winner = 1;
					loser = 0;
				}
				r[key][2] = r[key][winner];
				tour[rid].winners.push(r[key][winner]);
				tour[rid].losers.push(r[key][loser]);
				loser = r[key][loser];
				tour[rid].history.push(r[key][winner] + "|" + r[key][loser]);
				if (tour[rid].size >= 8) {
					try {
						frostcommands.addTourLoss(loser, tier); //for recording tour stats
					} catch (e) {
						console.log('Error recording tournament loss: '+e.stack);
					}
				}
				return r[key][winner];
			}
		},
		start: function(rid) {
			var isValid = false;
			var numByes = 0;
			if (tour[rid].size <= 4) {
					if (tour[rid].size % 2 == 0) {
						isValid = true;
					} else {
						isValid = true;
						numByes = 1;
				}
			}
			do {
				var numPlayers = ((tour[rid].size - numByes) / 2 + numByes);
				do {
					numPlayers = numPlayers / 2;
				}
				while (numPlayers > 1);
				if (numPlayers == 1) isValid = true; else numByes++;
			}
			while (isValid == false);
			var r = tour[rid].round;
			var sList = tour[rid].players;
			tour.shuffle(sList);
			var key = 0;
			do {
				if (numByes > 0) {
					r.push([sList[key], undefined, sList[key]]);
					tour[rid].winners.push(sList[key]);
					tour[rid].byes.push(sList[key]);
					numByes -= 1
					key++;
				}
			}
			while (numByes > 0);
			do {
				var match = new Array(); //[p1, p2, result]
				match.push(sList[key]);
				key++;
				match.push(sList[key]);
				key++;
				match.push(undefined);
				r.push(match);
			}
			while (key != sList.length);
			tour[rid].roundNum++;
			tour[rid].status = 2;
			tour.startRaw(rid);
		},
		startRaw: function(i) {
			var room = Rooms.rooms[i];
			var html = '<hr /><h3><font color="green">Round '+ tour[room.id].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Tools.data.Formats[tour[room.id].tier].name + "<hr /><center>";
			var round = tour[room.id].round;
			var firstMatch = false;
			for (var i in round) {
				if (!round[i][1]) {
						var p1n = tour.username(round[i][0]);
						if (p1n.substr(0, 6) === 'Guest ') p1n = round[i][0];
						html += "<font color=\"red\">" + clean(p1n) + " has received a bye!</font><br />";
				}
				else {
					var p1n = tour.username(round[i][0]);
					var p2n = tour.username(round[i][1]);
					if (p1n.substr(0, 6) === 'Guest ') p1n = round[i][0];
					if (p2n.substr(0, 6) === 'Guest ') p2n = round[i][1];
					var tabla = ""; if (!firstMatch) {var tabla = "</center><table align=center cellpadding=0 cellspacing=0>";firstMatch = true;}
					html += tabla + "<tr><td align=right>" + clean(p1n) + "</td><td>&nbsp;VS&nbsp;</td><td>" + clean(p2n) + "</td></tr>";
				}
			}
			room.addRaw(html + "</table>");
		},
		nextRound: function(rid) {
			var w = tour[rid].winners;
			var l = tour[rid].losers;
			var b = tour[rid].byes;
			tour[rid].roundNum++;
			tour[rid].history.push(tour[rid].round);
			tour[rid].round = new Array();
			tour[rid].losers = new Array();
			tour[rid].winners = new Array();
			var firstMatch = false;
			if (w.length == 1) {
				var tourMoney = 0;
				var tooSmall = '';
				var p = 'bucks';
				if (Rooms.rooms[rid].isOfficial || Rooms.rooms[rid].id == 'infinite') {
					if (tour[rid].size >= 32) {
						tourMoney = 3;
					}
					if (tour[rid].size >= 16 && tour[rid].size < 32) {
						tourMoney = 2;
					}
					if (tour[rid].size < 16 && tour[rid].size >= 8) {
						tourMoney = 1;
						p = 'buck';
					}
					if (tour[rid].size < 8) {
						tourMoney = 0;
						tooSmall = tooSmall + '(the tour was too small)';
					}
				} else {
					tooSmall += '(this is not an official chatroom)';
				}
				//end tour
				Rooms.rooms[rid].addRaw('<h2><font color="green">Congratulations <font color="black">' + Users.users[w[0]].name + '</font>!  You have won the ' + Tools.data.Formats[tour[rid].tier].name + ' Tournament!<br>You have also won ' + tourMoney + ' Frost ' + p + '! ' + tooSmall + '</font></h2>' + '<br><font color="blue"><b>SECOND PLACE:</b></font> ' + Users.users[l[0]].name + '<hr />');			
				if (tour[rid].size >= 8) {
					try {
						frostcommands.addTourWin(Users.users[w[0]].name, Tools.data.Formats[tour[rid].tier].name); //for recording tour stats
						} catch (e) {
						console.log('Error recording tournament win: '+e.stack);
					}
				}
				//for now, this is the only way to get points/money
				var data = fs.readFileSync('config/money.csv','utf8')
				var match = false;
				var money = 0;
				var row = (''+data).split("\n");
				var line = '';
				for (var i = row.length; i > -1; i--) {
					if (!row[i]) continue;
					var parts = row[i].split(",");
					var userid = toUserid(parts[0]);
					if (Users.users[w[0]].userid == userid) {
						var x = Number(parts[1]);
						var money = x;
						match = true;
						if (match === true) {
							line = line + row[i];
							break;
						}
					}
				}
				Users.users[w[0]].money = money;
				Users.users[w[0]].money = Users.users[w[0]].money + tourMoney;
				if (match === true) {
					var re = new RegExp(line,"g");
					fs.readFile('config/money.csv', 'utf8', function (err,data) {
					if (err) {
						return console.log(err);
					}
					var result = data.replace(re, Users.users[w[0]].userid+','+Users.users[w[0]].money);
					fs.writeFile('config/money.csv', result, 'utf8', function (err) {
						if (err) return console.log(err);
					});
					});
				} else {
					var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
					log.write("\n"+Users.users[w[0]].userid+','+Users.users[w[0]].money);
				}
				tour[rid].status = 0;
				if (tourMoney > 0) fs.appendFile('logs/transactions.log','\n'+Date()+': '+Users.users[w[0]].name+' has won '+tourMoney+' '+p+' from a tournament in '+Rooms.rooms[rid].title+'. They now have '+Users.users[w[0]].money);	
			} else {
				var html = '<hr /><h3><font color="green">Round '+ tour[rid].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Tools.data.Formats[tour[rid].tier].name + "<hr /><center>";
				var pBye = new Array();
				var pNorm = new Array();
				var p = new Array();
				for (var i in w) {
					var byer = false;
					for (var x in b) {
						if (b[x] == w[i]) {
							byer = true;
							pBye.push(w[i]);
						}
					}
					if (!byer) {
						pNorm.push(w[i]);
					}
				}
				for (var i in pBye) {
					p.push(pBye[i]);
					if (typeof pNorm[i] != "undefined") {
						p.push(pNorm[i]);
						pNorm.splice(i, 1);
					}
				}
				for (var i in pNorm) p.push(pNorm[i]);
				for (var i = 0; p.length / 2 > i; i++) {
					var p1 = i * 2;
					var p2 = p1 + 1;
					tour[rid].round.push([p[p1], p[p2], undefined]);
					var p1n = tour.username(p[p1]);
					var p2n = tour.username(p[p2]);
					if (p1n.substr(0, 6) === 'Guest ') p1n = p[p1];
					if (p2n.substr(0, 6) === 'Guest ') p2n = p[p2];
					var tabla = "";if (!firstMatch) {var tabla = "</center><table align=center cellpadding=0 cellspacing=0>";firstMatch = true;}
					html += tabla + "<tr><td align=right>" + clean(p1n) + "</td><td>&nbsp;VS&nbsp;</td><td>" + clean(p2n) + "</td></tr>";
				}
				Rooms.rooms[rid].addRaw(html + "</table>");
			}
			tour[rid].battlesended = [];
		},
	};

	for (var i in tourStuff) tour[i] = tourStuff[i];
	for (var i in Tools.data.Formats) {
			if (Tools.data.Formats[i].effectType == 'Format' && Tools.data.Formats[i].challengeShow) {
				tour.tiers.push(i);
			}
	}
	if (typeof tour.timers == "undefined") tour.timers = new Object();
	if (typeof tour.currentSeconds == "undefined") {
		tour.currentSeconds = 0;
		tour.timerLoop();
	}
	for (var i in Rooms.rooms) {
		if (Rooms.rooms[i].type == "chat" && !tour[i]) {
			tour[i] = new Object();
			tour.reset(i);
		}
	}
	return tour;
};
function clean(string) {
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}
/*********************************************************
 * Commands
 *********************************************************/
var cmds = {
	survey: 'poll',
	poll: function(target, room, user) {
		if (!tour.lowauth(user,room)) return this.sendReply('You do not have enough authority to use this command.');
		if (tour[room.id].question) return this.sendReply('There is currently a poll going on already.');
		var separacion = "&nbsp;&nbsp;";
		var answers = tour.splint(target);
		formats = ''; 
		for (var u in Tools.data.Formats) {
			if (Tools.data.Formats[u].name && Tools.data.Formats[u].challengeShow) formats = formats+','+Tools.data.Formats[u].name;
		}
		formats = 'Tournament'+formats;
		if (answers[0] == 'tournament' || answers[0] == 'tour') answers = tour.splint(formats);
		if (answers.length < 3) return this.sendReply('Correct syntax for this command is /poll question, option, option...');
		var question = answers[0];
		question = clean(question);
		answers.splice(0, 1);
		var answers = answers.join(',').toLowerCase().split(',');
		tour[room.id].question = question;
		tour[room.id].answerList = answers;
		tour[room.id].usergroup = config.groupsranking.indexOf(user.group);
		room.addRaw('<div class="infobox"><h2>' + tour[room.id].question + separacion + '<font size=2 color = "#939393"><small>/vote OPTION<br /><i><font size=1>Poll started by '+user.name+'</font size></i></small></font></h2><hr />' + separacion + separacion + " &bull; " + tour[room.id].answerList.join(' &bull; ') + '</div>');
	},
	
	vote: function(target, room, user) {
		var ips = JSON.stringify(user.ips);
		if (!tour[room.id].question) return this.sendReply('There is no poll currently going on in this room.');
		if (!target) return this.parse('/help vote');
		if (tour[room.id].answerList.indexOf(target.toLowerCase()) == -1) return this.sendReply('\'' + target + '\' is not an option for the current poll.');
		tour[room.id].answers[ips] = target.toLowerCase();
		return this.sendReply('You are now voting for ' + target + '.');
	},
	
	votes: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReply('NUMBER OF VOTES: ' + Object.keys(tour[room.id].answers).length);
	},
	
	endsurvey: 'endpoll',
	ep: 'endpoll',
	endpoll: function(target, room, user) {
		if (!tour.lowauth(user,room)) return this.sendReply('You do not have enough authority to use this command.');
		if (!tour[room.id].question) return this.sendReply('There is no poll to end in this room.');
		if (tour[room.id].usergroup > config.groupsranking.indexOf(user.group)) return this.sendReply('You cannot end this poll as it was started by a user of higher auth than you.');
		var votes = Object.keys(tour[room.id].answers).length;
		if (votes == 0) {
			tour[room.id].question = undefined;
			tour[room.id].answerList = new Array();
			tour[room.id].answers = new Object();
			return room.addRaw("<h3>The poll was canceled because of lack of voters.</h3>");			
		}
		var options = new Object();
		var obj = tour[room.id];
		for (var i in obj.answerList) options[obj.answerList[i]] = 0;
		for (var i in obj.answers) options[obj.answers[i]]++;
		var sortable = new Array();
		for (var i in options) sortable.push([i, options[i]]);
		sortable.sort(function(a, b) {return a[1] - b[1]});
		var html = "";
		for (var i = sortable.length - 1; i > -1; i--) {
			//console.log(i);
			var option = sortable[i][0];
			var value = sortable[i][1];
			if (value > 0) html += "&bull; " + option + " - " + Math.floor(value / votes * 100) + "% (" + value + ")<br />";
		}
		room.addRaw('<div class="infobox"><h2>Results to "' + obj.question + '"<br /><i><font size=1 color = "#939393">Poll ended by '+user.name+'</font></i></h2><hr />' + html + '</div>');		tour[room.id].question = undefined;
		tour[room.id].answerList = new Array();
		tour[room.id].answers = new Object();
	},
	
	pollremind: 'pr',
	pr: function(target, room, user) {
		var separacion = "&nbsp;&nbsp;";
		if (!tour[room.id].question) return this.sendReply('There is currently no poll going on.');
		if (!this.canBroadcast()) return;
		this.sendReply('|raw|<div class="infobox"><h2>' + tour[room.id].question + separacion + '<font font size=1 color = "#939393"><small>/vote OPTION</small></font></h2><hr />' + separacion + separacion + " &bull; " + tour[room.id].answerList.join(' &bull; ') + '</div>');
	},
};

for (var i in cmds) CommandParser.commands[i] = cmds[i];
