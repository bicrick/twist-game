const fs=require('fs');
function load(k){const t=fs.readFileSync(`gen_${k}.out`,'utf8').split('\n');const r=[];
  for(let i=0;i<t.length;i++) if(t[i].startsWith('{')){const d=JSON.parse(t[i]);let len=0;for(let j=i+1;j<i+8;j++){const m=(t[j]||'').match(/^len (\d+)/);if(m){len=+m[1];break;}}r.push({d,len});}
  return r.sort((a,b)=>a.len-b.len);}
const take=(k,n)=>{const a=load(k);if(n>=a.length)return a;const o=[];for(let i=0;i<n;i++)o.push(a[Math.round(i*(a.length-1)/(n-1||1))]);return [...new Set(o)];};
const html=fs.readFileSync('index.html','utf8');
const old=JSON.parse(html.match(/const LEVELS = (.*?);\n/s)[1]);
const H=n=>old.find(l=>l.name===n);
const seen=new Set();const key=d=>JSON.stringify({...d,name:''});
const reg=d=>{seen.add(key(d));return d;};
const g=(k,i,n)=>{const all=load(k);const pref=take(k,n)[i];const c=[pref,...all].filter(x=>x&&!seen.has(key(x.d)));return reg(c[0].d);};
const h_=n=>reg(H(n));
const w1=[h_('wrap'),h_('mirror'),h_('flip'),g('w1_tb',0,2),h_('around'),g('w1_A',1,2),h_('two ways'),g('w1_tb',1,2),g('w1_M',0,2),h_('both seams'),h_('long way round'),g('w1_M',1,2),g('w1_B',0,2),h_('pair'),g('w1_B',1,2),h_('pair, twisted'),g('w1_C',0,2),g('w1_C',1,2)];
const hand=JSON.parse(fs.readFileSync('hand2.json','utf8'))[0];
const w2=[hand,g('w2_P1',0,2),g('w2_P1',1,2),g('w2_P2',0,2),g('w2_P3',0,2),g('w2_P2',1,2),g('w2_P3',1,2),g('w2_P4',0,2),g('w2_P4',1,2),g('w2_P5',0,2),g('w2_P5',1,2)];
const clean=l=>({...l,name:''});
const W=[{name:'Twist',sub:'edges that flip you over',hue:205,levels:w1.map(clean)},{name:'Mirror',sub:'floors that flip you over',hue:330,levels:w2.map(clean)}];
fs.writeFileSync('worlds.json',JSON.stringify(W));
fs.writeFileSync('flat.json',JSON.stringify([...w1,...w2]));
console.log(w1.length,w2.length);
