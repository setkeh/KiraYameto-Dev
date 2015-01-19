//Import the Libs
var IRC = require('internet-relay-chat');
var request = require("request");
var os = require("os");
var fs =  require("fs");
var github = require('octonode');
var ddg = require('ddg');

// Create the configuration
var config = {
channels: ["#thesetkehproject", "#linuxdistrocommunity"],
server: "irc.freenode.net",
port: "7000",
username: "KiraYameto",
nick: "KiraYameto",
password: "PASSWORD",
autoReconnect: 150,
floodDelay: 1000,
secure: true,
autoRejoin: true,
debug: true,
vhost: null,
realname: "LDC ADMIN BOT",
trigger: "!",
machine: "RaspberryPi", // This is Machine type for example "Dell Poweredge 2650"
maintainer: "SETKEH" // Yourname Here.
};

//Create the bot instance.
var bot = new IRC({
server: config.server, 
username: config.username,
nick: config.nick,
password: config.password,
realname: config.realname,
port: config.port,
autoConnect: config.autoConnect,
floodDelay: config.floodDelay,
secure: config.secure,
autoRejoin: config.autoRejoin,
vhost: config.vhost,
debug: config.debug
});

//Inform the Console we're connected.
bot.on('connect', function() {
    console.log('Bot connected');
});

//Start the bot
bot.connect();

//Once Reg'ed with the Server (Handshake wit IRCD)
bot.on('registered', function() {
    bot.join(config.channels[0]);
    bot.join(config.channels[1]);
});

//Channel message Example.
/*bot.on('message', function(sender, channel, message) {
		if (message == config.trigger + 'test')
		{
			bot.message(channel, "test");
		}
		console.log(sender + channel + message)
}); */

bot.on('message', function(sender, channel, message){
  var isquoted = message.split(" ");

  for (var i = 0; i < isquoted.length; i++) {
    if (isquoted[i].match(config.trigger + "ddg")) {

      if (isquoted[1].match("\"")) {
        var msgArray = message.split("\"");
        ddg.query(msgArray[1], function(err, data){
        results = data.RelatedTopics; //related topics is a list of 'related answers'
        bot.message(channel, ''+results[0].FirstURL)
        bot.message(channel, '-- '+results[0].Text)
       });
    }
    else {
    	bot.message(channel, "Search Strings Must Be Encased in Quotes.")
    }
}
}
});

//Start URL Scraping
bot.on('message', function(sender, channel, message) {
	var msgArray = message.split(" ");
	var Chan = channel
	//console.log(message);
    for (var i = 0; i < msgArray.length; i++) {

      if (msgArray[i].match(".jpg") || msgArray[i].match(".png") || msgArray[i].match("imgur") || msgArray[i].match(".gif") || msgArray[i].match("McClane2")) {
        console.log(Chan, "Ignoring Image");
      } else {

        if (msgArray[i].match("http://") || msgArray[i].match("https://")) {
          var url = msgArray[i];

          request({uri: url}, function(err, response, body) {

            if (!err && response.statusCode) {
              var regex_match = body.match(/<title>(.+?)<\/title>/)[1];
              bot.message(Chan,  "[ Page Title: " + url + " " + regex_match + " ]");
            } else {
              bot.message(Chan, url + " Could not be found");
              bot.message(Chan, err.message);
            }

          });
        };
      };
    }
});

// Listen for joins
bot.on("join", function(user, channel) {
  // Welcome them in!
  if ((user.nick) != config.nick) {
    if ((channel) == "#thesetkehproject") {
      bot.message(channel, user.nick + " Duuuuuude Welcome to the " + channel + "!!");
    };
  };
});

// Reply to highlights in Channels.
bot.on("message", function(sender, channel, message) {
  msgArray = message.split(" ");
  console.log(msgArray);
  if (msgArray[0] == config.nick + ":") {
    bot.message(channel, sender.nick + ": " + "I am not the Droid you're looking for! Move Along Move Along.");
  };
});

// Listen for any message, PM said user when he posts
bot.on("pm", function(sender, message) {
  bot.message(sender.nick, "I am a Bot and my Brains Fell Out");
});

// Start About Command
bot.on('message', function (sender, channel, message) {
  if (message == config.trigger + "about") {
    var cpus = os.cpus();
    var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    //for(var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[0];

      bot.message(channel, sender.nick + " I Have Pm'd You My About Details.");
      bot.message(sender.nick, "Bot Name: " + config.nick);
      bot.message(sender.nick, "Operating System: " + os.release());
      bot.message(sender.nick, "Architecture: " + os.arch());
      bot.message(sender.nick, "Machine Type: " + config.machine);
      bot.message(sender.nick, "CPU: " + cpu.model);
      bot.message(sender.nick, "CPU Speed: " + cpu.speed + "MHz");
      bot.message(sender.nick, "CPU Temp: " + (temperature/1000).toPrecision(3) + "°C");
      bot.message(sender.nick, "Total Mem: " + os.totalmem() + " Free Mem: " + os.freemem());
      bot.message(sender.nick, "Uptime: " + (os.uptime()/60/1000).toPrecision(3) + " Days");
      bot.message(sender.nick, "Maintainer: " + config.maintainer);
    //};
  };
});
// End About

