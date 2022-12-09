// To parse this data:
//
//   import { Convert, Album } from "./file";
//
//   const album = Convert.toAlbum(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Album {
  id?:                    number;
  title?:                 Title;
  upc?:                   string;
  link?:                  string;
  share?:                 string;
  cover?:                 string;
  coverSmall?:            string;
  coverMedium?:           string;
  coverBig?:              string;
  coverXl?:               string;
  md5Image?:              Md5Image;
  genreID?:               number;
  genres?:                Genres;
  label?:                 string;
  nbTracks?:              number;
  duration?:              number;
  fans?:                  number;
  releaseDate?:           Date;
  recordType?:            RecordTypeEnum;
  available?:             boolean;
  tracklist?:             string;
  explicitLyrics?:        boolean;
  explicitContentLyrics?: number;
  explicitContentCover?:  number;
  contributors?:          Contributor[];
  artist?:                AlbumArtist;
  type?:                  RecordTypeEnum;
  tracks?:                Tracks;
}

export interface AlbumArtist {
  id?:            number;
  name?:          Name;
  picture?:       string;
  pictureSmall?:  string;
  pictureMedium?: string;
  pictureBig?:    string;
  pictureXl?:     string;
  tracklist?:     string;
  type?:          ArtistType;
}

export enum Name {
  DaftPunk = "Daft Punk",
}

export enum ArtistType {
  Artist = "artist",
}

export interface Contributor {
  id?:            number;
  name?:          Name;
  link?:          string;
  share?:         string;
  picture?:       string;
  pictureSmall?:  string;
  pictureMedium?: string;
  pictureBig?:    string;
  pictureXl?:     string;
  radio?:         boolean;
  tracklist?:     string;
  type?:          ArtistType;
  role?:          string;
}

export interface Genres {
  data?: GenresDatum[];
}

export interface GenresDatum {
  id?:      number;
  name?:    string;
  picture?: string;
  type?:    string;
}

export enum Md5Image {
  The2E018122Cb56986277102D2041A592C8 = "2e018122cb56986277102d2041a592c8",
}

export enum RecordTypeEnum {
  Album = "album",
}

export enum Title {
  Discovery = "Discovery",
}

export interface Tracks {
  data?: TracksDatum[];
}

export interface TracksDatum {
  id?:                    number;
  readable?:              boolean;
  title?:                 string;
  titleShort?:            string;
  titleVersion?:          string;
  link?:                  string;
  duration?:              number;
  rank?:                  number;
  explicitLyrics?:        boolean;
  explicitContentLyrics?: number;
  explicitContentCover?:  number;
  preview?:               string;
  md5Image?:              Md5Image;
  artist?:                DatumArtist;
  album?:                 AlbumClass;
  type?:                  DatumType;
}

export interface AlbumClass {
  id?:          number;
  title?:       Title;
  cover?:       string;
  coverSmall?:  string;
  coverMedium?: string;
  coverBig?:    string;
  coverXl?:     string;
  md5Image?:    Md5Image;
  tracklist?:   string;
  type?:        RecordTypeEnum;
}

export interface DatumArtist {
  id?:        number;
  name?:      Name;
  tracklist?: string;
  type?:      ArtistType;
}

export enum DatumType {
  Track = "track",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toAlbum(json: string): Album {
      return cast(JSON.parse(json), r("Album"));
  }

  public static albumToJson(value: Album): string {
      return JSON.stringify(uncast(value, r("Album")), null, 2);
  }

  public static toAlbumArtist(json: string): AlbumArtist {
      return cast(JSON.parse(json), r("AlbumArtist"));
  }

  public static albumArtistToJson(value: AlbumArtist): string {
      return JSON.stringify(uncast(value, r("AlbumArtist")), null, 2);
  }

  public static toContributor(json: string): Contributor {
      return cast(JSON.parse(json), r("Contributor"));
  }

  public static contributorToJson(value: Contributor): string {
      return JSON.stringify(uncast(value, r("Contributor")), null, 2);
  }

  public static toGenres(json: string): Genres {
      return cast(JSON.parse(json), r("Genres"));
  }

  public static genresToJson(value: Genres): string {
      return JSON.stringify(uncast(value, r("Genres")), null, 2);
  }

  public static toGenresDatum(json: string): GenresDatum {
      return cast(JSON.parse(json), r("GenresDatum"));
  }

  public static genresDatumToJson(value: GenresDatum): string {
      return JSON.stringify(uncast(value, r("GenresDatum")), null, 2);
  }

  public static toTracks(json: string): Tracks {
      return cast(JSON.parse(json), r("Tracks"));
  }

  public static tracksToJson(value: Tracks): string {
      return JSON.stringify(uncast(value, r("Tracks")), null, 2);
  }

  public static toTracksDatum(json: string): TracksDatum {
      return cast(JSON.parse(json), r("TracksDatum"));
  }

  public static tracksDatumToJson(value: TracksDatum): string {
      return JSON.stringify(uncast(value, r("TracksDatum")), null, 2);
  }

  public static toAlbumClass(json: string): AlbumClass {
      return cast(JSON.parse(json), r("AlbumClass"));
  }

  public static albumClassToJson(value: AlbumClass): string {
      return JSON.stringify(uncast(value, r("AlbumClass")), null, 2);
  }

  public static toDatumArtist(json: string): DatumArtist {
      return cast(JSON.parse(json), r("DatumArtist"));
  }

