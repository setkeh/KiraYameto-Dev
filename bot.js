// Create the configuration
var config = {
channels: ["#thesetkehproject", "#linuxdistrocommunity"],
server: "irc.freenode.net",
botName: "KiraYameto",
userName: "KiraYameto",
password: "Password",
secure: true,
autoRejoin: true,
autoConnect: true,
realName: "LDC ADMIN BOT"
};

// Get the libs
var irc = require("irc");
var request = require("request");
var os = require("os");
var fs =  require("fs"); //Used for Parseing Large Json for output purposes and logging.
var github = require('octonode');

// Create Global Config Variables
var trigger = "!";
var machine = "Raspberrypi"; // This is Machine type for example "Dell Poweredge 2650"
var maintainer = "SETKEH"; // Yourname Here.

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
  autoConnect: config.autoConnect,
  channels: config.channels,
  userName: config.userName,
        realName: config.realName,
        autoRejoin: config.autoRejoin,
        password: config.password
  });

// Use for Dbugging Non Joins.
//console.log(bot);
//console.log(err);

//Log Errors instead of Crashing "Hopefully" TM
bot.addListener('error', function(message) {
console.log('error: ', message);
});

// Listen for joins
bot.addListener("join", function(channel, who) {
// Welcome them in!
if ((who) != config.botName) {
  if ((channel) == "#thesetkehproject") {
bot.say(channel, who + " Duuuuuude Welcome to the" + channel + "!!");
};
};
});

// Listen for any message, PM said user when he posts
bot.addListener("pm", function(from, to, text, message) {
bot.say(from, "I am a Bot and my Brains Fell Out");
});

// Listen for any message, say to him/her in the room
bot.addListener("message#", function(from, to, text, message) {
if ((to) == config.botName) {
bot.say(config.channels[0], "I am not the Droid you're looking for! Move Along Move Along");
};
});

//Git Webhook for Irc Post
var gith = require('gith').create( 9001 );

gith({
}).on( 'all', function( payload ) {


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
}}}

var moddedFiles = "";
 
if(!gitdata.modded.length < 1) {
moddedFiles += "Files Modified: ";
    
for(var i = 0; i < gitdata.modded.length; i++) {
if(gitdata.modded.length == 1 || i == 0) {
moddedFiles += gitdata.modded[0];
} else {
moddedFiles += (", " + gitdata.modded[i]);
}}}

var deletedFiles = "";
 
if(!gitdata.deleted.length < 1) {
deletedFiles += "Files Deleted: ";
    
for(var i = 0; i < gitdata.deleted.length; i++) {
if(gitdata.deleted.length == 1 || i == 0) {
deletedFiles += gitdata.deleted[0];
} else {
deletedFiles += (", " + gitdata.deleted[i]);
}}}

bot.say( '#thesetkehproject', gitdata.update + gitdata.comment );
bot.say( '#thesetkehproject', 'Repo: ' + gitdata.title );
bot.say( '#thesetkehproject', addedFiles );
bot.say( '#thesetkehproject', moddedFiles );
bot.say( '#thesetkehproject', deletedFiles );
bot.say( '#thesetkehproject', 'Pusher: ' + gitdata.pusher );
bot.say( '#thesetkehproject', 'Clone this Repo: ' + 'git clone ' + gitdata.url + '.git');
bot.say( '#thesetkehproject', gitdata.head );
});
// End Github Webhook.

// Start URL Snarfing
bot.addListener('message', function (from, to, message) {
var msgArray = message.split(" ");
var Chan = to
     for (var i = 0; i < msgArray.length; i++) {
      if ((msgArray[i].match(".jpg") || msgArray[i].match(".png") || msgArray[i].match(".gif"))) {
        console.log(Chan, "Ignoring Image");
      }
      else{
         if ((msgArray[i].match("http://") || msgArray[i].match("https://"))) {
             var url = msgArray[i];
              request({uri: url}, function(err, response, body) {
                if (!err && response.statusCode) {
                  var regex_match = body.match(/<title>(.+?)<\/title>/)[1];
                  bot.say(Chan,  "[ Page Title: " + url + " " + regex_match + " ]");
                }
                else {
                  bot.say(Chan, url + " Could not be found");
                  bot.say(Chan, err.message);
                }
                });
         };
      };
    }});
// End URL Snarfing

// Start About Command
bot.addListener('message', function (from, to, message) {
if (message == trigger + "about") {
  var cpus = os.cpus();
  var temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
  for(var i = 0, len = cpus.length; i < len; i++) {
    var cpu = cpus[i];
    bot.say(to, from + " I Have Pm'd You My About Details");
    bot.say(from, "Bot Name: " + config.botName);
    bot.say(from, "Operating System: " + os.release());
    bot.say(from, "Architecture: " + os.arch());
    bot.say(from, "Machine Type: " + machine);
    bot.say(from, "CPU: " + cpu.model);
    bot.say(from, "CPU Speed: " + cpu.speed + "MHz");
    bot.say(from, "CPU Temp: " + (temperature/1000).toPrecision(3) + "°C");
    bot.say(from, "Total Mem: " + os.totalmem() + " Free Mem: " + os.freemem());
    bot.say(from, "Uptime: " + os.uptime() / 60 / 1000 + " Days");
    bot.say(from, "Maintainer: " + maintainer);
  };
};
});
// End About

// Start Github Search
bot.addListener('message', function (from, to, message) { 
  var isquoted = message.split(" ");
  for (var i = 0; i < isquoted.length; i++) {
    if ((isquoted[i].match(trigger + "github"))) {
    if ((isquoted[1].match("\""))) {

var msgArray = message.split("\"");
var url = "https://api.github.com/search/repositories?q=";
var urlescape = "%20";

for (var i = 0; i < msgArray.length; i++) {
  if ((msgArray[i].match(trigger + "github"))) {
    var msgArray2 = msgArray[1].split(" ");
    if (msgArray2.length == 1) {
    request({uri: url + msgArray[1] + "&sort=stars&order=desc", headers: {'User-Agent': 'KiraYameto'}}, function(err, response, body) {
      if (!err && response.statusCode) {
        var results = JSON.parse(body);
        var returnurl = "https://github.com/" + results.items[0].full_name + "/";

    if (results.items.length == 0){
      bot.say(to, "Search Returned No Results");
    }
      else{
        bot.say(to, "Top Github Search Result: " + returnurl);
}
      };
  });
  }
  else if (msgArray2.length == 2) {
    request({uri: url + msgArray2[0] + urlescape + msgArray2[1] + "&sort=stars&order=desc", headers: {'User-Agent': 'KiraYameto'}}, function(err, response, body) {
      if (!err && response.statusCode) {
        var results = JSON.parse(body);
        if (results.items.length == 0){
          bot.say(to, "Search Returned No Results");
    }
    else {
        bot.say(to, "Top Github Search Result: " + returnurl);
      }
      }
    }
  )};
//}
};
};
}
else {
  bot.say(to, "Search Strings Must be Encased in Quotes")
}
}
}
});
// End Github Search
