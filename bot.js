//Import the Libs
var IRC = require('internet-relay-chat');
var request = require("request");
var os = require("os");
var fs =  require("fs");
var github = require('octonode');
var gith = require('gith').create( 9001 );
var Docker = require('dockerode');
var docker = new Docker({host: 'http://192.168.1.120', port: 4243});
var PASS = fs.readFileSync("services.password");

// Create the configuration
var config = {
channels: ["#thesetkehproject", "#linuxdistrocommunity"],
server: "irc.freenode.net",
port: "7000",
username: "KiraYameto",
nick: "KiraYameto",
password: PASS,
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

//Start Docker API intergration
bot.on('message', function(sender, channel, message) {
  if (message == config.trigger + "listcontainers") {
    docker.listContainers({all: true}, function(err, containers) {
      for(var i = 0; i < containers.length; i++) {
        bot.message(channel, IRC.colors.cyan + "Name: " + IRC.colors.black + containers[i].Names + IRC.colors.cyan + " Status: " + IRC.colors.black + containers[i].Status);
      }
    });
  }
  if (message == config.trigger + "listimages") {
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
    if (os.release() == "6.2.9200") {
      var temperature = IRC.colors.lightRed + "Not Supported by this Operating System";
      var ops = "Windows 8 Release: " + os.release();
    } else {
      var temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
      var temperature = IRC.colors.lightGreen + (temp/1000).toPrecision(3) + "°C";
      var ops = os.release();
    }
    //for(var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[0];

      bot.message(channel, sender.nick + " I Have Pm'd You My About Details.");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Bot Name: " + IRC.colors.lightGreen + config.nick);
      bot.message(sender.nick, IRC.colors.lightMagenta + "Operating System: " + IRC.colors.lightGreen + ops);
      bot.message(sender.nick, IRC.colors.lightMagenta + "Architecture: " + IRC.colors.lightGreen + os.arch());
      bot.message(sender.nick, IRC.colors.lightMagenta +"Machine Type: " + IRC.colors.lightGreen + config.machine);
      bot.message(sender.nick, IRC.colors.lightMagenta + "CPU: " + IRC.colors.lightGreen + cpu.model);
      bot.message(sender.nick, IRC.colors.lightMagenta + "CPU Speed: " + IRC.colors.lightGreen + cpu.speed + "MHz");
      bot.message(sender.nick, IRC.colors.lightMagenta + "CPU Temp: " + temperature);
      bot.message(sender.nick, IRC.colors.lightMagenta + "Total Mem: " + IRC.colors.lightGreen + (os.totalmem()/1024/1024/1024).toPrecision(4) + "GB Free Mem: " + (os.freemem()/1024/1024/1024).toPrecision(4) + "GB");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Uptime: " + IRC.colors.lightGreen + (os.uptime()/60/1000).toPrecision(3) + " Days");
      bot.message(sender.nick, IRC.colors.lightMagenta + "Maintainer: " + IRC.colors.lightGreen + config.maintainer);
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

process.on('uncaughtException', function (err) {
  console.log("ERROR: " + err);
})
