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
        let t = `CREATE TABLE IF NOT EXISTS db(d INTEGER, s INTEGER, 
        b1 INTEGER DEFAULT 0, b2 INTEGER DEFAULT 0, b3 INTEGER DEFAULT 0, b4 INTEGER DEFAULT 0, b5 INTEGER DEFAULT 0, b6 INTEGER DEFAULT 0,b7 INTEGER DEFAULT 0,b8 INTEGER DEFAULT 0,b9 INTEGER DEFAULT 0,
        n1 TEXT DEFAULT '',r1 INTEGER DEFAULT 0,v1 NUMERIC DEFAULT 0,
        n2 TEXT DEFAULT '',r2 INTEGER DEFAULT 0,v2 NUMERIC DEFAULT 0,
        n3 TEXT DEFAULT '',r3 INTEGER DEFAULT 0,v3 NUMERIC DEFAULT 0,
        n4 TEXT DEFAULT '',r4 INTEGER DEFAULT 0,v4 NUMERIC DEFAULT 0,
        n5 TEXT DEFAULT '',r5 INTEGER DEFAULT 0,v5 NUMERIC DEFAULT 0,
        n6 TEXT DEFAULT '',r6 INTEGER DEFAULT 0,v6 NUMERIC DEFAULT 0,
        n7 TEXT DEFAULT '',r7 INTEGER DEFAULT 0,v7 NUMERIC DEFAULT 0,
        n8 TEXT DEFAULT '',r8 INTEGER DEFAULT 0,v8 NUMERIC DEFAULT 0,
        n9 TEXT DEFAULT '',r9 INTEGER DEFAULT 0,v9 NUMERIC DEFAULT 0,
        n10 TEXT DEFAULT '',r10 INTEGER DEFAULT 0,v10 NUMERIC DEFAULT 0);`;
        await this.db.run(t);
        this.browser = await puppeteer.launch({headless: false});
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

    get(i) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT d FROM db WHERE d=?;',i,(err, row) =>{
                if (err) {
                    reject(err);
                }
                resolve(row ? true: false);
            });
        });
    }

    async fetch() {
        let num;
        this.db.get('SELECT MIN(d) as d FROM db;',(err, row) =>{
            if (err) {
                console.log(err.message);
                process.exit();
            }
            num = row.d && row.d>0 ? row.d : undefined;
        });
        this.page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
        });
        let page = this.page;
        await page.waitFor(2000);
        let li = new RegExp('<li>', 'g');
        let lis = new RegExp('</li>', 'g');
        let th = new RegExp('<th>.*</th>', 'g');
        let td = new RegExp('<td>', 'g');
        let tds = new RegExp('</td>', 'g');
        let tr = new RegExp('<tr>', 'g');
        let trs = new RegExp('</tr>', 'g');
        num = num ? num : await page.$eval('.draw_serie', el => el.value);
        for (let i = num; i > 0; i--) {
            if (await this.get(i)) {
                continue;
            }
            await page.$eval('.draw_serie', el => el.value = '');
            await page.type('.draw_serie', i.toString());
            await page.click('.check-butt');
            let row = await page.$$eval('.pole', el => {
                let out = [];
                el.forEach(e => {
                    out.push(e.innerHTML);
                });
                return out.join('');
            });
            let draw = await page.$eval('.draw_id', el => el.value);
            row = row.replace(li, '');
            row = row.replace(lis, ',');
            let details = await page.$eval('.tren_table tbody', el => el.innerHTML);
            details = details.replace(th, '');
            details = details.replace(td, '');
            details = details.replace(tds, ',');
            details = details.replace(tr, '');
            details = details.replace(trs, '');
            let tmp = (i.toString() + ',' + draw + ',' + row + details).split(',').map(v => +v).slice(0, 40);
            this.db.run(`INSERT INTO db(d, s, b1, b2, b3, b4, b5, b6, b7, b8, b9, n1, r1, v1, n2, r2, v2, n3, r3, v3, 
            n4, r4, v4, n5, r5, v5, n6, r6, v6, n7, r7, v7, n8, r8, v8, n9, r9, v9, n10, r10, v10) 
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, tmp, function (err) {
                if (err) {
                    console.log(err.message);
                    process.exit();
                }
            });
            console.log(i);
        }
    };

    async do() {
        await this.init();
        await this.fetch();
        this.close();
    };
}

const app = new App();
app.do();
