const Discord          = require('discord.js')
const { MessageEmbed } = require('discord.js')
const ytdl             = require('ytdl-core')
const ytsr             = require('ytsr')
const fs               = require('fs')
const mssg             = require('./mssg.js')

global.client = new Discord.Client()

var config_token = process.env.TOKEN
global.config_prefix = process.env.PREFIX
global.config_status = process.env.STATUS
global.config_statustype = process.env.STATUSTYPE
global.config_channel = process.env.CHANNEL
global.config_controlchannel = process.env.CONTROLCHANNEL
global.config_musicrole = process.env.MUSICROLE

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
var queue = []

client.on('ready', () => {
    activity()
    setInterval(activity, 60000)
    join()
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
    connection = await client.channels.cache.get(config_channel).join();
    return true
}
async function play(link_local, repeat_local) {
    if(await join() == false) {return false}
    link = link_local
    if(repeat_local == "true") { repeat = true } 
    else if(repeat_local == "false") { repeat = false} 
    else { repeat = false }
    player = await connection.play(ytdl(link, { filter: 'audioonly', quality: 'highestaudio'}))
    player.on('speaking', async function(speaking_local) {
        speaking = speaking_local 
        if(speaking == true) {return false}
        if(queue != []) {
            if(play(queue[0], false) == false) {return false}
            queue.shift()
        }
        if(repeat == true) {
            play(link, true)
            mssg.cmd_replay()
            repeat = true
        }
    })
}
async function stop() {
    if(player == null || speaking == false) {
        mssg.nothing_stop()
        return false 
    }
    player.destroy()
    repeat = false
    return true
}
async function quit() {
    if(connection == null) {
        mssg.nothing_quit()
        return false
    }
    connection.disconnect()
    repeat = false
    return true
}
async function pause() {
    if(player == null || speaking == false) {
        mssg.nothing_pause()
        return false
    }
    player.pause()
    return true
}
async function resume() {
    if(player == null || player.paused != true) {
        mssg.nothing_resume()
        return false
    }
    player.resume()
    return true
}
async function queue_add(args) {
    if(args == []) {

    }
    var filters = await ytsr.getFilters(args.join(" ").toString())
    var filter = await filters.get('Type').get('Video');
    var raw = await ytsr(filter.url, { limit: 1 })
    var url = raw.items[0].url
    queue.push(url)
    mssg.queue_add(url)
}
async function queue_list(args) {
    var list = []
    if(queue == []) {
        mssg.queue_list_empty()
    return false
    }
    queue.forEach(async (link, index) => {
        index = index + 1
        link = index + ". " + link
        list.push(link)
    })
    mssg.queue_list(list)
}
async function queue_remove(args) {
    var index = parseInt(args[0])
    var removed = queue.at(index - 1)
    if(removed == undefined) {
        mssg.queue_remove_not_found()
    return false
    }
    mssg.queue_remove(removed)
    queue.splice(index - 1, 1)
}
async function queue_play(args) {
    if(await play(queue[0], false) == false) {mssg.queue_play_error(); return false}
    queue.shift()
    mssg.queue_play()
}
async function queue_next(args) {
    if(await stop() == false) {return false}
    if(await play(queue[0], false) == false) {return false}
    mssg.queue_next()
    return true
}

var cmdmap = {
    //join : cmd_join,
    play : cmd_play,
    playspotify : cmd_playspotify,
    stop : cmd_stop,
    //quit : cmd_quit,
    pause : cmd_pause,
    resume : cmd_resume,
    replay : cmd_replay,
    controls : cmd_controls,
    queue : cmd_queue
}

async function cmd_play(msg, args) {
    if(await join() == false) {return false}
    if(join() == "channel_empty") {
        mssg.cmd_play_channel_empty()
        return false
    }
    var repeat_local = false
    if(args[0] == "true" || args[0] == "false") { repeat_local = args[0]; args.shift() }
    var filters = await ytsr.getFilters(args.join(" ").toString())
    var filter = await filters.get('Type').get('Video');
    var raw = await ytsr(filter.url, { limit: 1 })
    var url = raw.items[0].url
    await play(url, repeat_local)
    mssg.cmd_play(link)
}

async function cmd_playspotify(msg, args) {
    var song_name = null
    var song_autor = null
    var activ = await msg.author.presence.activities
    var found = activ.find(function(array) {
        if(array.name == "Spotify") { return true}
    })
    if(found == null) {
        mssg.cmd_playspotify_no_spotify()
        return false
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
    mssg.cmd_stop()
}

async function cmd_pause(msg, args) {
    if (await pause() == false) {return}
    mssg.cmd_pause()
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
    if(await play(link, false) == false) {mssg.cmd_replay_error(); return}
    mssg.cmd_replay()
}

async function cmd_controls(msg, args) {
    var r_join = '➕'
    var r_quit = '➖'
    var r_stop = '⏹'
    var r_pause = '⏸'
    var r_resume = '▶'

    var message = await mssg.cmd_controls()
    
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

async function cmd_queue(msg, args) {
    if(args[0] == "add") {
        args.shift()
        if(await queue_add(args) == false) {return false}
    } else if(args[0] == "list") {
        args.shift()
        if(await queue_list(args) == false) {return false}
    } else if(args[0] == "remove") {
        args.shift()
        if(await queue_remove(args) == false) {return false}
    } else if(args[0] == "play") {
        args.shift()
        if(await queue_play(args) == false) {return false}
    } else if(args[0] == "next") {
        args.shift()
        if(await queue_next(args) == false) {return false}
    }
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
                if (cmdmap[invoke](msg, args) == false) {
                    console.log("ERROR")
                }
            }
        }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(await check_channel() == "channel_empty") {quit()}
    if(await check_channel() == true) {await join()}
    if(newState.id == client.user.id && newState.serverDeaf == false) {
        connection.voice.setDeaf(true)
        mssg.undeafen()
    }
}) 

client.login(config_token)
