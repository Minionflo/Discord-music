const Discord       = require('discord.js')
const ytdl          = require('ytdl-core')
const ytsr          = require('ytsr');

var client = new Discord.Client()

var config_token = process.env.TOKEN
var config_prefix = process.env.PREFIX
var config_status = process.env.STATUS
var config_statustype = process.env.STATUSTYPE
var config_channel = process.env.CHANNEL
var config_controlchannel = process.env.CONTROLCHANNEL
var config_musicrole = process.env.MUSICROLE

var connection = null
var player = null
var repeat = null
var link = null
var speaking = null
var volume = 100

client.on('ready', () => {
    activity()
    setInterval(activity, 60000)
    console.log(`Online`)
})

function activity() {
    client.user.setActivity(config_status, {type: config_statustype})
}

async function play(link_local, repeat_local) {
    connection = await client.channels.cache.get(config_channel).join();
    link = link_local
    if(repeat_local == "true") { repeat = true } 
    else if(repeat_local == "false") { repeat = false} 
    else { repeat = false }
    player = connection.play(ytdl(link, { filter: 'audioonly', quality: 'highestaudio'}))
    client.channels.cache.get(config_controlchannel).send("Music started")
    client.channels.cache.get(config_controlchannel).send("Link: " + link)
    player.on('speaking', function(speaking_local) {
        speaking = speaking_local
        if(repeat == false) {return} 
        if(speaking == true) {return} 
        if(repeat == true) {
            player = connection.play(ytdl(link, { filter: 'audioonly', quality: 'highestaudio'}))
        }
    })
}


var cmdmap = {
    join : cmd_join,
    playlink : cmd_playlink,
    play : cmd_play,
    stop : cmd_stop,
    quit : cmd_quit,
    pause : cmd_pause,
    resume : cmd_resume
}

async function cmd_join(msg, args) {
    connection = await client.channels.cache.get(config_channel).join();
    client.channels.cache.get(config_controlchannel).send("Joined the voice channel")
}

function cmd_playlink(msg, args) {
    play(args[1], args[0])
}

async function cmd_play(msg, args) {
    var repeat_local = false
    if(args[0] == "true" || args[0] == "false") { repeat_local = args[0]; args.shift() }
    var filters = await ytsr.getFilters(args.join(" ").toString())
    var filter = filters.get('Type').get('Video');
    var raw = await ytsr(filter.url, { limit: 1 })
    var url = raw.items[0].url
    play(url, repeat_local)
}

function cmd_stop(msg, args) {
    if(speaking == false) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can stop"); return}
    player.destroy()
    client.channels.cache.get(config_controlchannel).send("Music stopped")
}

function cmd_quit(msg, args) {
    connection.disconnect()
    client.channels.cache.get(config_controlchannel).send("Quit the voice channel")
}

function cmd_pause(msg, args) {
    if(speaking == false) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can stop"); return}
    player.pause()
    client.channels.cache.get(config_controlchannel).send("Music paused")
}

function cmd_resume(msg, args) {
    if(player.paused != true) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can resume"); return}
    player.resume()
    client.channels.cache.get(config_controlchannel).send("Music resumed")
}

client.on('message', async (msg) => {
    var cont   = msg.content,
        member = msg.member,
        chan   = msg.channel,
        guild  = msg.guild,
        author = msg.author

        if(msg.member.roles.cache.has(config_musicrole) == false) {return}
        if(msg.channel != client.channels.cache.get(config_controlchannel)) {return}
        if (author.id != client.user.id && cont.startsWith(config_prefix)) {
            var invoke = cont.split(' ')[0].substr(config_prefix.length),
                args   = cont.split(' ').slice(1)
            if (invoke in cmdmap) {
                cmdmap[invoke](msg, args)
            }
        }
})

client.login(config_token)