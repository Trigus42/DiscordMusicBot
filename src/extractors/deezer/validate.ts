import { resolvePageLink } from "./api/methods/pageLink"

const pageTypes = ["track", "artist", "playlist", "album"] as const

interface RegexResult {
    protocol: string
    domain: string
    lang: string
    pageType: typeof pageTypes[number]
    id: string
    args: string
}

export async function validate(url: string) {
    const deezerShortRegex = new RegExp(String.raw`^(?:(?<protocol>https|http):\/\/)?(?<domain>(deezer\.page\.link))\/(?<code>\S+)$`)
    const deezerRegex = new RegExp(String.raw`^(?:(?<protocol>https|http):\/\/)?(?<domain>(www\.)?(deezer\.com))(\/(?<lang>[a-z]{2}))?\/(?<pageType>${pageTypes.join("|")})\/(?<id>\d+)(?<args>(\?\S+)?)$`)
   
    // Resolve deezer.page.link URLs
    url = deezerShortRegex.test(url) ? await resolvePageLink(url) : url

    const res: Partial<RegexResult> | false = deezerRegex.exec(url).groups ?? false
    return res
}