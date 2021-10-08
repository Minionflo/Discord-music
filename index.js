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
            cmd_replay()
            repeat = true
        }
    })
}
async function stop() {
    if(speaking == false) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can stop"); return false }
    player.destroy()
    repeat = false
}
async function quit() {
    if(connection == null || connection.status != "0") {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can quit"); return false }
    connection.disconnect()
    repeat = false
}
async function pause() {
    if(speaking == false) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can pause"); return false }
    player.pause()
}
async function resume() {
    if(player == null || player.paused != true) {client.channels.cache.get(config_controlchannel).send("The bot needs to have something it can resume"); return false }
    player.resume()
}

var cmdmap = {
    join : cmd_join,
    playlink : cmd_playlink,
    play : cmd_play,
    stop : cmd_stop,
    quit : cmd_quit,
    pause : cmd_pause,
    resume : cmd_resume,
    replay : cmd_replay,
    controls : cmd_controls
}

async function cmd_join(msg, args) {
    join()
    client.channels.cache.get(config_controlchannel).send("Joined the voice channel")
}

function cmd_playlink(msg, args) {
    var repeat_local = false
    if(args[0] == "true" || args[0] == "false") { repeat_local = args[0]; args.shift() }
    play(args[0], repeat_local)
    client.channels.cache.get(config_controlchannel).send("Music started")
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

function cmd_stop(msg, args) {
    if (stop() == false) {return}
    client.channels.cache.get(config_controlchannel).send("Music stopped")
}

function cmd_quit(msg, args) {
    if (quit() == false) {return}
    client.channels.cache.get(config_controlchannel).send("Quit the voice channel")
}

function cmd_pause(msg, args) {
    if (pause() == false) {return}
    client.channels.cache.get(config_controlchannel).send("Music paused")
}

function cmd_resume(msg, args) {
    if (resume() == false) {return}
    client.channels.cache.get(config_controlchannel).send("Music resumed")
}

function cmd_replay(msg, args) {
    play(link, false)
}

async function cmd_controls(msg, args) {
    var r_join = '➕'
    var r_quit = '➖'
    var r_stop = '⏹'
    var r_pause = '⏸'
    var r_resume = '▶'
    var message = await client.channels.cache.get(config_controlchannel).send("Controls")
    //const filter = (r, u) => msg.guild.members.fetch(u.id).roles.cache.has(config_musicrole)
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
        if(r.emoji.name == r_pause) { r.users.remove(u); pause() }
        else if(r.emoji.name == r_resume) { r.users.remove(u); resume() }
        else if(r.emoji.name == r_stop) { r.users.remove(u); stop() }
        else if(r.emoji.name == r_join) { r.users.remove(u); join() }
        else if(r.emoji.name == r_quit) { r.users.remove(u); quit() }
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