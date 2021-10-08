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

async function join() {
    connection = await client.channels.cache.get(config_channel).join();
}
async function play(link_local, repeat_local) {
    await join()
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
                .setFooter(msg.author.tag, msg.author.avatarURL())
                .setTimestamp()
            client.channels.cache.get(config_channel).send(emb)
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
            .setFooter(msg.author.tag, msg.author.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_channel).send(emb)
        return false 
    }
    player.destroy()
    repeat = false
    return true
}
async function quit() {
    if(connection == null || connection.status != "0") {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can quit")
            .setFooter(msg.author.tag, msg.author.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_channel).send(emb)
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
            .setFooter(msg.author.tag, msg.author.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_channel).send(emb)
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
            .setFooter(msg.author.tag, msg.author.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_channel).send(emb)
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
    join()
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Joined the voice channel")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
}

async function cmd_play(msg, args) {
    var repeat_local = false
    if(args[0] == "true" || args[0] == "false") { repeat_local = args[0]; args.shift() }
    var filters = await ytsr.getFilters(args.join(" ").toString())
    var filter = await filters.get('Type').get('Video');
    var raw = await ytsr(filter.url, { limit: 1 })
    var url = raw.items[0].url
    await play(url, repeat_local)
    client.channels.cache.get(config_controlchannel).send("Music started")
    client.channels.cache.get(config_controlchannel).send("Link: " + link)
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
            .setFooter(msg.author.tag, msg.author.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_channel).send(emb)
    } else {
        song_name = found.details
        song_autor = found.state.replaceAll(";", ",")
        var song = []
        song.push("false")
        song.push(song_name + " - " + song_autor)
        cmd_play(null, song)
    }
}

function cmd_stop(msg, args) {
    if (stop() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music stopped")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
}

function cmd_quit(msg, args) {
    if (quit() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Quit the voice channel")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
}

function cmd_pause(msg, args) {
    if (pause() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music paused")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
}

function cmd_resume(msg, args) {
    if (resume() == false) {return}
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music resumed")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
}

function cmd_replay(msg, args) {
    play(link, false)
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Music replay started")
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_channel).send(emb)
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
        .setFooter(msg.author.tag, msg.author.avatarURL())
        .setTimestamp()
    var message = await client.channels.cache.get(config_channel).send(emb)
    
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
    collector.on('collect', (r, u) => {
        if(r.emoji.name == r_pause) { r.users.remove(u); if(pause() == false) { return } }
        else if(r.emoji.name == r_resume) { r.users.remove(u); if(resume() == false) { return } }
        else if(r.emoji.name == r_stop) { r.users.remove(u); if(stop() == false) { return } }
        else if(r.emoji.name == r_join) { r.users.remove(u); if(join() == false) { return } }
        else if(r.emoji.name == r_quit) { r.users.remove(u); if(quit() == false) { return } }
    })
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