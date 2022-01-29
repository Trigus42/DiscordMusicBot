import * as sql from "sqlite3"

export class DB {
    path: string
    db_connection: sql.Database
    guilds: Guilds
    kvstore: KVStore

    /*
    * Constructor function to initialize database connection
    */
    constructor (filename: string) {
        this.path = filename
        this.db_connection = new sql.Database(this.path, (err) => {
            if (err) {
                console.log(err);
            }
        })
        this.guilds = new Guilds(this)
        this.kvstore = new KVStore(this)
    }

    /*
    * Close database connection
    */
    close () {
        return this.db_connection.close()
    }

    /**
    * Run SQL query, return promise with results or reject with error
    */
    async run (sql: string, params?: any[], results?: number): Promise<string[]|string|null> {
        return new Promise((resolve, reject) => {
            this.db_connection.get(sql, params ?? [], (err, row: Object|undefined) => {
                if (err) {
                    reject(err)
                } else {
                    if (row) {
                        var res_slice = Object.values(row).slice(0, results ?? undefined)
                        // Return string if res_slice has only one element else array of strings; if res_slice is empty, return null
                        resolve((res_slice.length > 1 ? res_slice : res_slice[0]))
                    } else {
                        resolve(null)
                    }
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
        this.db.run(`
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
        var exists = await this.db.run(`SELECT value FROM kvstore WHERE key = ?`, [key])
        
        // Create new key-value pair if key does not exist
        if (!exists) {
            return this.db.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value]) as Promise<null>
        // Update key-value pair if key already exists and value is different
        } else if (exists != value) {
            return this.db.run("UPDATE kvstore SET value = ? WHERE key = ?", [value, key]) as Promise<null>
        }
    }

    /** 
    * Get value from key-value store from database
    * */
    async get (key: string, results?: number): Promise<string[]|string|null> {
        return this.db.run('SELECT value FROM kvstore WHERE key = ?', [key], results)
    }

    /** 
    * Delete key-value pair from database
    * */
    async del (key: string): Promise<null> {
        return this.db.run('DELETE FROM kvstore WHERE key = ?', [key]) as Promise<null>
    }
}

class Guilds {
    db: DB

    constructor(db: DB) {
        this.db = db
        this.db.run(`
            CREATE TABLE IF NOT EXISTS guilds (
                id TEXT UNIQUE,
                prefix TEXT,
                playing_message TEXT,
                status_message TEXT
                )
            `)
    }

    async add(id: string): Promise<null> {
        return this.db.run("INSERT OR IGNORE INTO guilds (id) VALUES (?)", [id]) as Promise<null>
    }

    async get(type: "prefix"|"playing_message"|"status_message", id: string): Promise<string|null> {
        return this.db.run(`SELECT ${type} from guilds WHERE id = ?`, [id], 1) as Promise<string>
    }

    async set(type: "prefix"|"playing_message"|"status_message", value: string, id: string): Promise<null> {
        await this.add(id)
        return this.db.run(`UPDATE guilds SET ${type} = ? WHERE id = ?`, [value, id]) as Promise<null>
    }

    async del(id: string): Promise<null> {
        return this.db.run("DELETE FROM guilds WHERE id = ?", [id])  as Promise<null>
    }
}