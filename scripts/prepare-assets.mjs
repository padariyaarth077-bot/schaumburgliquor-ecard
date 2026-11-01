import sharp from 'sharp';
import {readdir} from 'node:fs/promises';
const files=(await readdir('.')).filter(f=>f.endsWith('.jpeg'));
await sharp({create:{width:900,height:Math.ceil(files.length/3)*230,channels:3,background:'#fff'}}).composite(await Promise.all(files.map(async(f,i)=>({input:await sharp(f).resize(290,200,{fit:'cover'}).extend({bottom:30,background:'white'}).composite([{input:Buffer.from(`<svg width="290" height="230"><text x="10" y="222" font-size="20">${i+1}</text></svg>`)}]).png().toBuffer(),left:i%3*300,top:Math.floor(i/3)*230})))).jpeg().toFile('gallery-contact-sheet.jpg');
for(let i=0;i<files.length;i++) {await sharp(files[i]).rotate().resize({width:1200,withoutEnlargement:true}).webp({quality:82}).toFile(`public/assets/store-${i+1}.webp`); await sharp(files[i]).rotate().resize({width:480,withoutEnlargement:true}).webp({quality:78}).toFile(`public/assets/store-${i+1}-small.webp`);}
await sharp('source-assets/logo.png').extract({left:100,top:420,width:1050,height:390}).resize({width:840}).webp({quality:92}).toFile('public/assets/logo.webp');
