import * as got from "got"
import { userHeaders } from "./extractors/deezer/api/const/httpHeaders"

async function main() {
    const res = await got.got(`https://deezer.page.link/f6yS9ntEf8pkJf1s9`, {
        maxRedirects: 0,
        headers: userHeaders
    }).catch(err => err)

    let test = res.response.headers.location
}

main()