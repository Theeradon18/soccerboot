// Remote phpMyAdmin SQL Executor for database: ip_std6730251280
class RemotePma {
  constructor() {
    this.baseUrl = 'http://119.59.102.161/nindamdb';
    this.username = 'std6730251280';
    this.password = 'K9eP@1sX';
    this.dbName = 'ip_std6730251280';
    this.cookies = '';
    this.token = '';
    this.lastLogin = 0;
  }

  async login() {
    // Session valid for 10 minutes
    if (this.cookies && this.token && Date.now() - this.lastLogin < 10 * 60 * 1000) {
      return;
    }

    try {
      // 1. GET initial page
      const res1 = await fetch(`${this.baseUrl}/index.php`);
      const html1 = await res1.text();
      const rawCookies = res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get('set-cookie')];
      
      let cookieMap = {};
      (rawCookies || []).forEach(c => {
        if (c) {
          const [key, val] = c.split(';')[0].split('=');
          cookieMap[key.trim()] = val ? val.trim() : '';
        }
      });

      const tokenMatch = html1.match(/name=["']token["'] value=["']([^"']+)["']/);
      const initialToken = tokenMatch ? tokenMatch[1] : '';

      const cookieStr = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

      // 2. POST login credentials
      const body = new URLSearchParams({
        set_session: cookieMap['phpMyAdmin'] || '',
        pma_username: this.username,
        pma_password: this.password,
        server: '1',
        token: initialToken,
        route: '/'
      });

      const res2 = await fetch(`${this.baseUrl}/index.php?route=/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookieStr
        },
        body: body.toString(),
        redirect: 'manual'
      });

      const rawCookies2 = res2.headers.getSetCookie ? res2.headers.getSetCookie() : [res2.headers.get('set-cookie')];
      (rawCookies2 || []).forEach(c => {
        if (c) {
          const [key, val] = c.split(';')[0].split('=');
          cookieMap[key.trim()] = val ? val.trim() : '';
        }
      });

      this.cookies = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

      // 3. GET active token from db page
      const res3 = await fetch(`${this.baseUrl}/index.php?route=/database/sql&db=${this.dbName}`, {
        headers: { 'Cookie': this.cookies }
      });
      const html3 = await res3.text();
      const tokenMatch3 = html3.match(/name=["']token["'] value=["']([^"']+)["']/);
      this.token = tokenMatch3 ? tokenMatch3[1] : initialToken;
      this.lastLogin = Date.now();
      console.log('✅ Connected & Authenticated to phpMyAdmin database:', this.dbName);
    } catch (err) {
      console.error('Remote phpMyAdmin login error:', err.message);
    }
  }

  async executeQuery(sql) {
    try {
      await this.login();

      const body = new URLSearchParams({
        db: this.dbName,
        token: this.token,
        sql_query: sql,
        goto: 'index.php?route=/database/sql',
        is_js_confirmed: '0'
      });

      const res = await fetch(`${this.baseUrl}/index.php?route=/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.cookies
        },
        body: body.toString()
      });

      const html = await res.text();
      return { success: res.status === 200, html };
    } catch (err) {
      console.error('Execute remote SQL error:', err.message);
      return { success: false, error: err.message };
    }
  }

  async fetchRemoteProducts() {
    try {
      await this.login();
      const query = 'SELECT id, name, brand, model, price, color, size, stock, category FROM products ORDER BY id DESC;';
      const res = await this.executeQuery(query);
      if (!res.success || !res.html) return null;

      const tableMatch = res.html.match(/<table[^>]*class=["'][^"']*table_results[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
      if (!tableMatch) return null;

      const tbodyMatch = tableMatch[1].match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
      if (!tbodyMatch) return null;

      const trs = [...tbodyMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      const parsed = [];
      for (const tr of trs) {
        const rowContent = tr[1];
        const dataTds = [...rowContent.matchAll(/<td[^>]*class=["'][^"']*data[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi)]
          .map(m => m[1].replace(/<[^>]+>/g, '').trim());

        if (dataTds.length >= 9) {
          parsed.push({
            id: String(dataTds[0]),
            name: dataTds[1],
            brand: dataTds[2],
            model: dataTds[3],
            price: Number(dataTds[4]) || 0,
            color: dataTds[5],
            size: dataTds[6],
            stock: Number(dataTds[7]) || 0,
            category: dataTds[8],
          });
        }
      }
      return parsed;
    } catch (err) {
      console.error('fetchRemoteProducts error:', err.message);
      return null;
    }
  }
}

module.exports = new RemotePma();

