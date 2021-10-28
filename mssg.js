const Discord          = require('discord.js')
const { MessageEmbed } = require('discord.js')

module.exports = {
    nothing_stop() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can stop")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    nothing_quit() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can quit")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    nothing_pause() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can pause")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    nothing_resume() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The bot needs to have something it can resume")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_play_channel_empty() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Someone needs to be in the voicechannel")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_add(url) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("added " + url + " to the queue")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_list_empty() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("The queue is empty")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_list(list) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription(list)
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_remove_not_found() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Not found")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_remove(removed) {
    var emb = new MessageEmbed()
        .setTitle('Music')
        .setColor('FFFFFF')
        .setDescription("Removed " + removed)
        .setFooter(client.user.tag, client.user.avatarURL())
        .setTimestamp()
    client.channels.cache.get(config_controlchannel).send(emb)
    },
    queue_play() {

    },
    queue_play_error() {

    },
    queue_next() {

    },
    cmd_play(link) {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Music started \n Link: " + link)
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_playspotify_no_spotify() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("You need to play something on Spotify")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_stop() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Music stopped")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_pause() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Music paused")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_replay() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Music replay started")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    },
    cmd_replay_error() {

    },
    cmd_controls() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("Controls")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        return client.channels.cache.get(config_controlchannel).send(emb)
    },
    undeafen() {
        var emb = new MessageEmbed()
            .setTitle('Music')
            .setColor('FFFFFF')
            .setDescription("It is not possible to undeafen the music bot")
            .setFooter(client.user.tag, client.user.avatarURL())
            .setTimestamp()
        client.channels.cache.get(config_controlchannel).send(emb)
    }
}