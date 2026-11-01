import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReview,validateSuggestions,generateReviewSuggestions,createRateLimiter} from '../review-service.mjs';
import {business,storeStatus} from '../public/business.js';

test('review input accepts every experience level, empty topics and maximum notes',()=>{
  for(let rating=1;rating<=5;rating++) assert.equal(validateReview({rating,tags:[],note:''}).rating,rating);
  assert.equal(validateReview({rating:3,tags:['Helpful Staff','Great Selection'],note:'a'.repeat(500)}).note.length,500);
  for(const value of [null,{}, {rating:0,tags:[],note:''},{rating:5,tags:['Fake'],note:''},{rating:4,tags:['Helpful Staff','Helpful Staff'],note:''},{rating:4,tags:[],note:'x'.repeat(501)},{rating:'5',tags:[],note:''}]) assert.throws(()=>validateReview(value));
});
test('AI output must contain exactly five distinct plain strings',()=>{
  assert.deepEqual(validateSuggestions(['one','two','three','four','five']),['one','two','three','four','five']);
  for(const value of [[],['one'],['a','a','b','c','d'],['a','b','c','d',null],['a','b','c','d','\u0001']])assert.throws(()=>validateSuggestions(value));
});
test('provider sends only supplied customer details; credentials stay in server headers',async()=>{
  const input={rating:3,tags:['Great Selection'],note:'I found a gift.'};
  const suggestions=['I found a gift.','I found a gift here.','My visit was good.','The selection stood out to me.','Good experience finding a gift.'];
  const result=await generateReviewSuggestions(input,{businessName:business.name,apiKey:'test-secret',model:'configured-model',fetcher:async(url,options)=>{
    assert.equal(options.headers.Authorization,'Bearer test-secret');
    const payload=JSON.parse(options.body);
    assert.deepEqual(JSON.parse(payload.messages[1].content),{businessName:business.name,...input});
    assert.ok(!options.body.includes('test-secret'));
    return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({suggestions})}}]})};
  }});
  assert.deepEqual(result,suggestions);
  await assert.rejects(()=>generateReviewSuggestions(input,{businessName:business.name}),/AI_NOT_CONFIGURED/);
  await assert.rejects(()=>generateReviewSuggestions(input,{apiKey:'x',model:'m',fetcher:async()=>({ok:false})}),/AI_UNAVAILABLE/);
  await assert.rejects(()=>generateReviewSuggestions(input,{apiKey:'x',model:'m',fetcher:async()=>{throw new DOMException('Timed out','TimeoutError');}}),/Timed out/);
});
test('rate limit expires and isolates clients',()=>{
  let clock=0;const allow=createRateLimiter({limit:2,windowMs:100,now:()=>clock});
  assert.equal(allow('a'),true);assert.equal(allow('a'),true);assert.equal(allow('a'),false);assert.equal(allow('b'),true);clock=100;assert.equal(allow('a'),true);
});
test('store hours use Chicago time, including midnight and DST transitions',()=>{
  for(const [date,open] of [['2026-11-01T04:59:00Z',true],['2026-11-01T05:00:00Z',false],['2026-11-01T16:59:00Z',false],['2026-11-01T17:00:00Z',true],['2026-11-02T02:00:00Z',false],['2026-11-02T16:30:00Z',true],['2026-03-08T07:30:00Z',false],['2026-03-08T08:30:00Z',false]])assert.equal(storeStatus(new Date(date)),open,date);
  assert.equal(storeStatus(new Date('2026-11-01T18:00:00Z'),{...business,specialHours:{'2026-11-01':null}}),false);
  const overnight={...business,hours:business.hours.map((h,i)=>i===6?[630,1500]:h)};
  assert.equal(storeStatus(new Date('2026-11-01T05:30:00Z'),overnight),true);
});
