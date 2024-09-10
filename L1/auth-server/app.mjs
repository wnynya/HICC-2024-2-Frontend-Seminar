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
  req.client = {};

  // IP
  let ip = req.headers['cf-connecting-ip']
    ? req.headers['cf-connecting-ip']
    : req.headers['wn-connection-ip']
    ? req.headers['wn-connection-ip']
    : req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0]
    : req.socket.remoteAddress;
  ip = ip.substr(0, 7) == '::ffff:' ? ip.substr(7) : ip;
  req.client.ip = ip;

  next();
});
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
  let sid = req.cookies[cid] || genSid(42);
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
    res.cookie(cid, sid, opt);

    data.sessions[sid] = con;
    saveData();
  };
  req.session.destroy = () => {
    const opt = JSON.parse(JSON.stringify(options.cookie));
    opt.maxAge = 0;
    res.cookie(cid, sid, opt);

    delete data.sessions[sid];
    saveData();
  };
  function genSid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  next();
});

app.all('*', (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl;
  const body = req.body;
  console.log(
    `\x1b[96m${
      req.client.ip
    } \x1b[93m[${method}]\x1b[0m ${path} ${JSON.stringify(body)}\x1b[0m`
  );
  next();
});

app.get('/', (req, res) => {
  if (req.session.aid) {
    const account = data.accounts[req.session.aid];
    res.send(
      `로그인 정보: ${account.name} (${account.id}) data: ${JSON.stringify(
        account.data
      )}`
    );
  } else {
    res.send('로그인 정보가 없습니다.');
  }
});
app.post('/login', (req, res) => {
  if (!req.body.id) {
    res.status(400).send('로그인 실패: 아이디가 없습니다.');
    return;
  }
  if (!req.body.password) {
    res.status(400).send('로그인 실패: 비밀번호가 없습니다.');
    return;
  }
  if (!data.accounts[req.body.id]) {
    res.status(400).send('로그인 실패: 계정을 찾을 수 없습니다.');
    return;
  }
  const account = data.accounts[req.body.id];
  if (account.password !== req.body.password) {
    res.status(400).send('로그인 실패: 비밀번호가 일치하지 않습니다.');
    return;
  }
  req.session.aid = req.body.id;
  req.session.save();
  res.send(`로그인 성공: ${account.name} (${req.body.id})`);
});
app.post('/logout', (req, res) => {
  res.send('로그아웃됨');
});
app.post('/register', (req, res) => {
  if (!req.body.id) {
    res.status(400).send('회원가입 실패: 아이디 정보가 없습니다.');
    return;
  }
  if (!req.body.password) {
    res.status(400).send('회원가입 실패: 비밀번호 정보가 없습니다.');
    return;
  }
  if (data.accounts[req.body.id]) {
    res.status(400).send('회원가입 실패: 이미 존재하는 계정입니다.');
    return;
  }
  const d = JSON.parse(JSON.stringify(req.body));
  delete d.id;
  delete d.password;
  delete d.name;
  data.accounts[req.body.id] = {
    id: req.body.id,
    password: req.body.password,
    name: req.body.name || '이름없음',
    data: d,
  };
  saveData();
  const account = data.accounts[req.body.id];
  res.send(`회원가입 성공: ${account.name} (${req.body.id})`);
  console.log(`\x1b[92m회원가입 성공: ${account.name} (${req.body.id})\x1b[0m`);
});
app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

const port = 49981;
app.listen(port);
