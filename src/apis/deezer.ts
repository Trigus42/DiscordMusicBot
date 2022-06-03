import { default as axios } from "axios"
import * as http from "http"

export default class Deezer {
	appId: string|undefined
	appSecret: string|undefined
	redirectUrl: string|undefined
	port: string|undefined
	accessToken: string|undefined

	/**
   * Listen for get requests on the redirect url port
   * in order to attain the oauth code.
  */
	async _listenForCode(): Promise<string> {
		return new Promise((resolve, reject) => {
			const server = http.createServer((req, res) => {
				if ( req.method === "GET" ) {
					res.writeHead(200, {"Content-Type": "text/plain"})
					res.end("Authentication complete! Please return to the app.")
					resolve(req.url.replace("/?code=", ""))
				} else {
					res.writeHead(405, {"Content-Type": "text/plain"})
					res.end("Method Not Allowed\n")
					reject(new Error("Method not allowed"))
				}
			})
  
			server.listen(this.port)
		})
	}

	/**
   * Wait for the user to authorize the app set the access token for this instance.
  */
	async _auth() {
		const code = await this._listenForCode()

		const res = await axios.get(`https://connect.deezer.com/oauth/access_token.php?app_id=${this.appId}&secret=${this.appSecret}&code=${code}`)
		this.accessToken = res.data.split("=")[1].split("&")[0]
	}

	/**
   * Creates listener for the redirect url.
   * User is required to visit the returned url in order to obtain the oauth code.
  */
	async startAuth(appId: string, appSecret: string, redirectUrl: string) {
		this.appId = appId
		this.appSecret = appSecret
		this.redirectUrl = redirectUrl
		this.port = this.redirectUrl.split(":")[2].split("/")[0]

		// Start listner
		this._auth()

		return `https://connect.deezer.com/oauth/auth.php?app_id=${this.appId}&redirect_uri=${this.redirectUrl}&perms=offline_access`
	}

	/**
   * Return array of songs from url containing the title and artist.
  */
	async tracks(url: string, limit=500): Promise<Array<{title: string, artist: string, link: string, thumbnail_url: string}>> {
		const type = url.split("/").slice(-2,-1)[0]
		const id = url.split("/").slice(-1)[0]

		switch (type) {
		case "track": {
			const res = await axios.get(`https://api.deezer.com/track/${id}`)
			return [{title: res.data.title, artist: res.data.artist.name, link: res.data.link, thumbnail_url: res.data.album.cover_xl}]
		}
		case "album": {
			const res = await axios.get(`https://api.deezer.com/album/${id}?limit=${limit}`)
			return res.data.tracks.data.map((track: any) => ({title: track.title, artist: track.artist.name, link: track.link, thumbnail_url: track.album.cover_xl}))
		}
		case "playlist": {
			const res = await axios.get(`https://api.deezer.com/playlist/${id}?limit=${limit}`)
			if (!res.data) {
				throw new Error("Playlist not found")
			}
			return res.data.tracks.data.map((track: any) => ({title: track.title, artist: track.artist.name, link: track.link, thumbnail_url: track.album.cover_xl}))
		}
		case "artist": {
			const res = await axios.get(`https://api.deezer.com/artist/${id}/top?limit=${limit}`)
			return res.data.data.map((track: any) => ({title: track.title, artist: track.artist.name, link: track.link, thumbnail_url: track.album.cover_xl}))
		}
		default: throw new Error("Type not supported")
		}
	}
}