//Import the Libs
var IRC = require('internet-relay-chat');
var config = require("./config.json");
var request = require("request");
var os = require("os");
var fs =  require("fs");
var github = require('octonode');
var gith = require('gith').create( 9001 );
var Docker = require('dockerode');
var docker = new Docker(config[2].docker[0]);
var PASS = fs.readFileSync("services.password");
var trigger = config[0].irc[0].trigger

//Create the bot instance.
var bot = new IRC({
server: config[0].irc[0].server,
username: config[0].irc[0].nick,
nick: config[0].irc[0].nick,
password: PASS,
realname: config[0].irc[0].realname,
port: config[0].irc[0].port,
autoReconnect: config[0].irc[0].autoReconnect,
floodDelay: config[0].irc[0].floodDelay,
secure: config[0].irc[0].secure,
autoRejoin: config[0].irc[0].autoRejoin,
vhost: config[0].irc[0].vhost,
debug: config[0].irc[0].debug
});

//Inform the Console we're connected.
bot.on('connect', function() {
    console.log('Bot connected');
});

//Start the bot
bot.connect();

//Once Reg'ed with the Server (Handshake wit IRCD)
bot.on('registered', function() {
    bot.join(config[0].irc[0].channels[0].ldc);
    bot.join(config[0].irc[0].channels[0].tskp);
});

//Start Docker API intergration
bot.on('message', function(sender, channel, message) {
  if (message == trigger + "listcontainers") {
    docker.listContainers({all: true}, function(err, containers) {
      for(var i = 0; i < containers.length; i++) {
        bot.message(channel, IRC.colors.cyan + "Name: " + IRC.colors.black + containers[i].Names + IRC.colors.cyan + " Status: " + IRC.colors.black + containers[i].Status);
      }
    });
  }
  if (message == trigger + "listimages") {
    docker.listImages({all: false}, function(err, images) {
      for(var i = 0; i < images.length; i++) {
        bot.message(channel, images[i].RepoTags + IRC.colors.cyan + " Size: " + IRC.colors.black + (images[0].VirtualSize/1024/1024).toPrecision(4) + "MB");
      }
    });
  }
  if (message == config.trigger + "dockerver") {
    docker.version(function(err, ver) {
        bot.message(channel, IRC.colors.cyan + "Docker Version: " + IRC.colors.black + ver.Version);
        bot.message(channel, IRC.colors.cyan + "Running on: " + IRC.colors.black + ver.Os + " " + ver.KernelVersion + " " + ver.Arch);
        bot.message(channel, IRC.colors.cyan + "Go Version: " + IRC.colors.black + ver.GoVersion);
      });
  }
});

//Reverse Command
bot.on('message', function(sender, channel, message) {
  if (message == config.trigger + "reverse") {
    var msgArray = message.split(" ");
    bot.message(channel, IRC.colors.reverse + msgArray);
  }
});

//Start URL Scraping
bot.on('message', function(sender, channel, message) {
	var msgArray = message.split(" ");
	var Chan = channel
  if (Chan != "#linuxdistrocommunity") { // Now LDC has LDC-BOT we dont need to Scrap that Channel.
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
    };
  }
});

// Listen for joins
bot.on("join", function(user, channel) {
  // Welcome them in!
  if ((user.nick) != config[0].irc[0].nick) {
    if ((channel) == "#thesetkehproject") {
      bot.message(channel, user.nick + " Duuuuuude Welcome to the " + channel + "!!");
    };
  };
});

// Reply to highlights in Channels.
bot.on("message", function(sender, channel, message) {
  msgArray = message.split(" ");
  console.log(msgArray);
  if (msgArray[0] == config[0].irc[0].nick + ":") {
    bot.message(channel, sender.nick + ": " + "I am not the Droid you're looking for! Move Along Move Along.");
  };
});

// Listen for any message, PM said user when he posts
bot.on("pm", function(sender, message) {
  bot.message(sender.nick, "I am a Bot and my Brains Fell Out");
});

// Start About Command
bot.on('message', function (sender, channel, message) {
  if (message == trigger + "about") {
    var cpus = os.cpus();
      var ops = os.release();

    //for(var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[0];

      bot.message(channel, sender.nick + " I Have Pm'd You My About Details.");
<<<<<<< HEAD
      bot.message(sender.nick, "Bot Name: " + config[0].irc[0].nick);
      bot.message(sender.nick, "Operating System: " + os.release());
      bot.message(sender.nick, "Architecture: " + os.arch());
      bot.message(sender.nick, "Machine Type: " + config[1].general[0].machine);
      bot.message(sender.nick, "CPU: " + cpu.model);
      bot.message(sender.nick, "CPU Speed: " + cpu.speed + "MHz");
      bot.message(sender.nick, "CPU Temp: " + (temperature/1000).toPrecision(3) + "°C");
      bot.message(sender.nick, "Total Mem: " + (os.totalmem()/1024/1024/1024).toPrecision(4) + "GB Free Mem: " + (os.freemem()/1024/1024/1024).toPrecision(4) + "GB");
      bot.message(sender.nick, "Uptime: " + (os.uptime()/60/1000).toPrecision(3) + " Days");
      bot.message(sender.nick, "Maintainer: " + config[1].general[0].maintainer);
=======
      bot.message(sender.nick, IRC.colors.lightMagenta + "Bot Name: " + IRC.colors.lightGreen + config.nick);
      bot.message(sender.nick, IRC.colors.lightMagenta + "Operating System: " + IRC.colors.lightGreen + ops);
      bot.message(sender.nick, IRC.colors.lightMagenta + "Architecture: " + IRC.colors.lightGreen + os.arch());
      bot.message(sender.nick, IRC.colors.lightMagenta +"Machine Type: " + IRC.colors.lightGreen + config.machine);
      bot.message(sender.nick, IRC.colors.lightMagenta + "CPU: " + IRC.colors.lightGreen + cpu.model);
      bot.message(sender.nick, IRC.colors.lightMagenta + "CPU Speed: " + IRC.colors.lightGreen + cpu.speed + "MHz");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Total Mem: " + IRC.colors.lightGreen + (os.totalmem()/1024/1024/1024).toPrecision(4) + "GB Free Mem: " + (os.freemem()/1024/1024/1024).toPrecision(4) + "GB");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Uptime: " + IRC.colors.lightGreen + (os.uptime()/60/1000).toPrecision(3) + " Days");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Maintainer: " + IRC.colors.lightGreen + config.maintainer);
>>>>>>> 386b0596240a6492a1cbc27d81fa456ee20604cd
    //};
  };
});
// End About

//Git Webhook for Irc Post
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

// Make Kira Update himself
gith({}).on( 'all', function( payload ) {
var update = require('child_process').fork('git clone');

var gitdata = {
  title: payload.repo,
  url: payload.original.repository.url
}

if ( gitdata.title == "KiraYameto-Dev" ) {
  update.send(gitdata.url)
}
})

process.on('uncaughtException', function (err) {
  console.log("ERROR: " + err);
})
