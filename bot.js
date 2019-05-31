const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fs = require('fs');

logger.remove(logger.transports.Console);   // Configure logger settings
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

let bot = new Discord.Client({  // Initialize Discord Bot
    token: auth.token,
    autorun: true
});
let dictionary_file = fs.readFileSync("./words.txt").toString('utf-8');
let dictionary = dictionary_file.split("\n");
function in_dict(word) {
    for (let i = 0; i < dictionary.length; i++) {
        if (word.toUpperCase() === dictionary[i].toUpperCase())
            return true;
    }
    return false;
}

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
// Our bot needs to know if it will execute a command
// It will listen for messages that will start with `!`



    if (message.substring(0, 1) === '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            case 'ping':    // !ping
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            case 'add':
                bot.sendMessage({
                    to: channelID,
                    message: 'Added!'
                })
        }   // Just add any case commands if you want to..
    }
    else{
        let words = message.split(" ");
        if(user !== bot.username) {
            for(let i = 0; i < words.length; i++){
                if(!(in_dict(words[i]))){
                    bot.sendMessage({
                        to: channelID,
                        message: 'You FOOL! ' + words[i] + ' is not a word'
                    });
                }

            }
        }
    }


});
