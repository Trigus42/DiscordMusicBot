import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class PlayCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'play',
            description: 'Play a song or a playlist',
            chatInputCommand: {register: true}
        })
    }


    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
        let clientArray = clients.find(i =>
            i.distube.getQueue(message.guildId) ? // Check if client has a queue
            i.distube.getQueue(message.guildId).voiceChannel.id === message.member.voice.channel.id : false // Check if client queue is in the same voice channel as the message author
        ) ?? clients.find(i => // If no client has been found, use a new client
            !i.distube.getQueue(message.guildId) // Check if client has no queue
            && i.discord.guilds.fetch().then(guilds => guilds.has(message.guildId)) // Check if client is in the same guild as the message author
        )

        if (!clientArray) {
            Embeds.embedBuilderMessage(mainClient, message, "RED", "❌ There are no available clients", "Please try again later or free up one of the clients")
            return
        }

        let client = clientArray.discord
        let distube = clientArray.distube


        // Check if user in voice channel or bot in voice channel
        if (!message.member.voice.channel) {
            Embeds.embedBuilderMessage(client, message, "RED", "You are not in a voice channel")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            return
        }

        let customPlaylist: DisTube.Playlist
        if (args[0].includes("deezer.com")) {
            let type = args[0].split("/").slice(-2,-1)[0]
            if (["track", "album", "playlist", "artist"].includes(type)) {
                let tracks = await deezer.tracks(args[0])
                let search_strings = await Promise.all(tracks.map(async track => track[0] + " - " + track[1]))
                let urls = await Promise.all(search_strings.map(async search_string => (await distube.search(search_string, {limit: 1}))[0].url))
                customPlaylist = await distube.createCustomPlaylist(urls, {member: message.member, properties: {message: message}})
            } else {
                Embeds.embedBuilderMessage(client, message, "RED", "Can only play tracks, albums, playlists and artists from Deezer")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                return
            }
        }

        // Replace default client with the correct client
        let channel = await client.channels.fetch(message.member.voice.channel.id) as Discord.VoiceChannel

        await distube.play(channel, customPlaylist ?? args.join(" "), {
            position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
            textChannel: message.channel as Discord.GuildTextBasedChannel, 
            message: message, 
            member: message.member
        })
        message.react("✅")
    }
}