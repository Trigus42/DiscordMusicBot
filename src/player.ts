import * as discord from "discord.js"
import * as ytdl from "youtube-dl-exec"
import { default as Deezer } from "./extractors/deezer"
import { Regex } from "./const/regex"
import * as Embeds from "./embeds"
import * as voice from "@discordjs/voice"
import { Config } from "./config"
import { isVoiceChannelEmpty } from "./utils"
import internal from "stream"
import EventEmitter from "events"

// export default class Queue {
//     guild: discord.Guild
//     voiceChannel: discord.VoiceBasedChannel
// 	globalConfig: Config
//     textChannel?: discord.TextBasedChannel
//     client: discord.Client
//     songs?: []
//     loop?: "OFF" | "SONG" | "QUEUE"
//     time?: number
// 	connection?: voice.VoiceConnection

//     constructor (client: discord.Client, guild: discord.Guild, voiceChannel: discord.VoiceBasedChannel, config: Config, textChannel?: discord.TextBasedChannel) {
//         this.client = client
//         this.guild = guild
//         this.voiceChannel = voiceChannel
// 		this.textChannel = textChannel
//         this.loop = "OFF"
//         this.time = 0
// 		this.globalConfig = config
// 		// this._emptyTimeout = 0
//     }

// 	async join() {
// 		// Connect to voice channel
// 		this.connection = voice.joinVoiceChannel({
// 			channelId: this.voiceChannel.id,
// 			guildId: this.guild.id,
// 			adapterCreator: this.guild.voiceAdapterCreator
// 		})

// 		// Add this queue to the list of active queues
// 		let activeQueues = this.globalConfig.activeQueues.get(this.guild.id) ?? this.globalConfig.activeQueues.set(this.guild.id, []).get(this.guild.id)
// 		activeQueues.concat(this)
	
// 		this.client.on("voiceStateUpdate", async (oldstate, newstate) => {
// 			if(isVoiceChannelEmpty(oldstate)) {
// 				let _emptyTimeout = set
// 			}
// 		})
// 	}

//     async play(args: string) {

//         // Search for string on YouTube if not a URL
//         if (!(Regex.urlValidate.test(args))) {
//             // const results = await distube.search(args[0], {limit: 25})

// 			// const row = new Discord.ActionRowBuilder()
// 			// 	.addComponents(
// 			// 		new SelectMenuBuilder()
// 			// 			.setCustomId('select')
// 			// 			.setPlaceholder('Nothing selected')
// 			// 			.addOptions(results.map(result => {
// 			// 				return {
// 			// 					label: result.name,
// 			// 					description: result.uploader.name,
// 			// 					value: result.id,
// 			// 				}
// 			// 			})),
// 			// 	) as undefined as Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent> // Types seem broken so we need to assert the type
			
// 			// const embed = new Discord.EmbedBuilder()
// 			// 	.setColor("#fffff0")
// 			// 	.setTitle("Search Song")
// 			// 	.setDescription(`Select a song to play`)

// 			// const embedMessage = await message.reply({
// 			// 	embeds: [embed],
// 			// 	components: [row]
// 			// })

// 			// client.on(Discord.Events.InteractionCreate, async interaction => {
// 			// 	if (!interaction.isSelectMenu() || interaction.message.id != embedMessage.id) return
// 			// 	interaction.deferUpdate()
// 			// 	const song = results.find(result => result.id === interaction.values[0])

