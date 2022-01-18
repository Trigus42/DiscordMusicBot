"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = __importStar(require("discord.js"));
const DisTube = __importStar(require("distube"));
const level = __importStar(require("level"));
const process_1 = __importDefault(require("process"));
const play_dl_1 = __importDefault(require("play-dl"));
const Constants = __importStar(require("./constants"));
const Buttons = Constants.Buttons;
/////////////////
/// Initialize //
/////////////////
// Read config files into dict
const user_config = require("../config/user_config.json");
const filters = require("../config/filters.json");
// Connect to database
const db = level.default('./config/db');
// Make sure db is always closed
process_1.default.on('exit', (code) => {
    db.close();
});
process_1.default.on('uncaughtException', (code) => {
    db.close();
});
process_1.default.on('unhandledRejection', (code) => {
    db.close();
});
// Create a new discord client
// TODO: Remove unused intents and partials
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
    messageCacheLifetime: 0,
    messageSweepInterval: 0,
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES']
});
// Create a new distube instance
const distube = new DisTube.DisTube(client, {
    youtubeCookie: user_config.youtubeCookie,
    searchSongs: 5,
    emitNewSongOnly: true,
    leaveOnStop: false,
    customFilters: filters
});
// Login to discord
client.login(user_config.token);
/////////////////
///// Events ////
/////////////////
// Log when ready and set presence
client.on("ready", () => {
    console.log(` :: Bot has started as :: ${client.user.tag}`);
    client.user.setPresence({
        status: "online",
        activities: [
            {
                name: "Music",
                type: "PLAYING",
            }
        ]
    });
});
// Log when reconnect
client.on('reconnecting', () => {
    console.log(' :: Reconnecting!');
    client.user.setPresence({ status: "invisible" }); // Change discord presence to offline
});
// Log when disconnecting
client.on('disconnect', () => {
    console.log(' :: Disconnect!');
    client.user.setPresence({ status: "invisible" }); // Change discord presence to offline
});
client.on("messageCreate", async (message) => {
    try {
        // Ignore non commands, messages from bots and DMs
        if (message.author.bot || !message.guild)
            return;
        // Get prefix for guild
        let prefix;
        try {
            prefix = await db.get(`prefix_${message.guild.id}`); // Get prefix from database
        }
        catch (error) {
            prefix = user_config.prefix; // If prefix is not set, use standard prefix from the user_config.json file
        }
        // Ignore messages that don't start with the prefix
        if (!message.content.startsWith(prefix))
            return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g); // Remove prefix and split message into arguments
        const command = args.shift(); // Get command name (first argument)
        // React if message starts with prefix 
        if (message.content.startsWith(prefix)) {
            message.react("🆗");
        }
        // React if message mentions bot
        else if (message.mentions.has(client.user)) {
            message.reply({ embeds: [new Discord.MessageEmbed().setColor("#fffff0").setAuthor(`${message.author.username}, My Prefix is ${prefix}, to get started; type ${prefix}help`, message.author.displayAvatarURL({ dynamic: true }))] });
            return;
        }
        // Return if message doesn't start with prefix
        else {
            return;
        }
        ///////////////////
        /////COMMANDS//////
        ///////////////////
        if (command === "invite" || command === "add") {
            embedbuilder_message(client, message, "#fffff0", "Invite me", `[\`Click here\`](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=49572160&scope=bot)`);
            return;
        }
        else if (command === "help" || command === "about" || command === "h" || command === "info") {
            let helpembed = new Discord.MessageEmbed()
                .setColor("#fffff0")
                .setTitle("***COMMANDS***\n")
                .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
                .setFooter(client.user.username + " | Syntax:  <>...must    []...optional", client.user.displayAvatarURL())
                .addField(`\`${prefix}prefix <NEW PREFIX>\``, `**Change Prefix**`, true)
                .addField(`\`${prefix}help\`  \`${prefix}h\``, `**List of all Commands**`, true)
                .addField(`\`${prefix}play <URL/NAME>\` \`${prefix}p\``, `**Plays a song**`, true)
                .addField(`\`${prefix}status\``, `**Update playing message**`, true)
                .addField(`\`${prefix}pause\``, `**Pauses the song**`, true)
                .addField(`\`${prefix}resume\`  \`${prefix}r\``, `**Resume the song**`, true)
                .addField(`\`${prefix}shuffle\`  \`${prefix}mix\``, `**Shuffles the queue**`, true)
                .addField(`\`${prefix}autoplay\`  \`${prefix}ap\``, `**Enables autoplay - random similar songs**`, true)
                .addField(`\`${prefix}skip\`  \`${prefix}s\``, `**Skips current song**`, true)
                .addField(`\`${prefix}stop\`  \`${prefix}leave\``, `**Stops playing and leaves the channel**`, true)
                .addField(`\`${prefix}seek <HH:MM:SS>\``, `**Moves in the song to HH:MM:SS**`, true)
                .addField(`\`${prefix}volume <VOLUME>\`  \`${prefix}vol\``, `**Changes volume**`, true)
                .addField(`\`${prefix}queue\`  \`${prefix}qu\``, `**Shows current Queue**`, true)
                .addField(`\`${prefix}loop <0/1/2>\`  \`${prefix}mix\``, `**Loop (off / song / queue)**`, true)
                .addField(`\`${prefix}jump <Queue index>\``, `**Jumps to a queue song**`, true)
                .addField(`\`${prefix}ping\``, `**Gives you the ping**`, true)
                .addField(`\`${prefix}uptime\``, `**Shows you the Bot's Uptime**`, true)
                .addField(`​`, `​`, true)
                .addField("***FILTERS:***", Object.keys(filters).map(filter => `\`${prefix}${filter}\``).join(" "));
            message.channel.send({ embeds: [helpembed] });
            return;
        }
        else if (command === "prefix") {
            // If no arguments are given, return current prefix
            if (!args[0]) {
                embedbuilder_message(client, message, "RED", `Current Prefix: \`${prefix}\``, `Please provide a new prefix`);
                return;
            }
            // If user is not owner, return error
            if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                embedbuilder_message(client, message, "RED", "PREFIX", `❌ You don\'t have permission for this Command!`);
                return;
            }
            // If prefix includes spaces, return error
            if (args[1]) {
                embedbuilder_message(client, message, "RED", "PREFIX", `'❌ The prefix can\'t have whitespaces'`);
                return;
            }
            // Set new prefix in database
            db.put(`prefix_${message.guild.id}`, args[0]);
            embedbuilder_message(client, message, "#fffff0", "PREFIX", `:ballot_box_with_check: Successfully set new prefix to **\`${args[0]}\`**`);
            return;
        }
        else if (command === "search") {
            embedbuilder_message(client, message, "#fffff0", "Searching", args.join(" ")).then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
            let result = await distube.search(args.join(" "));
            let searchresult = "";
            for (let i = 0; i <= result.length; i++) {
                try {
                    searchresult += await `**${i + 1}**. ${result[i].name} - \`${result[i].formattedDuration}\`\n`;
                }
                catch (error) {
                    searchresult += await " ";
                }
            }
            let searchembed = await embedbuilder_message(client, message, "#fffff0", "Current Queue", searchresult);
            let filter = (m) => !isNaN(Number(m.content)) && m.author.id === message.author.id;
            let userinput;
            await searchembed.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] }).then(collected => {
                let userinput = collected.first().content;
                if (Number(userinput) < 0 && Number(userinput) >= 15) {
                    embedbuilder_message(client, message, "RED", "Not a right number", "so i use number 1");
                    let userchoice = 1;
                }
                setTimeout(() => searchembed.delete().catch(console.error), Number(client.ws.ping));
            })
                .catch(() => { console.log(console.error); userinput = 404; });
            if (userinput === 404) {
                embedbuilder_message(client, message, "RED", "Something went wrong");
                return;
            }
            embedbuilder_message(client, message, "#fffff0", "Searching", `[${result[userinput - 1].name}](${result[userinput - 1].url})`, result[userinput - 1].thumbnail);
            distube.play(message, result[userinput - 1].url);
            return;
        }
        else if (command == "status") {
            var queue = distube.getQueue(message.guild.id);
            await playsong(queue, queue.songs[0]);
            message.react("✅");
            return;
        }
        else if (command == "pause") {
            await distube.pause(message);
            message.react("✅");
            return;
        }
        else if (command == "resume" || command == "r") {
            await distube.resume(message);
            message.react("✅");
            return;
        }
        else if (command == "shuffle" || command == "mix") {
            await distube.shuffle(message);
            message.react("✅");
            return;
        }
        else if (command == "autoplay" || command == "ap") {
            await embedbuilder_message(client, message, "#fffff0", `Autoplay is now ${distube.toggleAutoplay(message) ? "ON" : "OFF"}!`)
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
            message.react("✅");
            return;
        }
        else if (command === "ping") {
            embedbuilder_message(client, message, `#fffff0`, `PING:`, `\`${client.ws.ping} ms\``);
            return;
        }
        else if (command === "uptime") {
            let days = Math.floor(client.uptime / 86400000);
            let hours = Math.floor(client.uptime / 3600000) % 24;
            let minutes = Math.floor(client.uptime / 60000) % 60;
            let seconds = Math.floor(client.uptime / 1000) % 60;
            embedbuilder_message(client, message, `#fffff0`, `UPTIME:`, `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``);
            return;
        }
        else if (command === "play" || command === "p") {
            // Check if user in voice channel or bot in voice channel
            if (!message.member.voice.channel) {
                embedbuilder_message(client, message, "RED", "You are not in a voice channel")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                return;
            }
            var url_type = await play_dl_1.default.validate(args[0]);
            if (url_type === 'sp_track' || url_type === 'sp_album' || url_type === 'sp_playlist') {
                // Spotify authorization
                try {
                    await play_dl_1.default.setToken({ spotify: user_config.spotify });
                    if (play_dl_1.default.is_expired())
                        await play_dl_1.default.refreshToken(); // Refresh spotify access token if it has expired
                }
                catch (error) {
                    embedbuilder_message(client, message, "RED", "SPOTIFY", `❌ Something went wrong while trying to authorize Spotify!`);
                    return;
                }
                let sp_data = await play_dl_1.default.spotify(args[0]); // Get spotify data from url
                // Search for song on YouTube
                if (sp_data.type === 'track') {
                    var search_string = sp_data.name + " - " + sp_data.artists.map((artist) => artist.name).join(" ");
                    var yt_vid = (await distube.search(search_string, { limit: 1 }))[0].url;
                    await distube.play(message, yt_vid);
                }
                else if (sp_data.type === 'playlist' || sp_data.type === 'album') {
                    var tracks = sp_data.fetched_tracks.get('1');
                    var search_strings = await Promise.all(tracks.map(async (track) => track.name + " - " + track.artists.map(artist => artist.name).join(" ")));
                    var urls = await Promise.all(search_strings.map(async (search_string) => (await distube.search(search_string, { limit: 1 }))[0].url));
                    distube.playCustomPlaylist(message, urls);
                }
            }
            else {
                await distube.play(message, args.join(" "));
            }
            message.react("✅");
            return;
        }
        else if (command === "skip" || command === "s") {
            if (!distube.getQueue(message).autoplay && distube.getQueue(message).songs.length <= 1) {
                distube.getQueue(message).stop();
            }
            else {
                await distube.skip(message);
            }
            message.react("✅");
            return;
        }
        else if (command === "stop" || command === "leave") {
            await distube.stop(message);
            message.react("✅");
            return;
        }
        else if (command === "seek") {
            // Get time in seconds from HH:MM:SS time_string
            var time_array = args[0].split(":");
            var time_seconds = 0;
            for (var i = 0; i < time_array.length; i++) {
                time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i);
            }
            await distube.seek(message, time_seconds);
            message.react("✅");
            return;
        }
        else if (Object.keys(filters).includes(command)) {
            await distube.setFilter(message, command);
            message.react("✅");
            return;
        }
        else if (command === "volume" || command === "vol") {
            await distube.setVolume(message, Number(args[0]));
            message.react("✅");
            return;
        }
        else if (command === "queue" || command === "qu") {
            var queue = distube.getQueue(message);
            if (!queue) {
                embedbuilder_message(client, message, "RED", "There is nothing playing")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                return;
            }
            const { author, channel } = message;
            const embeds = QueueEmbed(queue);
            const guilds = [...client.guilds.cache.values()];
            const embedMessage = await queue.textChannel.send({
                embeds: [embeds[0]],
                components: embeds.length < 1 ? [] : [new Discord.MessageActionRow({ components: [
                            Buttons.next_Button
                        ] })]
            });
            // Exit if there is only one page of guilds (no need for all of this)
            if (embeds.length < 1)
                return;
            // Collect button interactions
            const collector = embedMessage.createMessageComponentCollector();
            let currentIndex = 0;
            collector.on('collect', async (interaction) => {
                // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
                interaction.deferUpdate();
                // Increase/decrease index
                interaction.customId === Buttons.back_Button.customId ? (currentIndex -= 1) : (currentIndex += 1);
                // Respond to interaction by updating message with new embed
                embedMessage.edit({
                    embeds: [embeds[currentIndex]],
                    components: [
                        new Discord.MessageActionRow({
                            components: [
                                // back button if it isn't the start
                                ...(currentIndex ? [Buttons.back_Button] : []),
                                // forward button if it isn't the end
                                ...(currentIndex + 1 < embeds.length ? [Buttons.next_Button] : [])
                            ]
                        })
                    ]
                });
            });
        }
        else if (command === "loop" || command === "repeat") {
            if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
                await distube.setRepeatMode(message, parseInt(args[0]));
                await embedbuilder_message(client, message, "#fffff0", "Repeat mode set to:", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                message.react("✅");
                return;
            }
            else {
                embedbuilder_message(client, message, "RED", "ERROR", `Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                return;
            }
        }
        else if (command === "jump") {
            let queue = distube.getQueue(message);
            if (!queue) {
                embedbuilder_message(client, message, "RED", "There is nothing playing")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                return;
            }
            if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
                try {
                    (await message.channel.messages.fetch(await db.get(`playingembed_${message.guild.id}`))).delete().catch(console.error);
                }
                catch (error) {
                    console.error(error);
                }
                await distube.jump(message, parseInt(args[0]))
                    .catch(err => message.channel.send("Invalid song number.")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000)));
                message.react("✅");
                return;
            }
            else {
                embedbuilder_message(client, message, "RED", "ERROR", `Please use a number between **0** and **${distube.getQueue(message).songs.length}**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                return;
            }
        }
        else if (message.content.startsWith(prefix)) {
            embedbuilder_message(client, message, "RED", "Unknown Command", `Type ${prefix}help to see all available commands!`)
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
            return;
        }
    }
    catch (error) {
        console.error(error);
    }
});
///////////////
////DISTUBE////
///////////////
distube
    .on('playSong', (queue, song) => {
    try {
        playsong(queue, song);
    }
    catch (error) {
        console.error(error);
    }
})
    .on("addSong", (queue, song) => {
    try {
        embedbuilder(client, song.user, queue.textChannel, "#fffff0", "Added a Song", `Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\` \n\nRequested by: ${song.user}`, song.thumbnail);
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("addList", (queue, playlist) => {
    try {
        embedbuilder(client, playlist.user, queue.textChannel, "#fffff0", "Added a Playlist", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${playlist.user}`, playlist.thumbnail);
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("searchResult", (message, results) => {
    try {
        let i = 0;
        embedbuilder_message(client, message, "#fffff0", "", `**Choose an option from below**\n${results.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("searchCancel", (message) => {
    try {
        message.reactions.removeAll();
        message.react("❌");
    }
    catch (error) {
        console.error(error);
    }
    try {
        embedbuilder_message(client, message, "RED", `Searching canceled`, "");
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("error", (channel, error) => {
    try {
        channel.lastMessage.reactions.removeAll();
        channel.lastMessage.react("❌");
    }
    catch (error) {
        console.error(error);
    }
    console.log(error);
    try {
        embedbuilder(client, channel.lastMessage.member.user, channel, "RED", "An error encountered:", "```" + error + "```");
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("finish", async (queue) => {
    try {
        // Delete old playing message
        try {
            (await queue.textChannel.messages.fetch(await db.get(`playingembed_${queue.textChannel.guildId}`)));
        }
        catch (error) { }
        embedbuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "There are no more songs left").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("empty", queue => {
    try {
        embedbuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "Left the channel cause it got empty").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("noRelated", queue => {
    try {
        embedbuilder(client, queue.textChannel.lastMessage.member.user, queue.textChannel, "RED", "Can't find related video to play. Stop playing music.").then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
        return;
    }
    catch (error) {
        console.error(error);
    }
})
    .on("initQueue", queue => {
    try {
        queue.autoplay = false;
        queue.volume = 100;
    }
    catch (error) {
        console.log(error);
    }
})
    .on("searchDone", () => { })
    .on("searchNoResult", () => { })
    .on("searchInvalidAnswer", () => { });
///////////////
///FUNCTIONS///
///////////////
/**
 *  Build and send embed in the channel of the message
 */
function embedbuilder_message(client, message, color, title, description, thumbnail) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
            .setFooter(client.user.username, client.user.displayAvatarURL());
        if (title)
            embed.setTitle(title);
        if (description)
            embed.setDescription(description);
        if (thumbnail)
            embed.setThumbnail(thumbnail);
        return message.channel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error(error);
    }
}
/**
 *  Build and send embed in the channel of the queue
 */
function embedbuilder(client, user, channel, color, title, description, thumbnail) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
        .setFooter(client.user.username, client.user.displayAvatarURL());
    if (title)
        embed.setTitle(title);
    if (description)
        embed.setDescription(description);
    if (thumbnail)
        embed.setThumbnail(thumbnail);
    return channel.send({ embeds: [embed] });
}
/**
 *  this function is for playing the song
 */
async function playsong(queue, song) {
    try {
        // Delete old playing message if there is one
        try {
            (await queue.textChannel.messages.fetch(await db.get(`playingembed_${queue.textChannel.guildId}`))).delete();
        }
        catch (error) { }
        // Send new playing message
        let embedMessage = await send_playing_embed(queue, song);
        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector();
        collector.on('collect', async (interaction) => {
            // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
            interaction.deferUpdate();
            // Check if user is in the voice channel
            if (!queue.voiceChannel.members.has(interaction.member.user.id))
                return;
            switch (interaction.customId) {
                case Buttons.play_pause_Button.customId:
                    if (queue.playing) {
                        distube.pause(queue);
                        if (user_config.action_messages)
                            embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "PAUSED", `Paused the song`)
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    else {
                        distube.resume(queue);
                        if (user_config.action_messages)
                            embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "RESUMED", `Resumed the song`)
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    playsong(queue, song);
                    return;
                case Buttons.next_Button.customId:
                    distube.skip(queue);
                    if (user_config.action_messages)
                        embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "SKIPPED", `Skipped the song`)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    // The Distube "playSong" event will call the "playsong" function again
                    return;
                case Buttons.back_Button.customId:
                    distube.previous(queue);
                    if (user_config.action_messages)
                        embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "PREVIOUS", `Playing previous song`)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    // The Distube "playSong" event will call the "playsong" function again
                    return;
                case Buttons.seek_backward_Button.customId:
                    var seektime = queue.currentTime - 10;
                    if (seektime < 0)
                        seektime = 0;
                    await distube.seek(queue, Number(seektime));
                    if (user_config.action_messages)
                        embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", `Seeked the song for \`-10 seconds\``)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    playsong(queue, song);
                    return;
                case Buttons.seek_forward_Button.customId:
                    var seektime = queue.currentTime + 10;
                    if (seektime >= queue.songs[0].duration) {
                        seektime = queue.songs[0].duration - 1;
                    }
                    await distube.seek(queue, Number(seektime));
                    if (user_config.action_messages)
                        embedbuilder(client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", `Seeked the song for \`+10 seconds\``)
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    playsong(queue, song);
                    return;
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
/**
 *  Generate playing message
 */
async function send_playing_embed(queue, song) {
    // If no song is provided, use the first song in the queue
    song = song !== null && song !== void 0 ? song : queue.songs[0];
    let embed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle("Playing Song")
        .setDescription(`Song: [\`${song.name}\`](${song.url})`)
        .addField("Duration:", `\`${queue.formattedCurrentTime !== "00:00" ? queue.formattedCurrentTime + " / " + song.formattedDuration : song.formattedDuration}\``, true)
        .addField("Queue:", `\`${queue.songs.length + (queue.songs.length < 2 ? " song" : " songs")} - ${queue.formattedDuration}\``, true)
        .addField("Volume:", `\`${queue.volume} %\``, true)
        .addField("Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? ":ballot_box_with_check: Queue" : ":ballot_box_with_check: Song" : "❌"}\``, true)
        .addField("Autoplay:", `\`${queue.autoplay ? ":ballot_box_with_check:" : "❌"}\``, true)
        .addField("Filter:", `\`${queue.filters.length != 0 ? queue.filters : "❌"}\``, true)
        .setFooter(client.user.username, client.user.displayAvatarURL());
    if (song.user)
        embed.setAuthor(song.user.tag, song.user.displayAvatarURL({ dynamic: true }));
    if (song.thumbnail)
        embed.setThumbnail(song.thumbnail);
    // Send new playing message
    const embedMessage = await queue.textChannel.send({
        embeds: [embed],
        components: [new Discord.MessageActionRow({ components: [
                    Buttons.play_pause_Button,
                    Buttons.back_Button,
                    Buttons.next_Button,
                    Buttons.seek_backward_Button,
                    Buttons.seek_forward_Button,
                ] })]
    });
    // Save the message id to db
    db.put(`playingembed_${embedMessage.guild.id}`, embedMessage.id);
    // Return the message
    return embedMessage;
}
/**
 *  this function is for current Queue
 */
function QueueEmbed(queue) {
    let embeds = [];
    // Create embeds (one per 10 songs)
    for (let i = 0; i < queue.songs.length; i += 10) {
        // Get next 10 songs
        const current = queue.songs.slice(i, i + 10);
        // Create string of each song (`**Index** - [Title](Link)`)
        let info = [];
        for (let j = 0; j < current.length; j++) {
            try {
                info[j] = `**${j + i}** - [${current[j].name}](${current[j].url})`;
            }
            catch (error) {
                info[j] = `**${j + i}** - ${current[j].url}`;
            }
        }
        // Create and add embed
        const embed = new Discord.MessageEmbed()
            .setTitle("Server Queue")
            .setColor("#fffff0")
            .setDescription(`**Current Song - [\`${queue.songs[0].name}\`](${queue.songs[0].url})**\n\n${info.join("\n")}`)
            .setFooter(client.user.username, client.user.displayAvatarURL());
        embeds.push(embed);
    }
    // Return the embeds
    return embeds;
}