//Git Webhook for Irc Post
var gith = require('gith').create( 9001 );

gith({}).on( 'all', function( payload ) {


  var gitdata = {
    update: 'Github Update: ',
    title: payload.repo,
    head: payload.urls.head,
    added: payload.files.added,
    modded: payload.files.modified,
    deleted: payload.files.deleted,
    comment: payload.original.head_commit.message,
    pusher: payload.original.pusher.name,
    url: payload.original.repository.url
  };

  var addedFiles = "";
   
  if(!gitdata.added.length < 1) {
    addedFiles += "Files Added: ";
        
    for(var i = 0; i < gitdata.added.length; i++) {
      if(gitdata.added.length == 1 || i == 0) {
        addedFiles += gitdata.added[0];
      } else {
        addedFiles += (", " + gitdata.added[i]);
      }
    }
  }

  var moddedFiles = "";
   
  if(!gitdata.modded.length < 1) {
    moddedFiles += "Files Modified: ";
      
  for(var i = 0; i < gitdata.modded.length; i++) {
      if(gitdata.modded.length == 1 || i == 0) {
        moddedFiles += gitdata.modded[0];
      } else {
        moddedFiles += (", " + gitdata.modded[i]);
      }
    }
  }

  var deletedFiles = "";
   
  if(!gitdata.deleted.length < 1) {
  deletedFiles += "Files Deleted: ";
      
  for(var i = 0; i < gitdata.deleted.length; i++) {
      if(gitdata.deleted.length == 1 || i == 0) {
        deletedFiles += gitdata.deleted[0];
      } else {
        deletedFiles += (", " + gitdata.deleted[i]);
      }
    }
  }

  bot.message( '#thesetkehproject', gitdata.update + gitdata.comment );
  bot.message( '#thesetkehproject', 'Repo: ' + gitdata.title );
  bot.message( '#thesetkehproject', addedFiles );
  bot.message( '#thesetkehproject', moddedFiles );
  bot.message( '#thesetkehproject', deletedFiles );
  bot.message( '#thesetkehproject', 'Pusher: ' + gitdata.pusher );
  bot.message( '#thesetkehproject', 'Clone this Repo: ' + 'git clone ' + gitdata.url + '.git');
  bot.message( '#thesetkehproject', gitdata.head );
});
// End Github Webhook.

// Start Github Search
bot.on('message', function (sender, channel, message) {
  var isquoted = message.split(" ");

  for (var i = 0; i < isquoted.length; i++) {
    if (isquoted[i].match(config.trigger + "github")) {

      if (isquoted[1].match("\"")) {
        var msgArray = message.split("\"");
        var url = "https://api.github.com/search/repositories?q=";
        var urlescape = "%20";

        for (var i = 0; i < msgArray.length; i++) {

          if (msgArray[i].match(config.trigger + "github")) {
            var msgArray2 = msgArray[1].split(" ");

            if (msgArray2.length == 1) {

              request({uri: url + msgArray[1] + "&sort=stars&order=desc", headers: {'User-Agent': config.nick}},
                function(err, response, body) {

                if (!err && response.statusCode) {
                  var results = JSON.parse(body);
                  var returnurl = "https://github.com/" + results.items[0].full_name + "/";

                  if (results.items.length == 0){
                    bot.message(channel, "Search Returned No Results");
                  } else {
                    bot.message(channel, "Top Github Search Result: " + returnurl);
                  }

                };

              });

            } else if (msgArray2.length == 2) {
              request({uri: url + msgArray2[0] + urlescape + msgArray2[1] + "&sort=stars&order=desc", headers: {'User-Agent': config.nick}},
                function(err, response, body) {

                  if (!err && response.statusCode) {
                    var results = JSON.parse(body);
                    var returnurl = "https://github.com/" + results.items[0].full_name + "/";

                    if (results.items.length == 0){
                      bot.message(channel, "Search Returned No Results");
                    } else {
                      bot.message(channel, "Top Github Search Result: " + returnurl);
                    }
                  }
                }
            )};
          };
        };
      } else {
        bot.message(channel, "Search Strings Must be Encased in Quotes")
      }
    }
  }
});
// End Github Search

process.on('uncaughtException', function (err) {
  console.log("ERROR: " + err);
})
