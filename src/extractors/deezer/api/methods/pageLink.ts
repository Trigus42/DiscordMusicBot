import got from "got"
import { userHeaders } from "../const/httpHeaders"

export async function resolvePageLink(url: string) {
    if (!url.startsWith("https://deezer.page.link/")) {
        throw Error("Not valid deezer.page.link URL")
    }

    const response = await got(url, {
        maxRedirects: 0,
        headers: userHeaders
    }).catch(err => err.response)

    const redirectLocation = response.headers.location
    if (typeof(redirectLocation) === "string" && redirectLocation.startsWith("https://www.deezer.com/")) {
        return redirectLocation
    } else {
        throw Error("Could not resolve to Deezer URL")
    }
}