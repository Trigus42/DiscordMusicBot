export interface UserConfig {
    tokens: string[],
    prefix: string,
    actionMessages: boolean,
    spotify?: {
        clientId: string,
        clientSecret: string
    },
    nsfw?: boolean,
    youtubeIdentityToken?: string,
    youtubeCookie?: string,
}

export interface Dict { 
    [key: string] : string
}