  public static datumArtistToJson(value: DatumArtist): string {
      return JSON.stringify(uncast(value, r("DatumArtist")), null, 2);
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
  "Album": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "title", js: "title", typ: u(undefined, r("Title")) },
      { json: "upc", js: "upc", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "share", js: "share", typ: u(undefined, "") },
      { json: "cover", js: "cover", typ: u(undefined, "") },
      { json: "cover_small", js: "coverSmall", typ: u(undefined, "") },
      { json: "cover_medium", js: "coverMedium", typ: u(undefined, "") },
      { json: "cover_big", js: "coverBig", typ: u(undefined, "") },
      { json: "cover_xl", js: "coverXl", typ: u(undefined, "") },
      { json: "md5_image", js: "md5Image", typ: u(undefined, r("Md5Image")) },
      { json: "genre_id", js: "genreID", typ: u(undefined, 0) },
      { json: "genres", js: "genres", typ: u(undefined, r("Genres")) },
      { json: "label", js: "label", typ: u(undefined, "") },
      { json: "nb_tracks", js: "nbTracks", typ: u(undefined, 0) },
      { json: "duration", js: "duration", typ: u(undefined, 0) },
      { json: "fans", js: "fans", typ: u(undefined, 0) },
      { json: "release_date", js: "releaseDate", typ: u(undefined, Date) },
      { json: "record_type", js: "recordType", typ: u(undefined, r("RecordTypeEnum")) },
      { json: "available", js: "available", typ: u(undefined, true) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "explicit_lyrics", js: "explicitLyrics", typ: u(undefined, true) },
      { json: "explicit_content_lyrics", js: "explicitContentLyrics", typ: u(undefined, 0) },
      { json: "explicit_content_cover", js: "explicitContentCover", typ: u(undefined, 0) },
      { json: "contributors", js: "contributors", typ: u(undefined, a(r("Contributor"))) },
      { json: "artist", js: "artist", typ: u(undefined, r("AlbumArtist")) },
      { json: "type", js: "type", typ: u(undefined, r("RecordTypeEnum")) },
      { json: "tracks", js: "tracks", typ: u(undefined, r("Tracks")) },
  ], false),
  "AlbumArtist": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, r("Name")) },
      { json: "picture", js: "picture", typ: u(undefined, "") },
      { json: "picture_small", js: "pictureSmall", typ: u(undefined, "") },
      { json: "picture_medium", js: "pictureMedium", typ: u(undefined, "") },
      { json: "picture_big", js: "pictureBig", typ: u(undefined, "") },
      { json: "picture_xl", js: "pictureXl", typ: u(undefined, "") },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, r("ArtistType")) },
  ], false),
  "Contributor": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, r("Name")) },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "share", js: "share", typ: u(undefined, "") },
      { json: "picture", js: "picture", typ: u(undefined, "") },
      { json: "picture_small", js: "pictureSmall", typ: u(undefined, "") },
      { json: "picture_medium", js: "pictureMedium", typ: u(undefined, "") },
      { json: "picture_big", js: "pictureBig", typ: u(undefined, "") },
      { json: "picture_xl", js: "pictureXl", typ: u(undefined, "") },
      { json: "radio", js: "radio", typ: u(undefined, true) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, r("ArtistType")) },
      { json: "role", js: "role", typ: u(undefined, "") },
  ], false),
  "Genres": o([
      { json: "data", js: "data", typ: u(undefined, a(r("GenresDatum"))) },
  ], false),
  "GenresDatum": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, "") },
      { json: "picture", js: "picture", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, "") },
  ], false),
  "Tracks": o([
      { json: "data", js: "data", typ: u(undefined, a(r("TracksDatum"))) },
  ], false),
  "TracksDatum": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "readable", js: "readable", typ: u(undefined, true) },
      { json: "title", js: "title", typ: u(undefined, "") },
      { json: "title_short", js: "titleShort", typ: u(undefined, "") },
      { json: "title_version", js: "titleVersion", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "duration", js: "duration", typ: u(undefined, 0) },
      { json: "rank", js: "rank", typ: u(undefined, 0) },
      { json: "explicit_lyrics", js: "explicitLyrics", typ: u(undefined, true) },
      { json: "explicit_content_lyrics", js: "explicitContentLyrics", typ: u(undefined, 0) },
      { json: "explicit_content_cover", js: "explicitContentCover", typ: u(undefined, 0) },
      { json: "preview", js: "preview", typ: u(undefined, "") },
      { json: "md5_image", js: "md5Image", typ: u(undefined, r("Md5Image")) },
      { json: "artist", js: "artist", typ: u(undefined, r("DatumArtist")) },
      { json: "album", js: "album", typ: u(undefined, r("AlbumClass")) },
      { json: "type", js: "type", typ: u(undefined, r("DatumType")) },
  ], false),
  "AlbumClass": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "title", js: "title", typ: u(undefined, r("Title")) },
      { json: "cover", js: "cover", typ: u(undefined, "") },
      { json: "cover_small", js: "coverSmall", typ: u(undefined, "") },
      { json: "cover_medium", js: "coverMedium", typ: u(undefined, "") },
      { json: "cover_big", js: "coverBig", typ: u(undefined, "") },
      { json: "cover_xl", js: "coverXl", typ: u(undefined, "") },
      { json: "md5_image", js: "md5Image", typ: u(undefined, r("Md5Image")) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, r("RecordTypeEnum")) },
  ], false),
  "DatumArtist": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "name", js: "name", typ: u(undefined, r("Name")) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "type", js: "type", typ: u(undefined, r("ArtistType")) },
  ], false),
  "Name": [
      "Daft Punk",
  ],
  "ArtistType": [
      "artist",
  ],
  "Md5Image": [
      "2e018122cb56986277102d2041a592c8",
  ],
  "RecordTypeEnum": [
      "album",
  ],
  "Title": [
      "Discovery",
  ],
  "DatumType": [
      "track",
  ],
};
