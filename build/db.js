"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const sql = __importStar(require("sqlite3"));
const fs = __importStar(require("fs"));
class DB {
    /*
    * Constructor function to initialize database connection
    */
    constructor(filename, user_config, filters) {
        // Connect to database
        this.path = filename !== null && filename !== void 0 ? filename : "./config/db.sqlite";
        this.connection = new sql.Database(this.path);
        // Create guilds and kvstore
        this.guilds = new Guilds(this);
        this.kvstore = new KVStore(this);
        // Load user config
        if (user_config) {
            if (typeof user_config === "string") {
                // eslint-disable-next-line detect-non-literal-fs-filename
                this.userConfig = JSON.parse(fs.readFileSync(user_config, "utf8"));
            }
            else {
                this.userConfig = user_config;
            }
        }
        else {
            this.userConfig = JSON.parse(fs.readFileSync("./config/user_config.json", "utf8"));
        }
        // Load filters
        if (filters) {
            if (typeof filters === "string") {
                // eslint-disable-next-line detect-non-literal-fs-filename
                this.filters = JSON.parse(fs.readFileSync(filters, "utf8"));
            }
            else {
                this.filters = filters;
            }
        }
        else {
            this.filters = JSON.parse(fs.readFileSync("./config/filters.json", "utf8"));
        }
        // Don't allow modification of user config
        Object.freeze(this.userConfig);
        Object.freeze(this.filters);
    }
    /*
    * Close database connection
    */
    close() {
        return this.connection.close();
    }
    /**
    * Run SQL query, return promise with first result or reject with error
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    get(sql, params) {
        return new Promise((resolve, reject) => {
            this.connection.get(sql, params !== null && params !== void 0 ? params : [], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        resolve(Object.values(row));
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    }
    /**
    * Run SQL query, return promise when finished or reject with error.
    * Results are discarded
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    run(sql, params) {
        return new Promise((resolve, reject) => {
            this.connection.run(sql, params !== null && params !== void 0 ? params : [], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
    * Run SQL query, return promise with all results or reject with error.
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    all(sql, params) {
        return new Promise((resolve, reject) => {
            this.connection.all(sql, params !== null && params !== void 0 ? params : [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
}
exports.DB = DB;
class KVStore {
    constructor(db) {
        this.db = db;
        // Create kvstore table if not exists
        this.db.get(`
            CREATE TABLE IF NOT EXISTS kvstore (
                key TEXT UNIQUE,
                value TEXT
                )
        `);
    }
    /**
    * Insert key-value pair in database kvstore
    */
    async put(key, value) {
        // Check if key already exists
        let res = (await this.db.get("SELECT value FROM kvstore WHERE key = ?", [key]));
        let exists = res ? res[0] : false;
        // Create new key-value pair if key does not exist
        if (!exists) {
            return this.db.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value]);
            // Update key-value pair if key already exists and value is different
        }
        else if (exists !== value) {
            return this.db.run("UPDATE kvstore SET value = ? WHERE key = ?", [value, key]);
        }
    }
    /**
    * Get value from key-value store from database
    * */
    async get(key) {
        let res = await this.db.get("SELECT value FROM kvstore WHERE key = ?", [key]);
        return res ? res[0] : null;
    }
    /**
    * Delete key-value pair from database
    * */
    async del(key) {
        return this.db.run("DELETE FROM kvstore WHERE key = ?", [key]);
    }
}
class Guilds {
    constructor(db) {
        this.db = db;
        this.db.get(`
            CREATE TABLE IF NOT EXISTS guilds (
                id TEXT UNIQUE,
                prefix TEXT,
                playing_message TEXT,
                status_message TEXT
                )
            `);
    }
    async add(id) {
        await this.db.run("INSERT OR IGNORE INTO guilds (id) VALUES (?)", [id]);
    }
    async get(type, id) {
        let res = await this.db.get("SELECT ${type} from guilds WHERE id = ?", [id]);
        return res ? res[0] : null;
    }
    async set(type, value, id) {
        await this.add(id);
        await this.db.run("UPDATE guilds SET ${type} = ? WHERE id = ?", [value, id]);
    }
    async del(id) {
        await this.db.run("DELETE FROM guilds WHERE id = ?", [id]);
    }
    async setFilters(id, filters) {
        await this.db.run("CREATE TABLE IF NOT EXISTS filters_${id} (name TEXT UNIQUE, value TEXT)");
        for (const [name, value] of Object.entries(filters)) {
            await this.db.run("INSERT OR REPLACE INTO filters_${id} (name, value) VALUES (?, ?)", [name, value]);
        }
    }
    async getFilters(id) {
        // Get custom filters from database
        let dbFilters = {};
        try {
            let resRows = await this.db.all("SELECT * FROM filters_${id}");
            for (const row of Object.values(resRows)) {
                dbFilters[row["name"]] = row["value"];
            }
        }
        catch (_a) {
            dbFilters = {};
        }
        // Merge default filters with custom filters, overwriting default filters in case of a conflict
        let filters = Object.assign(Object.assign({}, this.db.filters), dbFilters);
        return filters;
    }
    async delFilter(id, name) {
        await this.db.run("DELETE FROM filters_${id} WHERE name = ?", [name]);
    }
}
