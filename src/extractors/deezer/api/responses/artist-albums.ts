// To parse this data:
//
//   import { Convert, ArtistAlbums } from "./file";
//
//   const artistAlbums = Convert.toArtistAlbums(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ArtistAlbums {
  data?:  data[];
  total?: number;
  next?:  string;
}

export interface data {
  id?:             number;
  title?:          string;
  link?:           string;
  cover?:          string;
  coverSmall?:     string;
  coverMedium?:    string;
  coverBig?:       string;
  coverXl?:        string;
  md5Image?:       string;
  genreID?:        number;
  fans?:           number;
  releaseDate?:    Date;
  recordType?:     Type;
  tracklist?:      string;
  explicitLyrics?: boolean;
  type?:           Type;
}

export enum Type {
  Album = "album",
  Ep = "ep",
  Single = "single",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toArtistAlbums(json: string): ArtistAlbums {
      return cast(JSON.parse(json), r("ArtistAlbums"));
  }

  public static artistAlbumsToJson(value: ArtistAlbums): string {
      return JSON.stringify(uncast(value, r("ArtistAlbums")), null, 2);
  }

  public static todata(json: string): data {
      return cast(JSON.parse(json), r("data"));
  }

  public static dataToJson(value: data): string {
      return JSON.stringify(uncast(value, r("data")), null, 2);
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
  "ArtistAlbums": o([
      { json: "data", js: "data", typ: u(undefined, a(r("data"))) },
      { json: "total", js: "total", typ: u(undefined, 0) },
      { json: "next", js: "next", typ: u(undefined, "") },
  ], false),
  "data": o([
      { json: "id", js: "id", typ: u(undefined, 0) },
      { json: "title", js: "title", typ: u(undefined, "") },
      { json: "link", js: "link", typ: u(undefined, "") },
      { json: "cover", js: "cover", typ: u(undefined, "") },
      { json: "cover_small", js: "coverSmall", typ: u(undefined, "") },
      { json: "cover_medium", js: "coverMedium", typ: u(undefined, "") },
      { json: "cover_big", js: "coverBig", typ: u(undefined, "") },
      { json: "cover_xl", js: "coverXl", typ: u(undefined, "") },
      { json: "md5_image", js: "md5Image", typ: u(undefined, "") },
      { json: "genre_id", js: "genreID", typ: u(undefined, 0) },
      { json: "fans", js: "fans", typ: u(undefined, 0) },
      { json: "release_date", js: "releaseDate", typ: u(undefined, Date) },
      { json: "record_type", js: "recordType", typ: u(undefined, r("Type")) },
      { json: "tracklist", js: "tracklist", typ: u(undefined, "") },
      { json: "explicit_lyrics", js: "explicitLyrics", typ: u(undefined, true) },
      { json: "type", js: "type", typ: u(undefined, r("Type")) },
  ], false),
  "Type": [
      "album",
      "ep",
      "single",
  ],
};
