export interface UserConfig {
    tokens: string[],
    prefix: string,
    actionMessages: boolean,
    ownerId?: string,
    spotify?: {
        clientId: string,
        clientSecret: string
    },
    nsfw?: boolean,
    youtubeIdentityToken?: string,
    youtubeCookie?: string,
}

export interface Dict { 
    [key: string|number|symbol] : any
}