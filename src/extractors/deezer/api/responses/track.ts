// To parse this data:
//
//   import { Convert, Track } from "./file";
//
//   const track = Convert.toTrack(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Track {
  id?:                    number;
  readable?:              boolean;
  title?:                 string;
  titleShort?:            string;
  titleVersion?:          string;
  isrc?:                  string;
  link?:                  string;
  share?:                 string;
  duration?:              number;
  trackPosition?:         number;
  diskNumber?:            number;
  rank?:                  number;
  releaseDate?:           Date;
  explicitLyrics?:        boolean;
  explicitContentLyrics?: number;
  explicitContentCover?:  number;
  preview?:               string;
  bpm?:                   number;
  gain?:                  number;
  availableCountries?:    string[];
  contributors?:          Contributor[];
  md5Image?:              string;
  artist?:                Artist;
  album?:                 Album;
  type?:                  string;
}

export interface Album {
  id?:          number;
  title?:       string;
  link?:        string;
  cover?:       string;
  coverSmall?:  string;
  coverMedium?: string;
  coverBig?:    string;
  coverXl?:     string;
  md5Image?:    string;
  releaseDate?: Date;
  tracklist?:   string;
  type?:        string;
}

export interface Artist {
  id?:            number;
  name?:          string;
  link?:          string;
  share?:         string;
  picture?:       string;
  pictureSmall?:  string;
  pictureMedium?: string;
  pictureBig?:    string;
  pictureXl?:     string;
  radio?:         boolean;
  tracklist?:     string;
  type?:          string;
}

export interface Contributor {
  id?:            number;
  name?:          string;
  link?:          string;
  share?:         string;
  picture?:       string;
  pictureSmall?:  string;
  pictureMedium?: string;
  pictureBig?:    string;
  pictureXl?:     string;
  radio?:         boolean;
  tracklist?:     string;
  type?:          string;
  role?:          string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toTrack(json: string): Track {
      return cast(JSON.parse(json), r("Track"));
  }

  public static trackToJson(value: Track): string {
      return JSON.stringify(uncast(value, r("Track")), null, 2);
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

  public static toContributor(json: string): Contributor {
      return cast(JSON.parse(json), r("Contributor"));
  }

  public static contributorToJson(value: Contributor): string {
      return JSON.stringify(uncast(value, r("Contributor")), null, 2);
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
  "Track": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "readable", js: "readable", typ: u(undefined, true) },
      { json: "title", js: "title", typ: u(undefined, "") },
      { json: "title_short", js: "titleShort", typ: u(undefined, "") },
      { json: "title_version", js: "titleVersion", typ: u(undefined, "") },
      { json: "isrc", js: "isrc", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "share", js: "share", typ: u(undefined, "") },
      { json: "duration", js: "duration", typ: u(undefined, 0) },
      { json: "track_position", js: "trackPosition", typ: u(undefined, 0) },
      { json: "disk_number", js: "diskNumber", typ: u(undefined, 0) },
      { json: "rank", js: "rank", typ: u(undefined, 0) },
      { json: "release_date", js: "releaseDate", typ: u(undefined, Date) },
      { json: "explicit_lyrics", js: "explicitLyrics", typ: u(undefined, true) },
      { json: "explicit_content_lyrics", js: "explicitContentLyrics", typ: u(undefined, 0) },
      { json: "explicit_content_cover", js: "explicitContentCover", typ: u(undefined, 0) },
      { json: "preview", js: "preview", typ: u(undefined, "") },
      { json: "bpm", js: "bpm", typ: u(undefined, 0) },
      { json: "gain", js: "gain", typ: u(undefined, 3.14) },
      { json: "available_countries", js: "availableCountries", typ: u(undefined, a("")) },
      { json: "contributors", js: "contributors", typ: u(undefined, a(r("Contributor"))) },
      { json: "md5_image", js: "md5Image", typ: u(undefined, "") },
      { json: "artist", js: "artist", typ: u(undefined, r("Artist")) },
      { json: "album", js: "album", typ: u(undefined, r("Album")) },
      { json: "type", js: "type", typ: u(undefined, "") },
  ], false),
  "Album": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "title", js: "title", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "cover", js: "cover", typ: u(undefined, "") },
      { json: "cover_small", js: "coverSmall", typ: u(undefined, "") },
      { json: "cover_medium", js: "coverMedium", typ: u(undefined, "") },
      { json: "cover_big", js: "coverBig", typ: u(undefined, "") },
      { json: "cover_xl", js: "coverXl", typ: u(undefined, "") },
      { json: "md5_image", js: "md5Image", typ: u(undefined, "") },
      { json: "release_date", js: "releaseDate", typ: u(undefined, Date) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, "") },
  ], false),
  "Artist": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "share", js: "share", typ: u(undefined, "") },
      { json: "picture", js: "picture", typ: u(undefined, "") },
      { json: "picture_small", js: "pictureSmall", typ: u(undefined, "") },
      { json: "picture_medium", js: "pictureMedium", typ: u(undefined, "") },
      { json: "picture_big", js: "pictureBig", typ: u(undefined, "") },
      { json: "picture_xl", js: "pictureXl", typ: u(undefined, "") },
      { json: "radio", js: "radio", typ: u(undefined, true) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, "") },
  ], false),
  "Contributor": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "share", js: "share", typ: u(undefined, "") },
      { json: "picture", js: "picture", typ: u(undefined, "") },
      { json: "picture_small", js: "pictureSmall", typ: u(undefined, "") },
      { json: "picture_medium", js: "pictureMedium", typ: u(undefined, "") },
      { json: "picture_big", js: "pictureBig", typ: u(undefined, "") },
      { json: "picture_xl", js: "pictureXl", typ: u(undefined, "") },
      { json: "radio", js: "radio", typ: u(undefined, true) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, "") },
      { json: "role", js: "role", typ: u(undefined, "") },
  ], false),
};
