import QRCode from 'qrcode/lib/server.js';
import {business} from './public/business.js';

const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    const origin=env.PUBLIC_URL ? new URL(env.PUBLIC_URL).origin : url.origin;
    const cardUrl=`${origin}/schaumburg-liquors`;
    const json=(status,data)=>Response.json(data,{status,headers:{...securityHeaders,'Cache-Control':'no-store'}});
    if(url.pathname==='/api/review-assistant')return json(503,{error:'Review suggestions are not available yet. You can still write and copy your own review.'});
    if(!['GET','HEAD'].includes(request.method))return json(405,{error:'Method not allowed.'});
    if(url.pathname==='/api/config')return json(200,{...business,cardUrl});
    if(url.pathname==='/api/qr'){
      const png=url.searchParams.get('format')==='png';
      try{
        const body=png ? await QRCode.toBuffer(cardUrl,{width:1000,margin:4,errorCorrectionLevel:'M'}) : await QRCode.toString(cardUrl,{type:'svg',margin:4,errorCorrectionLevel:'M'});
        return new Response(request.method==='HEAD'?null:body,{headers:{...securityHeaders,'Content-Type':png?'image/png':'image/svg+xml','Cache-Control':'public, max-age=300',...(url.searchParams.has('download')?{'Content-Disposition':`attachment; filename="Schaumburg-Liquors-QR.${png?'png':'svg'}"`}:{})}});
      }catch{return json(503,{error:'QR unavailable. Please share the card link instead.'});}
    }
    if(['/','/index.html','/schaumburg-liquors','/schaumburg-liquors/'].includes(url.pathname)){
      const asset=await env.ASSETS.fetch(new Request(new URL('/index.html',url),{method:'GET'}));
      const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const html=(await asset.text()).replaceAll('__CARD_URL__',escape(cardUrl)).replaceAll('__ORIGIN__',escape(origin));
      return new Response(request.method==='HEAD'?null:html,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
    }
    return env.ASSETS.fetch(request);
  },
};
