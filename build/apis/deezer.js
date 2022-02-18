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
const axios_1 = __importDefault(require("axios"));
const http = __importStar(require("http"));
class Deezer {
    /**
     * Listen for get requests on the redirect url port
     * in order to attain the oauth code.
    */
    async listenForCode() {
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => {
                if (req.method === "GET") {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("Authentication complete! Please return to the app.");
                    resolve(req.url.replace("/?code=", ""));
                }
                else {
                    res.writeHead(405, { "Content-Type": "text/plain" });
                    res.end("Method Not Allowed\n");
                    reject(new Error("Method not allowed"));
                }
            });
            server.listen(this.port);
        });
    }
    /**
     * Wait for the user to authorize the app set the access token for this instance.
    */
    async auth() {
        let code = await this.listenForCode();
        const res = await axios_1.default.get(`https://connect.deezer.com/oauth/access_token.php?app_id=${this.appId}&secret=${this.appSecret}&code=${code}`);
        this.accessToken = res.data.split("=")[1].split("&")[0];
    }
    /**
     * Creates listener for the redirect url.
     * User is required to visit the returned url in order to obtain the oauth code.
    */
    async startAuth(appId, appSecret, redirectUrl) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.redirectUrl = redirectUrl;
        this.port = this.redirectUrl.split(":")[2].split("/")[0];
        // Start listner
        this.auth();
        return `https://connect.deezer.com/oauth/auth.php?app_id=${this.appId}&redirect_uri=${this.redirectUrl}&perms=offline_access`;
    }
    /**
     * Return array of songs from url containing the title and artist.
    */
    async tracks(url, limit = 500) {
        let type = url.split("/").slice(-2, -1)[0];
        let id = url.split("/").slice(-1)[0];
        switch (type) {
            case "track": {
                const res = await axios_1.default.get(`https://api.deezer.com/track/${id}`);
                return [[res.data.title, res.data.artist.name]];
            }
            case "album": {
                const res = await axios_1.default.get(`https://api.deezer.com/album/${id}?limit=${limit}`);
                return res.data.tracks.data.map((track) => [track.title, track.artist.name]);
            }
            case "playlist": {
                const res = await axios_1.default.get(`https://api.deezer.com/playlist/${id}?limit=${limit}`);
                return res.data.tracks.data.map((track) => [track.title, track.artist.name]);
            }
            case "artist": {
                const res = await axios_1.default.get(`https://api.deezer.com/artist/${id}/top?limit=${limit}`);
                return res.data.data.map((track) => [track.title, track.artist.name]);
            }
            default: throw new Error("Type not supported");
        }
    }
}
exports.default = Deezer;