//         } // Deezer URL
//         else if (args[0].includes("deezer.com")) {
//             // const type = args[0].split("/").slice(-2,-1)[0]
// 			// if (["track", "album", "playlist", "artist"].includes(type)) {
// 			// 	const tracks = await Deezer.prototype.tracks(args[0]).catch((error) => {
// 			// 		Embeds.embedBuilderMessage({
// 			// 			client,
// 			// 			message,
// 			// 			color: "Red",
// 			// 			title: "Cannot find playlist. Maybe it's private?",
// 			// 			deleteAfter: 10000
// 			// 		})
// 			// 		message.react("❌")
// 			// 	})
// 			// 	if (!tracks) return
// 			// 	const search_strings = await Promise.all(tracks.map(async track => track.title + " - " + track.artist))
// 			// 	const urls = await Promise.all(search_strings.map(async search_string => (await distube.search(search_string, {limit: 1}))[0].url))
// 			// 	const extractor = distube.extractorPlugins.find(plugin => plugin.validate(urls[0]))
// 			// 	const songs = await Promise.all(urls.map(async url => extractor.resolve(url, {}))) as DisTube.Song[]
// 			// 	customPlaylist = await distube.createCustomPlaylist(songs, {member: message.member ?? undefined, properties: {message: message}})
// 			// } else {
// 			// 	Embeds.embedBuilderMessage({
// 			// 		client,
// 			// 		message,
// 			// 		color: "Red",
// 			// 		title: "Can only play tracks, albums, playlists and artists from Deezer",
// 			// 		deleteAfter: 10000
// 			// 	})
// 			// 	return
// 			// }
            
//         } // Spotify URL
//         else if (args[0].includes("spotify.com")) {

//         } // YTDLP for all other URLs
//         else {
//             // let res = await ytdl.exec(args, {
//             //     dumpSingleJson: true,
//             //     noCheckCertificates: true,
//             //     noWarnings: true,
//             //     addHeader: [
//             //         'referer:youtube.com',
//             //         'user-agent:googlebot'
//             //     ]
//             // })

//             // let json = JSON.parse(res.stdout)

//             // let audio_only_formats = json.formats.filter((format: any) => format.vcodec === 'none' && format.acodec !== 'none')
//             // let best_audio_format = audio_only_formats[audio_only_formats.length-1]
//         }
//     }

// }


export class Player extends EventEmitter {
    voiceChannel: discord.VoiceBasedChannel
    textChannel: discord.TextBasedChannel
    player: voice.AudioPlayer
    voiceConnection: voice.VoiceConnection
    queue: string[]

    constructor(voiceChannel: discord.VoiceBasedChannel) {
        super()
        this.voiceChannel = voiceChannel
        this.queue = []

        this.player = voice.createAudioPlayer({
            behaviors: {
                noSubscriber: voice.NoSubscriberBehavior.Pause,
            },
        })

        this.voiceConnection = voice.joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        })

        this.voiceConnection.subscribe(this.player)
    }

    public async play(message: discord.Message, args: string) {
        if (this.voiceConnection.state.status !== voice.VoiceConnectionStatus.Ready) {
            if (!this.voiceConnection.rejoin()) {
                throw Error("No connection to voice channel")
            }
        }

        // Add the youtube video to the queue
        this.queue.push(args)

        // If this is the only song in the queue, start playing it
        if (this.queue.length === 1) {
            this.playNextSongInQueue();
        }
    }

    private async playNextSongInQueue() {
        if (this.queue.length === 0) {
            // No more songs in the queue, do nothing
            return
        }

        // Get the next song in the queue
        const nextSong = this.queue[0]

        // Try to download the best quality audio (preferably opus) available
        const extractor = ytdl.exec(nextSong, {
            audioFormat: "opus",
            audioQuality: 0,
            format: "bestaudio/best",
            output: "-"
        })

        const audioResource = await this._probeAndCreateResource(extractor.stdout)

        // Play the audio stream using discord.js
        this.player.play(audioResource)


        // When the song is finished, remove it from the queue and play the next one (if any)
        this.player.on("stateChange", (oldState, newState) => {
            if (newState.status === voice.AudioPlayerStatus.Idle) {
                this.queue.shift();
                this.playNextSongInQueue();
            }
        })
    }

    private async _probeAndCreateResource(readableStream: internal.Readable) {
        const { stream, type } = await voice.demuxProbe(readableStream);
        return voice.createAudioResource(stream, { inputType: type });
    }
}