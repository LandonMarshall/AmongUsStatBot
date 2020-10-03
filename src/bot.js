const Discord = require('discord.js');
const { basename } = require('path');
const { BOT_TOKEN, PREFIX } = require('../config.json');

const client = new Discord.Client();
let playerCollection = new Discord.Collection();
const matchHistory = [];

let statTemplate = {
  imposterWins: 0,
  imposterLosses: 0,
  crewmateWins: 0,
  crewmateLosses: 0 
}
let stats = {}

client.once('ready', () => {
	console.log('Ready!');
});

function checkValidMentions(mentions) {
  if (mentions.length === 0) {
    return false;
  }
  for (let [key, value] of mentions) {
    // If one of the members isn't in the game don't track stats
    if (!playerCollection.get(key)){ 
      return false;
    }
  }
    return true;
}

function addPlayer(key, value) {
    if (playerCollection.get(key)){
      return `${value} is already currently in this lobby.\n`;
    }
    else {
      if (!(key in stats)){
        stats[key] = statTemplate
      }
      playerCollection.set(key, value);
      return `${value} added!\n`;
    }
}

function removePlayer(key, value) {
  if (playerCollection.get(key)){
    playerCollection.delete(key);
    return `${value} removed!\n`;
  }
  else {
    return `${value} is not currently in this lobby.\n`;
  }
}

function printPlayersList() {
  const playerArray = Array.from(playerCollection.values());
  return(
    `\nThe lobby contains the following ${playerArray.length} players: \n${playerArray.join("\n")}`
  )
}

function printResultSummary() {
  let resultSummary = '';
  let index = 1;
  matchHistory.forEach((match) => {
    resultSummary += index + '. ' + match.result + ' ' + match.imposters.join(' & ') + '\n';
    index++;
  });
  if (resultSummary === ''){
    resultSummary = 'No results to display';
  }
  return resultSummary;
}

client.on('message', message => {
	if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  // TODO: add if statement for if channel name is stats

	const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const mentions = message.mentions.users;

  // ###########         !addPlayer        ############## 
  if (command === 'addplayer' || command === 'addplayers') {
    let finalReturnMessage = '';
    for (let [key, value] of mentions) {
      const returnMessage = addPlayer(key, value);
      finalReturnMessage += returnMessage;
    }    
    if (finalReturnMessage === ''){
      finalReturnMessage = 'Invalid format, must add valid players';
    }
    message.channel.send(finalReturnMessage);
    message.channel.send(`Updated Lobby:\n${printPlayersList()}`)
  }

  // ###########         !removePlayer        ############## 
  else if (command === 'removeplayer' || command === 'removeplayers') {
    for (let [key, value] of mentions) {
      const returnMessage = removePlayer(key, value);
      message.channel.send(returnMessage);
    }    
    message.channel.send(`Updated Lobby:\n${printPlayersList()}`)
  }
  
  // ###########         !resetplayers       ############## 
  else if (command === 'resetplayers') {
    message.channel.send(`Players Reset.`);
    playerCollection.clear();
    message.channel.send(`Updated Lobby:\n${printPlayersList()}`)
  }

    // ###########         !players        ############## 
    else if (command === 'players') {
      message.channel.send(`\n${printPlayersList()}`)
    }
  
  
  // ###########         !win        ############## 
  else if (command === 'win' || command === 'won') {
    const validMentions = checkValidMentions(mentions);

    if (validMentions && mentions.size > 0){
      const impostersArray = Array.from(mentions.values());
      const playersArray = Array.from(playerCollection.values());
      matchHistory.push({imposters: impostersArray, players: playersArray, result: 'Win '});
      message.channel.send(`Imposters ${impostersArray.join(' & ')} have won!\nCrewmates have lost.\n\n${printResultSummary()}`);
      console.log(matchHistory);
    }
    else {
    message.channel.send(`Invalid Imposter - stats not tracked`);
    }
  }

  // ###########         !lose        ############## 
  else if (command === 'lose' || command === 'lost') {
    const validMentions = checkValidMentions(mentions);

    if (validMentions && mentions.size > 0){
      const impostersArray = Array.from(mentions.values());
      const playersArray = Array.from(playerCollection.values());
      matchHistory.push({imposters: impostersArray, players: playersArray, result: 'Lose '});
      message.channel.send(`Crewmates have won!\nImposters ${impostersArray.join(' & ')} have lost.\n\n${printResultSummary()}`);
      console.log(matchHistory);
    }
    else {
      message.channel.send(`Invalid Imposter - stats not tracked`);
    }
  }

  else if (command === 'results') {
    message.channel.send(printResultSummary());
  }

  else if (command === 'undo') {
    matchHistory.pop();
    message.channel.send('Last match undone, new results:\n' + printResultSummary());
  }

  else if (command === 'stats') {
    console.log(message.author);
    matchHistory.forEach((game) => {
      if (game.players.includes(message.author)){
        console.log('player played');
      }
    });
  }
	// other commands...
});

client.login(BOT_TOKEN);