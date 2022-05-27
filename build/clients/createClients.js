"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClients = void 0;
const spotify_1 = require("@distube/spotify");
const yt_dlp_1 = require("@distube/yt-dlp");
const distube_1 = require("distube");
const discord_js_1 = require("discord.js");
/**
   * Returns an array of available discord client and distube instance pairs.
   *
   * @param config - Bot config object
   * @returns Client pair array (client, distube)
   *
   */
async function createClients(config) {
    var _a, _b, _c;
    let clients = [];
    for (let token of config.userConfig.tokens) {
        // Discord client
        let discord = new discord_js_1.Client({
            messageCacheLifetime: 0,
            messageSweepInterval: 0,
            intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES]
        });
        discord.login(token);
        // Distube instance
        let distube = new distube_1.DisTube(discord, {
            youtubeDL: false,
            youtubeCookie: (_a = config.userConfig.youtubeCookie) !== null && _a !== void 0 ? _a : undefined,
            youtubeIdentityToken: (_b = config.userConfig.youtubeIdentityToken) !== null && _b !== void 0 ? _b : undefined,
            nsfw: (_c = config.userConfig.nsfw) !== null && _c !== void 0 ? _c : false,
            customFilters: config.filters,
            searchSongs: 10,
            leaveOnStop: true,
            leaveOnFinish: false,
            leaveOnEmpty: true,
            plugins: [config.userConfig.spotify ? (new spotify_1.SpotifyPlugin({ api: {
                        clientId: config.userConfig.spotify.clientId,
                        clientSecret: config.userConfig.spotify.clientSecret
                    },
                    parallel: true,
                    emitEventsAfterFetching: true
                }), new yt_dlp_1.YtDlpPlugin()) : new yt_dlp_1.YtDlpPlugin(),
            ]
        });
        // Log when the bot is ready
        discord.on("ready", async () => {
            console.log(`Client "${discord.user.tag}" is ready. Invite link: https://discord.com/oauth2/authorize?client_id=${discord.user.id}&permissions=105330560064&scope=bot`);
            discord.user.setPresence({
                status: "online",
                activities: [
                    {
                        name: "Music",
                        type: "PLAYING",
                    }
                ]
            });
        });
        // Log when reconnecting
        discord.on("reconnecting", () => {
            console.log(`Client "${discord.user.tag}" is reconnecting`);
            discord.user.setPresence({ status: "invisible" });
        });
        // Log when disconnected
        discord.on("disconnect", () => {
            console.log(`Client "${discord.user.tag}" is disconnected`);
            discord.user.setPresence({ status: "invisible" });
        });
        clients.push({ discord: discord, distube: distube });
    }
    return clients;
}
exports.createClients = createClients;