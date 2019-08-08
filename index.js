const sqlite3 = require('sqlite3');
const puppeteer = require('puppeteer');

class App {
    constructor() {
        this.db = new sqlite3.Database('./db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }
        });
    }

    async init() {
        let t = "CREATE TABLE IF NOT EXISTS db(id INTEGER PRIMARY KEY, ts DATETIME NOT NULL, b1 INTEGER DEFAULT 0, b2 INTEGER DEFAULT 0, b3 INTEGER DEFAULT 0, b4 INTEGER DEFAULT 0, b5 INTEGER DEFAULT 0, b6 INTEGER DEFAULT 0,b7 INTEGER DEFAULT 0,b8 INTEGER DEFAULT 0,b9 INTEGER DEFAULT 0,r1 INTEGER DEFAULT 0,v1 NUMERIC DEFAULT 0,r2 INTEGER DEFAULT 0,v2 NUMERIC DEFAULT 0,r3 INTEGER DEFAULT 0,v3 NUMERIC DEFAULT 0,r4 INTEGER DEFAULT 0,v4 NUMERIC DEFAULT 0,r5 INTEGER DEFAULT 0,v5 NUMERIC DEFAULT 0,r6 INTEGER DEFAULT 0,v6 NUMERIC DEFAULT 0,r7 INTEGER DEFAULT 0,v7 NUMERIC DEFAULT 0,r8 INTEGER DEFAULT 0,v8 NUMERIC DEFAULT 0,r9 INTEGER DEFAULT 0,v9 NUMERIC DEFAULT 0,r10 INTEGER DEFAULT 0,v10 NUMERIC DEFAULT 0);";
        await this.db.run(t);
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        let u = process.env.URL;
        if (!u) {
            process.exit(1);
        }
        await this.page.goto(u);
    };

    async close() {
        this.db.close();
        await this.browser.close();
    };

    async fetch() {
    };

    async do() {
        await this.init();
        await this.fetch();
        this.close();
    };
}

const app = new App();
app.do();
