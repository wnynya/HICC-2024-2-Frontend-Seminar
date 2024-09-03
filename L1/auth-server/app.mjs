import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, 'data.json');
let data = {
  accounts: {},
  sessions: {},
};
function loadData() {
  if (!fs.existsSync(dataFile)) {
    saveData();
  }
  data = JSON.parse(fs.readFileSync(dataFile));
}
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data));
}
loadData();

import express from 'express';
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  function parse(s) {
    const o = {};
    for (const c of s.split(';')) {
      const v = c.split('=');
      o[decodeURIComponent((v[0] ? v[0] : '').trim())] = decodeURIComponent(
        (v[1] ? v[1] : '').trim()
      );
    }
    return o;
  }
  req.cookies = req?.headers?.cookie ? parse(req?.headers?.cookie) : {};
  next();
});
app.use((req, res, next) => {
  const cid = 'session';
  const cpt = {
    path: '/',
    secure: false,
    httpOnly: false,
    expire: 0,
  };
  let sid = req.cookies[cid];
  if (sid && data.sessions[sid]) {
    req.session = data.sessions[sid];
  } else {
    req.session = {};
  }
  req.session.id = sid;
  req.session.save = () => {
    const con = JSON.parse(JSON.stringify(req.session));
    delete con.id;
    delete con.save;
    delete con.destroy;

    const opt = JSON.parse(JSON.stringify(cpt));
    res.cookie(cid, session.id, opt);

    data.sessions[session.id] = con;
    saveData();
  };
  req.session.destroy = () => {
    const opt = JSON.parse(JSON.stringify(options.cookie));
    opt.maxAge = 0;
    res.cookie(cid, session.id, opt);

    delete data.sessions[session.id];
    saveData();
  };
  next();
});

app.all('*', (req, res, next) => {
  const method = req.method;
  const path = req.path;
  const body = req.body;
  console.log(`\x1b[90m[${method}] ${path} ${JSON.stringify(body)}\x1b[0m`);
  next();
});

app.get('/', (req, res) => {
  res.end();
});
app.post('/login', (req, res) => {
  res.end();
});
app.post('/logout', (req, res) => {
  res.end();
});
app.post('/register', (req, res) => {
  console.log(`회원가입 성공: `);
  res.end();
});

const port = 80;
app.listen(port);
