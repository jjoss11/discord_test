const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const fs = require('fs');

//arrays storing possible insults
const insults_adj = ['narrow-minded', 'pig-headed', 'fatuous', 'vulgar', 'feckless',' churlish', 'vapid', 'boorish', 'domineering', 'shiftless'];
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

let dictionary_file = fs.readFileSync('./words.txt').toString('utf-8');
let dictionary = dictionary_file.split('\n');

function in_dict(word) {
    for (let i = 0; i < dictionary.length; i++) {
        if (dictionary[i].toUpperCase() === word.toUpperCase())
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
function dict_to_string(dict){
    let string = '';
    for(let i = 1; i < dict.length; i++){
        if(i !== dict.length - 1)
            string += dict[i] + '\n';
        else
            string += dict[i];
    }
    return string;
}
function remove_from_dict(words, user){
    let response = '';
    for(let i = 0; i < words.length; i++){
        if(!in_dict(words[i])){
            response += 'Everybody pay attention! This guy is a ' + get_insult() + '. They tried to add ';
            response += '\" ' + words[i] + '\" to the dictionary when it wasn\'t even in there.\n\n';
        }
        else {
            for(let j = 0; j < dictionary.length; j++){
                if(words[i].toUpperCase() === dictionary[j].toUpperCase()){
                    dictionary.splice(j, 1);
                    fs.writeFileSync('words.txt', dict_to_string(dictionary));
                    console.log('here');

                    break;
                }
            }
            response += user.name + ' has successfully removed \"' + words[i] + '\" from the dictionary.\n\n';
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
function check_spelling(message, channelID){
    let words = message.split(" ");
    for(let i = 0; i < words.length; i++){
        if(!(in_dict(remove_punc(words[i])))){
            bot.sendMessage({
                to: channelID,
                message: 'You ' + get_insult() + ', \"' + remove_punc(words[i]) + '\" is not a word.'
            });
        }
    }
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
            case 'remove':
                bot.sendMessage({
                    to: channelID,
                    message: remove_from_dict(args, user)
                });
                break;
        }   // Just add any case commands if you want to..
    }
    //don't check spelling when the message is a command (i.e. doesnt start with `!`)
    else{
        if(user !== bot.username) {
            check_spelling(message, channelID);
        }
    }

});
