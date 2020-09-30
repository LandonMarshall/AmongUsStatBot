const Discord = require('discord.js');
const { basename } = require('path');
const { BOT_TOKEN, PREFIX } = require('../config.json');

const client = new Discord.Client();
let playerCollection = new Discord.Collection();

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

client.on('message', message => {
	if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  // TODO: add if statement for if channel name is stats

	const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const mentions = message.mentions.users;

  // ###########         !addPlayer        ############## 
  if (command === 'addplayer' || command === 'addplayers') {
    for (let [key, value] of mentions) {
      const returnMessage = addPlayer(key, value);
      message.channel.send(returnMessage);
    }    
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
    let validMembers = true;
    for (let [key, value] of mentions) {
      // If one of the members isn't in the game don't track stats
      if (!playerCollection.get(key)){ 
        validMembers = false;
        message.channel.send(`${value} is not currently in the list of players.`)
      }
    }
    if (validMembers && mentions.size > 0){
      const playerArray = Array.from(mentions.values());
      message.channel.send(`Imposters ${playerArray.join(' & ')} have won!\nCrewmates have lost.`)
    }
    else {
    message.channel.send(`Invalid Imposter - stats not tracked`);
    }
  }

  // ###########         !lose        ############## 
  else if (command === 'lose' || command === 'lost') {
    let validMembers = true;
    for (let [key, value] of mentions) {
      // If one of the members isn't in the game don't track stats
      if (!playerCollection.get(key)){ 
        validMembers = false;
        message.channel.send(`${value} is not currently in the list of players.`)
      }
    }
    if (validMembers && mentions.size > 0){
      const playerArray = Array.from(mentions.values());
      message.channel.send(`Crewmates have won!\nImposters ${playerArray.join(' & ')} have lost.`)
      for (let [key, value] of mentions) {
        stats[key].imposterLosses += 1;
      }
      console.log(stats);
    }
    else {
      message.channel.send(`Invalid Imposter - stats not tracked`);
    }
  }
	// other commands...
});

client.login(BOT_TOKEN);