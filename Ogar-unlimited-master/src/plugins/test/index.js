'use strict'; // don't touch
this.command = []; // don't touch
this.commandName = []; // don't touch
this.gamemodeId = []; // don't touch
this.gamemode = []; // don't touch
this.addToHelp = []; // don't touch

// [General]
this.name = "Test"; // Name of plugin REQUIRED
this.author = "SharkFin"; // author REQUIRED
this.description = ''; // Desciprtion
this.compatVersion = ''; // compatable with (optional)
this.version = '1.0.0'; // version REQUIRED

// Command examples
// Create your plugin command name, as first array of commandName, and command
this.commandName[0] = "say";

// this.command[0] will listen for the MyPlugin command, which will return gameServer, and arguments.
this.command[0] = function(gameServer, args){
    switch(args[1]){
        default:
            if(typeof(parseInt(args[1]))==='number'){
                // set messages length
                var messages = require(__dirname + "/messages.json");

                var con = JSON.stringify(messages.messages[args[1]]);
                var conr = con.replace("{", "").replace("}", "").replace(/"/g, "");
                var msg = conr.split(':');

                // send message
                var sendmsg = [];
                sendmsg[1] = "all";
                sendmsg[2] = msg;
                gameServer.consoleService.execCommand("chat", sendmsg);
            }
            break;

    }
}

// Add plugin command to the help
this.addToHelp[0] = "say [number]";

// Set Configurations
this.config = {
    thisIsAConfig: 1,
    anotherOne: true,
    aStringOne: "Okay"
};

// Load configuration file
this.configfile = "config.ini"; // your config file name

// Initialization of the plugin
this.init = function (gameServer, config) {};

// This is ranned every second
this.onsecond = function(gameServer) {};

// This is called before a player enters the game
this.beforespawn = function(player){

    // return true allows the socket to connect into game,
    // otherwise false will deny
    return true;
};

// This is called before a player ejects mass
this.beforeeject = function(player){
    return true;
};

// This is called before a player splits
this.beforesplit = function(player){
    return true;
};

// This is needed so that the PluginLoader can get this required content.
module.exports = this; // don't touch
