import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { default as Deezer } from "../apis/deezer"

export class NewCommand extends Command {
    public name: string = "play"
    public description: string = "Play a song or playlist"
    public aliases: string[] = ["p"]
    public args: boolean = true
    public usage: string = "play [url]"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
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
                let tracks = await Deezer.prototype.tracks(args[0])
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

        message.react("✅")

        await distube.play(channel, customPlaylist ?? args.join(" "), {
            position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
            textChannel: message.channel as Discord.GuildTextBasedChannel, 
            message: message, 
            member: message.member
        })
    }
}

export default new NewCommand()