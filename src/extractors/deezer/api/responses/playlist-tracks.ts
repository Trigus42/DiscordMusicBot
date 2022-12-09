// To parse this data:
//
//   import { Convert, PlaylistTracks } from "./file";
//
//   const playlistTracks = Convert.toPlaylistTracks(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface PlaylistTracks {
    data?:     Data[];
    checksum?: string;
    total?:    number;
    next?:     string;
}

export interface Data {
    id?:                    number;
    readable?:              boolean;
    title?:                 string;
    titleShort?:            string;
    titleVersion?:          TitleVersion;
    link?:                  string;
    duration?:              number;
    rank?:                  number;
    explicitLyrics?:        boolean;
    explicitContentLyrics?: number;
    explicitContentCover?:  number;
    preview?:               string;
    md5Image?:              string;
    timeAdd?:               number;
    artist?:                Artist;
    album?:                 Album;
    type?:                  DataType;
}

export interface Album {
    id?:          number;
    title?:       string;
    cover?:       string;
    coverSmall?:  string;
    coverMedium?: string;
    coverBig?:    string;
    coverXl?:     string;
    md5Image?:    string;
    tracklist?:   string;
    type?:        AlbumType;
}

export enum AlbumType {
    Album = "album",
}

export interface Artist {
    id?:            number;
    name?:          string;
    link?:          string;
    picture?:       string;
    pictureSmall?:  string;
    pictureMedium?: string;
    pictureBig?:    string;
    pictureXl?:     string;
    tracklist?:     string;
    type?:          ArtistType;
}

export enum ArtistType {
    Artist = "artist",
}

export enum TitleVersion {
    Empty = "",
    Remastered = "(Remastered)",
    Remastered2012 = "(Remastered 2012)",
    The2007Remastered = "(2007 Remastered)",
}

export enum DataType {
    Track = "track",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toPlaylistTracks(json: string): PlaylistTracks {
        return cast(JSON.parse(json), r("PlaylistTracks"));
    }

    public static playlistTracksToJson(value: PlaylistTracks): string {
        return JSON.stringify(uncast(value, r("PlaylistTracks")), null, 2);
    }

    public static toData(json: string): Data {
        return cast(JSON.parse(json), r("Data"));
    }

    public static dataToJson(value: Data): string {
        return JSON.stringify(uncast(value, r("Data")), null, 2);
    }

    public static toAlbum(json: string): Album {
        return cast(JSON.parse(json), r("Album"));
    }

    public static albumToJson(value: Album): string {
        return JSON.stringify(uncast(value, r("Album")), null, 2);
    }

    public static toArtist(json: string): Artist {
        return cast(JSON.parse(json), r("Artist"));
    }

    public static artistToJson(value: Artist): string {
        return JSON.stringify(uncast(value, r("Artist")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = val[key];
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: new Array(), additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "PlaylistTracks": o([
        { json: "data", js: "data", typ: u(undefined, a(r("Data"))) },
        { json: "checksum", js: "checksum", typ: u(undefined, "") },
        { json: "total", js: "total", typ: u(undefined, 0) },
        { json: "next", js: "next", typ: u(undefined, "") },
    ], false),
    "Data": o([
        { json: "id", js: "id", typ: u(undefined, 0) },
        { json: "readable", js: "readable", typ: u(undefined, true) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "title_short", js: "titleShort", typ: u(undefined, "") },
        { json: "title_version", js: "titleVersion", typ: u(undefined, r("TitleVersion")) },
        { json: "link", js: "link", typ: u(undefined, "") },
        { json: "duration", js: "duration", typ: u(undefined, 0) },
        { json: "rank", js: "rank", typ: u(undefined, 0) },
        { json: "explicit_lyrics", js: "explicitLyrics", typ: u(undefined, true) },
        { json: "explicit_content_lyrics", js: "explicitContentLyrics", typ: u(undefined, 0) },
        { json: "explicit_content_cover", js: "explicitContentCover", typ: u(undefined, 0) },
        { json: "preview", js: "preview", typ: u(undefined, "") },
        { json: "md5_image", js: "md5Image", typ: u(undefined, "") },
        { json: "time_add", js: "timeAdd", typ: u(undefined, 0) },
        { json: "artist", js: "artist", typ: u(undefined, r("Artist")) },
        { json: "album", js: "album", typ: u(undefined, r("Album")) },
        { json: "type", js: "type", typ: u(undefined, r("DataType")) },
    ], false),
    "Album": o([
        { json: "id", js: "id", typ: u(undefined, 0) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "cover", js: "cover", typ: u(undefined, "") },
        { json: "cover_small", js: "coverSmall", typ: u(undefined, "") },
        { json: "cover_medium", js: "coverMedium", typ: u(undefined, "") },
        { json: "cover_big", js: "coverBig", typ: u(undefined, "") },
        { json: "cover_xl", js: "coverXl", typ: u(undefined, "") },
        { json: "md5_image", js: "md5Image", typ: u(undefined, "") },
        { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
        { json: "type", js: "type", typ: u(undefined, r("AlbumType")) },
    ], false),
    "Artist": o([
        { json: "id", js: "id", typ: u(undefined, 0) },
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "link", js: "link", typ: u(undefined, "") },
        { json: "picture", js: "picture", typ: u(undefined, "") },
        { json: "picture_small", js: "pictureSmall", typ: u(undefined, "") },
        { json: "picture_medium", js: "pictureMedium", typ: u(undefined, "") },
        { json: "picture_big", js: "pictureBig", typ: u(undefined, "") },
        { json: "picture_xl", js: "pictureXl", typ: u(undefined, "") },
        { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
        { json: "type", js: "type", typ: u(undefined, r("ArtistType")) },
    ], false),
    "AlbumType": [
        "album",
    ],
    "ArtistType": [
        "artist",
    ],
    "TitleVersion": [
        "",
        "(Remastered)",
        "(Remastered 2012)",
        "(2007 Remastered)",
    ],
    "DataType": [
        "track",
    ],
};
