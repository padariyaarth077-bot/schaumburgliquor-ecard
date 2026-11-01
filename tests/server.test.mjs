import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('HTTP routes, secrets, QR downloads, validation and service failures',async t=>{
  const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'3107',PUBLIC_URL:'http://localhost:3107',OPENAI_API_KEY:'',AI_MODEL:''},stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  await Promise.race([once(child.stdout,'data'),once(child,'error').then(([e])=>{throw e;})]);
  const base='http://localhost:3107';
  const page=await fetch(base+'/schaumburg-liquors');assert.equal(page.status,200);assert.match(await page.text(),/http:\/\/localhost:3107\/schaumburg-liquors/);
  const config=await (await fetch(base+'/api/config')).json();assert.equal(config.phone,'+18476103936');assert.equal(config.OPENAI_API_KEY,undefined);
  assert.equal((await fetch(base+'/.env')).status,404);
  assert.equal((await fetch(base+'/%2e%2e%2fserver.mjs')).status,404);
  for(const format of ['png','svg']){const qr=await fetch(`${base}/api/qr?format=${format}&download=1`);assert.equal(qr.status,200);assert.match(qr.headers.get('content-disposition'),/attachment/);assert.ok((await qr.arrayBuffer()).byteLength>500);}
  const post=value=>fetch(base+'/api/review-assistant',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(value)});
  assert.equal((await post({rating:6,tags:[],note:''})).status,400);
  assert.equal((await post({rating:4,tags:[],note:''})).status,503);
  assert.equal((await post({rating:4,tags:[],note:'x'.repeat(9000)})).status,413);
  assert.equal((await post({rating:4,tags:[],note:''})).status,503);
  assert.equal((await post({rating:4,tags:[],note:''})).status,503);
  assert.equal((await post({rating:4,tags:[],note:''})).status,429);
  assert.equal((await fetch(base+'/api/review-assistant',{method:'POST',headers:{Origin:'https://untrusted.example'}})).status,403);
});
