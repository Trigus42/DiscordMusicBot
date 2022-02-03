import * as sql from "sqlite3"
import * as fs from "fs"

interface UserConfig {
    token: string,
    prefix: string,
    action_messages: boolean,
    spotify: {
        client_id: string,
        client_secret: string,
        market: string,
        refresh_token: string
    }
    youtube_cookie: string,
}

interface Dict { 
    [key: string] : string
}

export class DB {
    path: string
    connection: sql.Database
    guilds: Guilds
    kvstore: KVStore

    user_config: UserConfig
    filters: Dict

    /*
    * Constructor function to initialize database connection
    */
    constructor (filename?: string, user_config?: UserConfig|string, filters?: Dict|string) {
        // Connect to database
        this.path = filename ?? "./config/db.sqlite"
        this.connection = new sql.Database(this.path)

        // Create guilds and kvstore
        this.guilds = new Guilds(this)
        this.kvstore = new KVStore(this)

        // Load user config
        if (user_config) {
            if (typeof user_config === "string") {
                this.user_config = JSON.parse(fs.readFileSync(user_config, "utf8"))
            } else {
                this.user_config = user_config
            }
        } else {
            this.user_config = JSON.parse(fs.readFileSync("./config/user_config.json", "utf8"))
        }

        // Load filters
        if (filters) {
            if (typeof filters === "string") {
                this.filters = JSON.parse(fs.readFileSync(filters, "utf8"))
            } else {
                this.filters = filters
            }
        } else {
            this.filters = JSON.parse(fs.readFileSync("./config/filters.json", "utf8"))
        }
    }

    /*
    * Close database connection
    */
    close () {
        return this.connection.close()
    }

    /**
    * Run SQL query, return promise with first result or reject with error
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    async get (sql: string, params?: any[]): Promise<string[]|null> {
        return new Promise((resolve, reject) => {
            this.connection.get(sql, params ?? [], (err, row: Object|undefined) => {
                if (err) {
                    reject(err)
                } else {
                    if (row) {
                        resolve(Object.values(row))
                    } else {
                        resolve(null)
                    }
                }
            })
        })
    }

    /**
    * Run SQL query, return promise when finished or reject with error.  
    * Results are discarded
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    async run (sql: string, params?: any[]): Promise<null> {
        return new Promise((resolve, reject) => {
            this.connection.run(sql, params ?? [], (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(null)
                }
            })
        })
    }

    /**
    * Run SQL query, return promise with all results or reject with error.  
    * @param sql SQL query
    * @param params Parameters for SQL query
    */
    async all (sql: string, params?: any[]): Promise<Array<Dict>|null> {
        return new Promise((resolve, reject) => {
            this.connection.all(sql, params ?? [], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}

class KVStore {
    db: DB

    constructor(db: DB) {
        this.db = db
        // Create kvstore table if not exists
        this.db.get(`
            CREATE TABLE IF NOT EXISTS kvstore (
                key TEXT UNIQUE,
                value TEXT
                )
        `)
    }

    /**
    * Insert key-value pair in database kvstore
    */
     async put (key: string, value: string): Promise<null> {
        // Check if key already exists
        var res = (await this.db.get(`SELECT value FROM kvstore WHERE key = ?`, [key]))
        var exists = res ? res[0] : false
        
        // Create new key-value pair if key does not exist
        if (!exists) {
            return this.db.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value])
        // Update key-value pair if key already exists and value is different
        } else if (exists != value) {
            return this.db.run("UPDATE kvstore SET value = ? WHERE key = ?", [value, key])
        }
    }

    /** 
    * Get value from key-value store from database
    * */
    async get (key: string): Promise<string|null> {
        var res = await this.db.get('SELECT value FROM kvstore WHERE key = ?', [key])
        return res ? res[0] : null
    }

    /** 
    * Delete key-value pair from database
    * */
    async del (key: string): Promise<null> {
        return this.db.run('DELETE FROM kvstore WHERE key = ?', [key])
    }
}

class Guilds {
    db: DB

    constructor(db: DB) {
        this.db = db
        this.db.get(`
            CREATE TABLE IF NOT EXISTS guilds (
                id TEXT UNIQUE,
                prefix TEXT,
                playing_message TEXT,
                status_message TEXT
                )
            `)
    }

    async add(id: string): Promise<void> {
        await this.db.run("INSERT OR IGNORE INTO guilds (id) VALUES (?)", [id])
    }

    async get(type: "prefix"|"playing_message"|"status_message", id: string): Promise<string|null> {
        var res = await this.db.get(`SELECT ${type} from guilds WHERE id = ?`, [id])
        return res ? res[0] : null
    }

    async set(type: "prefix"|"playing_message"|"status_message", value: string, id: string): Promise<void> {
        await this.add(id)
        await this.db.run(`UPDATE guilds SET ${type} = ? WHERE id = ?`, [value, id])
    }

    async del(id: string): Promise<void> {
        await this.db.run("DELETE FROM guilds WHERE id = ?", [id])
    }

    async setFilters(id: string, filters: Dict): Promise<void> {
        await this.db.run(`CREATE TABLE IF NOT EXISTS filters_${id} (name TEXT UNIQUE, value TEXT)`)
        for (const [name, value] of Object.entries(filters)) {
            await this.db.run(`INSERT OR REPLACE INTO filters_${id} (name, value) VALUES (?, ?)`, [name, value])
        }
    }

    async getFilters(id: string) {
        // Get custom filters from database
        let db_filters: Dict = {}
        try {
            let res_rows = await this.db.all(`SELECT * FROM filters_${id}`)
            for (const row of Object.values(res_rows)) {
                db_filters[row["name"]] = row["value"]
            }
        } catch {
            db_filters = {}
        }

        // Get default filters, merge with custom filters, overwriting default filters in case of a conflict
        let filters = this.db.filters
        for (const [name, value] of Object.entries(db_filters)) {
            filters[name] = value
        }

        return filters
    }

    async delFilter(id: string, name: string) {
        await this.db.run(`DELETE FROM filters_${id} WHERE name = ?`, [name])
    }
}