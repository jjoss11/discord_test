const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fs = require('fs');
const insults_adj = ['narrow-minded', 'pig-headed', 'obstinate', 'intolerant', 'fatuous', 'vulgar', 'feckless',' churlish', 'vapid', 'boorish', 'domineering', 'shiftless'];
const insults_noun = ['Cockalorum', 'Pillock', 'Ninnyhammer', 'Mumpsimus', 'Mooncalf', 'Dingbat', 'Imbecile', 'Philistine', 'troglodyte', 'dummkopf', 'vacuous slug'];
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

let dictionary = dictionary_file.split('\n');
function in_dict(word) {
    for (let i = 0; i < dictionary.length; i++) {
        if (word.toUpperCase() === dictionary[i].toUpperCase())
            return true;
    }
    return false;
}
function add_to_dict(words){
    let response = '';
    for(let i = 0; i < words.length; i++) {
        if (!in_dict(words[i])) {
            fs.appendFileSync("./words.txt", '\n' + words[i]);
            dictionary_file = fs.readFileSync("./words.txt").toString('utf-8');
            dictionary = dictionary_file.split('\n');

            response += '\"' + words[i] + '\" has been added to your dictionary!\n\n';
        } else {
            response += '\"' + words[i] + '\" is already in your dictionary, you ' + get_insult().toUpperCase() + '!\n\n';
        }
    }
    return response;
}
function get_insult(){
    return (insults_adj[Math.floor(Math.random() * insults_adj.length)] + ' ' + insults_noun[Math.floor(Math.random() * insults_noun.length)]).toUpperCase();
}
function remove_punc(word){
    if (! /^[a-zA-Z0-9]+$/.test(word.charAt(0))) {
        word = word.slice(1);
    }
    if (! /^[a-zA-Z0-9]+$/.test(word.charAt(word.length - 1))) {
        word = word.substring(0, word.length-1)
    }
    return word;

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
                    message: add_to_dict(args)
                });
                break;
        }   // Just add any case commands if you want to..
    }
    else{
        let words = message.split(" ");
        if(user !== bot.username) {
            for(let i = 0; i < words.length; i++){
                if(!(in_dict(remove_punc(words[i])))){
                    bot.sendMessage({
                        to: channelID,
                        message: 'You ' + get_insult() + ', \"' + remove_punc(words[i]) + '\" is not a word.'
                    });
                }

            }
        }
    }

});
