import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {business} from './public/business.js';
import {createRateLimiter,validateReview,generateReviewSuggestions} from './review-service.mjs';

const root=fileURLToPath(new URL('./public/',import.meta.url));
const port=Number(process.env.PORT)||3000;
const origin=process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL).origin : `http://localhost:${port}`;
const cardUrl=`${origin}/schaumburg-liquors`;
const config={...business,googleReviewUrl:process.env.GOOGLE_REVIEW_URL || business.googleReviewUrl,websiteUrl:process.env.WEBSITE_URL || business.websiteUrl,cardUrl};
const allow=createRateLimiter();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'};
const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try {
    const url=new URL(req.url,origin);
    if(url.pathname==='/api/config' && req.method==='GET') return json(200,config);
    if(url.pathname==='/api/review-assistant' && req.method==='POST') {
      if(req.headers.origin && req.headers.origin!==origin) return json(403,{error:'Request origin is not allowed.'});
      if(!allow(req.socket.remoteAddress)) {res.setHeader('Retry-After','900');return json(429,{error:'Please wait a few minutes before generating more ideas.'});}
      if(!req.headers['content-type']?.startsWith('application/json')) return json(415,{error:'Send JSON only.'});
      let body='';
      for await(const chunk of req) {body+=chunk; if(Buffer.byteLength(body)>8192) return json(413,{error:'Request is too large.'});}
      let input;
      try {input=validateReview(JSON.parse(body));} catch {return json(400,{error:'Choose an experience level and use valid topics and a note of up to 500 characters.'});}
      try {const suggestions=await generateReviewSuggestions(input,{businessName:business.name,apiKey:process.env.OPENAI_API_KEY,model:process.env.AI_MODEL,endpoint:process.env.AI_ENDPOINT});return json(200,{suggestions});}
      catch {return json(503,{error:"We couldn’t generate suggestions right now. You can still write your own review."});}
    }
    if(url.pathname==='/api/qr' && req.method==='GET') {
      const png=url.searchParams.get('format')==='png';
      res.writeHead(200,{'Content-Type':png?'image/png':'image/svg+xml','Cache-Control':'no-store',...(url.searchParams.has('download')?{'Content-Disposition':`attachment; filename="Schaumburg-Liquors-QR.${png?'png':'svg'}"`}:{})});
      return res.end(png?await QRCode.toBuffer(cardUrl,{width:1000,margin:4,errorCorrectionLevel:'M'}):await QRCode.toString(cardUrl,{type:'svg',margin:4,errorCorrectionLevel:'M'}));
    }
    if(req.method!=='GET' && req.method!=='HEAD') return json(405,{error:'Method not allowed.'});
    const path=['/','/schaumburg-liquors','/schaumburg-liquors/'].includes(url.pathname)?'/index.html':decodeURIComponent(url.pathname);
    const file=resolve(root,`.${path}`);
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)) return json(404,{error:'Not found.'});
    if(!(await stat(file)).isFile()) return json(404,{error:'Not found.'});
    let content=await readFile(file);
    if(path==='/index.html') content=Buffer.from(content.toString().replaceAll('__CARD_URL__',escapeHtml(cardUrl)).replaceAll('__ORIGIN__',escapeHtml(origin)));
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':path.startsWith('/assets/')?'public, max-age=86400':'no-cache'});
    res.end(req.method==='HEAD'?undefined:content);
  } catch(error) { if(!res.headersSent) json(error.code==='ENOENT'?404:500,{error:error.code==='ENOENT'?'Not found.':'Something went wrong. Please try again.'}); else res.end(); }
});
server.requestTimeout=30000;
server.listen(port,'127.0.0.1',()=>console.log(`Schaumburg Liquors: http://localhost:${port}/schaumburg-liquors`));
