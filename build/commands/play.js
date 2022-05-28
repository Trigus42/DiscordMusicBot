"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.NewCommand = void 0;
const command_1 = require("../classes/command");
const Embeds = __importStar(require("../embeds"));
const deezer_1 = __importDefault(require("../apis/deezer"));
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "play";
        this.description = "Add a song or playlist to the queue";
        this.aliases = ["p"];
        this.needsArgs = true;
        this.usage = "play [url]";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = false;
        this.needsUserInVC = true;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        var _a, _b, _c;
        let customPlaylist;
        if (args[0].includes("deezer.com")) {
            let type = args[0].split("/").slice(-2, -1)[0];
            if (["track", "album", "playlist", "artist"].includes(type)) {
                let tracks = await deezer_1.default.prototype.tracks(args[0]);
                let search_strings = await Promise.all(tracks.map(async (track) => track[0] + " - " + track[1]));
                let urls = await Promise.all(search_strings.map(async (search_string) => (await distube.search(search_string, { limit: 1 }))[0].url));
                customPlaylist = await distube.createCustomPlaylist(urls, { member: (_a = message.member) !== null && _a !== void 0 ? _a : undefined, properties: { message: message } });
            }
            else {
                Embeds.embedBuilderMessage({
                    client,
                    message,
                    color: "RED",
                    title: "Can only play tracks, albums, playlists and artists from Deezer",
                    deleteAfter: 10000
                });
                return;
            }
        }
        // Replace default client with the correct client
        let channel = await client.channels.fetch(message.member.voice.channel.id);
        message.react("✅");
        await distube.play(channel, (_b = customPlaylist) !== null && _b !== void 0 ? _b : args.join(" "), {
            position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1,
            textChannel: message.channel,
            message: message,
            member: (_c = message.member) !== null && _c !== void 0 ? _c : undefined,
        });
    }
}
exports.NewCommand = NewCommand;
exports.default = new NewCommand();
