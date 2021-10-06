const Discord       = require('discord.js')
const ytdl          = require('ytdl-core')

var client = new Discord.Client()
var config_token = process.env.TOKEN
var config_prefix = process.env.PREFIX
var config_status = process.env.STATUS
var config_statustype = process.env.STATUSTYPE
var config_channel = process.env.CHANNEL
var config_controlchannel = process.env.CONTROLCHANNEL

var connection = null
var player = null

client.on('ready', () => {
    activity()
    setInterval(activity, 60000)
    console.log(`Online`)
})

function activity() {
    client.user.setActivity(config_status, {type: config_statustype})
}

var cmdmap = {
    join : cmd_join,
    play : cmd_play,
    stop : cmd_stop,
    quit : cmd_quit
}

async function cmd_join(msg, args) {
    if (!msg.guild) return;
    if (msg.member.voice.channel) {
        connection = await client.channels.cache.get(config_channel).join();
        client.channels.cache.get(config_controlchannel).send("Joined the voice channel")
    } else {
        client.channels.cache.get(config_controlchannel).send("You need to be in a voice channel")
    }
}

async function cmd_play(msg, args) {
    await cmd_join(msg, args);
    player = connection.play(ytdl(args, { filter: 'audioonly', quality: 'highestaudio'}))
    player
    client.channels.cache.get(config_controlchannel).send("Started the music")
}

function cmd_stop(msg, args) {
    player.destroy()
    client.channels.cache.get(config_controlchannel).send("Stopped the music")
}

function cmd_quit(msg, args) {
    connection.disconnect()
    client.channels.cache.get(config_controlchannel).send("Quit the voice channel")
}


client.on('message', async (msg) => {
    var cont   = msg.content,
        member = msg.member,
        chan   = msg.channel,
        guild  = msg.guild,
        author = msg.author

        if(msg.channel != client.channels.cache.get(config_controlchannel)) {return}
        if (author.id != client.user.id && cont.startsWith(config_prefix)) {

            
            // 
            var invoke = cont.split(' ')[0].substr(config_prefix.length),
                args   = cont.split(' ').slice(1)
            
            
            if (invoke in cmdmap) {
                cmdmap[invoke](msg, args)
            }
        }

})

client.login(config_token)