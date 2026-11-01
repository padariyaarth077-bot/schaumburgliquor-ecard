import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';

test('Cloudflare routes use public origin and keep AI unavailable',async()=>{
  const origin='https://card.example';
  const env={ASSETS:{fetch:async()=>new Response('<link href="__CARD_URL__"><img src="__ORIGIN__/assets/store-7.webp">')}};
  const request=path=>new Request(origin+path);
  const config=await (await worker.fetch(request('/api/config'),env)).json();
  assert.equal(config.cardUrl,origin+'/schaumburg-liquors');
  assert.equal(config.googleReviewUrl,'');
  assert.match(await (await worker.fetch(request('/schaumburg-liquors'),env)).text(),/https:\/\/card.example\/schaumburg-liquors/);
  assert.equal((await worker.fetch(new Request(origin+'/api/review-assistant',{method:'POST'}),env)).status,503);
  for(const format of ['png','svg']){
    const response=await worker.fetch(request('/api/qr?format='+format+'&download=1'),env);
    assert.equal(response.status,200);
    assert.match(response.headers.get('content-disposition'),/attachment/);
    const bytes=new Uint8Array(await response.arrayBuffer());
    if(format==='png')assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
    else assert.match(new TextDecoder().decode(bytes),/<svg/);
  }
});
