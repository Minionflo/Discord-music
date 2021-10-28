const Discord          = require('discord.js')
const { MessageEmbed } = require('discord.js')
const ytdl             = require('ytdl-core')
const ytsr             = require('ytsr')
const fs               = require('fs')

var client = new Discord.Client()

var config_token = process.env.TOKEN
var config_prefix = process.env.PREFIX
var config_status = process.env.STATUS
var config_statustype = process.env.STATUSTYPE
var config_channel = process.env.CHANNEL
var config_controlchannel = process.env.CONTROLCHANNEL
var config_musicrole = process.env.MUSICROLE

if(process.argv.slice(2) == "test") {
    var secret = fs.readFileSync('secret', 'utf8').split(/\r?\n/)
    secret.forEach(function(line) {
        line = line.split("=")
        var name = line[0]
        var value = line[1]
        str = name+' = '+value;
        eval(str)
    })
}

var connection = null
var player = null
var repeat = false
var link = null
var speaking = null

client.on('ready', () => {
    activity()
    setInterval(activity, 60000)
    console.log(`Online`)
})

function activity() {
    client.user.setActivity(config_status, {type: config_statustype})
}


async function check_channel() {
    var voicecha = await client.channels.cache.get(config_channel).members
    if(voicecha.has(await client.user.id)) {voicecha.delete(await client.user.id)}
    if(voicecha.size == 0) {
        return "channel_empty"
    }
    return true
}
async function join() {
    if(await check_channel() == false) {return false}
    if(await check_channel() == "channel_empty") {return "channel_empty"}
    connection = await client.channels.cache.get(config_channel).join();
    return true
}
async function play(link_local, repeat_local) {
    link = link_local
    if(repeat_local == "true") { repeat = true } 
    else if(repeat_local == "false") { repeat = false} 
    else { repeat = false }
    player = await connection.play(ytdl(link, { filter: 'audioonly', quality: 'highestaudio'}))
    player.on('speaking', function(speaking_local) {
        speaking = speaking_local
        if(repeat == false) {return} 
        if(speaking == true) {return} 
        if(repeat == true) {
            play(link, true)
            var emb = new MessageEmbed()
                .setTitle('Music')
                .setColor('FFFFFF')
                .setDescription("Music replay started")
                .setFooter(client.user.tag, client.user.avatarURL())
                .setTimestamp()
            client.channels.cache.get(config_controlchannel).send(emb)
            repeat = true
        }
    })
}
async function stop() {
    if(player == null || speaking == false) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can stop")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false 
    }
    player.destroy()
    repeat = false
    return true
}
async function quit() {
    if(connection == null) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can quit")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false
    }
    connection.disconnect()
    repeat = false
    return true
}
async function pause() {
    if(player == null || speaking == false) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can pause")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false
    }
    player.pause()
    return true
}
async function resume() {
    if(player == null || player.paused != true) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can resume")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false
    }
    player.resume()
    return true
}

var cmdmap = {
    join : cmd_join,
    play : cmd_play,
    playspotify : cmd_playspotify,
    stop : cmd_stop,
    quit : cmd_quit,
    pause : cmd_pause,
    resume : cmd_resume,
    replay : cmd_replay,
    controls : cmd_controls
}

async function cmd_join(msg, args) {
    if(await join() == false) {return false}
    if(await join() == "channel_empty") {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Someone needs to be in the voicechannel")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false
    }
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Joined the voice channel")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_play(msg, args) {
    if(await cmd_join() == false) {return false}
    if(join() == "channel_empty") {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Someone needs to be in the voicechannel")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
        return false
    }
    var repeat_local = false
    if(args[0] == "true" || args[0] == "false") { repeat_local = args[0]; args.shift() }
    var filters = await ytsr.getFilters(args.join(" ").toString())
    var filter = await filters.get('Type').get('Video');
    var raw = await ytsr(filter.url, { limit: 1 })
    var url = raw.items[0].url
    await play(url, repeat_local)
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music started \n Link: " + link)
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_playspotify(msg, args) {
    var song_name = null
    var song_autor = null
    var activ = await msg.author.presence.activities
    var found = activ.find(function(array) {
        if(array.name == "Spotify") { return true}
    })
    if(found == null) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("You need to play something on Spotify")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    } else {
        song_name = found.details.toString()
        song_autor = found.state.toString().replace(/;/g, ",")
        var song = []
        song.push("false")
        song.push(song_name + " - " + song_autor)
        cmd_play(msg, song)
    }
}

async function cmd_stop(msg, args) {
    if (await stop() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music stopped")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_quit(msg, args) {
    if (await quit() == false) {return false}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Quit the voice channel")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_pause(msg, args) {
    if (await pause() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music paused")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_resume(msg, args) {
    if (await resume() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music resumed")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_replay(msg, args) {
    if(await play(link, false) == false) {return false}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music replay started")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
}

async function cmd_controls(msg, args) {
    var r_join = '➕'
    var r_quit = '➖'
    var r_stop = '⏹'
    var r_pause = '⏸'
    var r_resume = '▶'

    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Controls")
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    var message = await client.channels.cache.get(config_controlchannel).send(emb)
    
    async function filter(r, u) {
        var user = await message.guild.members.fetch(u.id)
        var result = await user.roles.cache.has(config_musicrole)
        return result
    }
    message.react(r_pause)
    message.react(r_resume)
    message.react(r_stop)
    message.react(r_join)
    message.react(r_quit)
    const collector = message.createReactionCollector(filter);
    collector.on('collect', async (r, u) => {
        if(r.emoji.name == r_pause) { r.users.remove(u); if(await pause() == false) { return false} }
        else if(r.emoji.name == r_resume) { r.users.remove(u); if(await resume() == false) { return false} }
        else if(r.emoji.name == r_stop) { r.users.remove(u); if(await stop() == false) { return false} }
        else if(r.emoji.name == r_join) { r.users.remove(u); if(await join() == false) { return false} }
        else if(r.emoji.name == r_quit) { r.users.remove(u); if(await quit() == false) { return false} }
    })
}

client.on('message', async (msg) => {
    var cont   = msg.content,
        member = msg.member,
        chan   = msg.channel,
        guild  = msg.guild,
        author = msg.author

        if(msg.member.roles.cache.has(config_musicrole) == false) {return false}
        if(msg.channel != client.channels.cache.get(config_controlchannel)) {return false}
        if (author.id != client.user.id && cont.startsWith(config_prefix)) {
            var invoke = cont.split(' ')[0].substr(config_prefix.length),
                args   = cont.split(' ').slice(1)
            if (invoke in cmdmap) {
                cmdmap[invoke](msg, args)
            }
        }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(await check_channel() == "channel_empty") {quit()}
}) 

client.login(config_token)
