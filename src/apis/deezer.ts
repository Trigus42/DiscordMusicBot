import { default as axios } from 'axios'
import * as http from "http"

export default class Deezer {
  appId: string
  appSecret: string
  redirectUrl: string
  port: string
  accessToken: string

  /**
   * Listen for get requests on the redirect url port
   * in order to attain the oauth code.
  */
  async listenForCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        if ( req.method === 'GET' ) {
          res.writeHead(200, {'Content-Type': 'text/plain'})
          res.end('Authentication complete! Please return to the app.')
          resolve(req.url.replace('/?code=', ''))
        } else {
          res.writeHead(405, {'Content-Type': 'text/plain'})
          res.end('Method Not Allowed\n')
          reject(new Error('Method not allowed'))
        }
      })
  
      server.listen(this.port)
    })
  }

  /**
   * Sets the access token.  
   * Requires user interaction.
  */
  async authenticate(appId: string, appSecret: string, redirectUrl: string) {
    this.appId = appId
    this.appSecret = appSecret
    this.redirectUrl = redirectUrl
    this.port = this.redirectUrl.split(':')[2].split('/')[0]

    console.log("Please visit:", `https://connect.deezer.com/oauth/auth.php?app_id=${this.appId}&redirect_uri=${this.redirectUrl}&perms=offline_access`)
    let code = await this.listenForCode()

    const res = await axios.get(`https://connect.deezer.com/oauth/access_token.php?app_id=${this.appId}&secret=${this.appSecret}&code=${code}`)
    this.accessToken = res.data.split('=')[1].split('&')[0]

    console.log(this.accessToken)
  }

  uiToApiUrl(url: string): string {
    return "https://" + "api.deezer.com" + "/" + url.split("deezer.com")[1].split("/").slice(-2).join("/")
  }

  /**
   * Return array of songs from url containing the title, artist, and album.
  */
  async tracks(url: string): Promise<Array<Array<string>>> {
    const res = await axios.get(this.uiToApiUrl(url))
    return res.data.tracks.data.map((
      track: { title: any; artist: { name: any }; album: { title: any } }) => [track.title, track.artist.name, track.album.title])
  }
}