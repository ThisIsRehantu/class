import {useState,useEffect,useRef} from 'react';
export const P={cap:'<path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 3 9 3 12 0v-5"/>',list:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',alert:'<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',home:'<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/>',users:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',pc:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>',filter:'<path d="M3 4h18l-7 9v6l-4 2v-8z"/>',chat:'<path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',save:'<path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 3v5h7M8 21v-7h8v7"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',arr:'<path d="M5 12h14M13 6l6 6-6 6"/>',school:'<path d="M3 21h18M5 21V9l7-5 7 5v12M10 21v-5h4v5"/>',ring:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M2 8c0-2 1-4 3-5M22 8c0-2-1-4-3-5"/>'};
Object.assign(P,{clip:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',hour:'<path d="M6 3h12M6 21h12M7 3v3l5 6-5 6v3M17 3v3l-5 6 5 6v3"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',book:'<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',chev:'<path d="m6 9 6 6 6-6"/>',tick:'<path d="m5 12 5 5L20 7"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',wand:'<path d="m15 4 5 5L8 21l-5-5zM14 7l3 3M5 3v3M3.5 4.5h3M19 15v3M17.5 16.5h3"/>',vol:'<path d="M11 5 6 9H3v6h3l5 4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',refresh:'<path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7L21 16M21 21v-5h-5"/>',shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM9 12l2 2 4-4"/>',send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',xc:'<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>'});
export const G='<svg class="i" viewBox="0 0 24 24" style="stroke:none"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.3-.2-1.9H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.800-5.800-4.300H2.700v2.700A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.200 13.600a6 6 0 0 1 0-3.800V7.100H2.700a10 10 0 0 0 0 9.200z"/><path fill="#EA4335" d="M12 5.900c1.500 0 2.900.5 4 1.500l3-3A10 10 0 0 0 2.700 7.100l3.500 2.700C7 7.700 9.300 5.900 12 5.900z"/></svg>';
export const Ic=({n})=><svg className="i" viewBox="0 0 24 24" dangerouslySetInnerHTML={{__html:P[n]}}/>;
export const Brand=({sub=true})=><div className="pill"><div className="logo"><Ic n="cap"/></div><div><b>Deadline<span>ku</span></b>{sub&&<small>Satu tempat untuk semua tugas kelas.</small>}</div></div>;
export const fmt=d=>new Date(d).toLocaleString('id-ID',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
export const fmtFull=d=>{const x=new Date(d);return x.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+', '+x.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})};
export function rel(d){const now=new Date(),x=new Date(d),ms=x-now,m=Math.round(Math.abs(ms)/6e4),h=Math.round(Math.abs(ms)/36e5),cal=Math.round((new Date(x.getFullYear(),x.getMonth(),x.getDate())-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
if(ms<0)return m<60?`Telat ${Math.max(1,m)} menit`:h<24?`Telat ${h} jam`:`Telat ${Math.round(h/24)} hari`;
if(m<60)return`${Math.max(1,m)} menit lagi`;if(h<24&&cal===0)return`${h} jam lagi`;if(cal===0)return'Hari ini';if(cal===1)return'Besok';return`${cal} hari lagi`}
export const hue=str=>{let h=0;for(const c of str||'')h=(h*31+c.charCodeAt(0))%360;return h};
export const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
export const toLocalInput=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
export const mkCode=n=>(n.replace(/[^a-z0-9]/gi,'').slice(0,3).toUpperCase()||'KLS')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
export const lsGet=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
export const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
export const getPrefs=uid=>({push:false,h3:true,h1:true,hours:6,...lsGet('ct_prefs_'+uid,{})});
export const JENIS=['individu','kelompok','quiz','project','laporan','presentasi'];
export const REM=[['none','Tanpa reminder'],['H-7','H-7'],['H-3','H-3'],['H-1','H-1'],['12j','12 jam sebelum'],['6j','6 jam sebelum'],['3j','3 jam sebelum'],['1j','1 jam sebelum']];
const RH={'H-7':168,'H-3':72,'H-1':24,'12j':12,'6j':6,'3j':3,'1j':1};
export function Pick({name,options,defaultValue,label}){
const [v,setV]=useState(defaultValue??options[0][0]),[open,setOpen]=useState(false),[up,setUp]=useState(false),[mh,setMh]=useState(288),[hi,setHi]=useState(0),ref=useRef(null),menu=useRef(null);
const idx=options.findIndex(o=>o[0]===v),cur=options[idx]||options[0];
useEffect(()=>{if(!open)return;
const off=e=>{if(!ref.current?.contains(e.target))setOpen(false)},esc=e=>{if(e.key==='Escape')setOpen(false)};
document.addEventListener('pointerdown',off);document.addEventListener('keydown',esc);
return()=>{document.removeEventListener('pointerdown',off);document.removeEventListener('keydown',esc)}},[open]);
useEffect(()=>{if(open)menu.current?.children[hi]?.scrollIntoView({block:'nearest'})},[open,hi]);
const toggle=()=>{if(open)return setOpen(false);
const r=ref.current.getBoundingClientRect(),below=innerHeight-r.bottom-100,above=r.top-80,u=below<260&&above>below;
setUp(u);setMh(Math.max(160,Math.min(288,u?above:below)));setHi(Math.max(0,idx));setOpen(true)};
const pick=i=>{setV(options[i][0]);setOpen(false)};
const key=e=>{if(!open){if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();toggle()}return}
if(e.key==='ArrowDown'){e.preventDefault();setHi(h=>Math.min(options.length-1,h+1))}
else if(e.key==='ArrowUp'){e.preventDefault();setHi(h=>Math.max(0,h-1))}
else if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(hi)}
else if(e.key==='Tab')setOpen(false)};
return<div className="dd" ref={ref} onKeyDown={key}><input type="hidden" name={name} value={v}/>
<button type="button" className={'dd-btn'+(open?' open':'')} onClick={toggle} aria-haspopup="listbox" aria-expanded={open} aria-label={label}><span>{cur[1]}</span><Ic n="chev"/></button>
{open&&<div className={'dd-menu'+(up?' up':'')} ref={menu} role="listbox" style={{maxHeight:mh}}>{options.map(([val,txt],i)=><button type="button" key={val} role="option" aria-selected={val===v} className={'dd-opt'+(val===v?' on':'')+(i===hi?' hi':'')} onMouseEnter={()=>setHi(i)} onClick={()=>pick(i)}><span>{txt}</span>{val===v&&<Ic n="tick"/>}</button>)}</div>}</div>}
export const stOf=(t,uid)=>t.status?.[uid]||'belum';
export const kind=(t,uid)=>{const s=stOf(t,uid),d=new Date(t.deadline)-Date.now();return s==='selesai'?'done':d<0?'late':d<172800000?'soon':'ok'};
export function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2200)}
export function useMedia(q){const [m,setM]=useState(()=>matchMedia(q).matches);useEffect(()=>{const mm=matchMedia(q),f=()=>setM(mm.matches);mm.addEventListener('change',f);return()=>mm.removeEventListener('change',f)},[q]);return m}
export const askPerm=async()=>{if(!('Notification' in window)){toast('Browser tidak mendukung notifikasi');return false}let r=Notification.permission;if(r==='default')r=await Notification.requestPermission();if(r!=='granted')toast('Izin notifikasi belum diberikan');return r==='granted'};
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.08;o.start();o.stop(a.currentTime+.25)}catch{}}
export async function notify(uid,t,b,tone){if(tone)beep();toast(b);if(!(getPrefs(uid).push||tone)||!('Notification' in window)||Notification.permission!=='granted')return;
try{await navigator.serviceWorker.register('/sw.js');const r=await navigator.serviceWorker.ready;await r.showNotification(t,{body:b,tag:'deadlineku'})}catch{try{new Notification(t,{body:b})}catch{}}}
export function checkReminders(uid,tasks){const p=getPrefs(uid),sent=lsGet('ct_sent_'+uid,{}),now=Date.now(),H=36e5,log=lsGet('ct_log_'+uid,[]);let ch=false;
tasks.forEach(t=>{if(stOf(t,uid)==='selesai')return;const d=new Date(t.deadline)-now;if(d<=0)return;
const ws=t.reminder!==undefined?(RH[t.reminder]?[['t:'+t.reminder+':'+new Date(t.deadline).getTime(),RH[t.reminder]*H]]:[]):[p.h3&&['h3',72*H],p.h1&&['h1',24*H],['hr',p.hours*H]].filter(Boolean);
const ks=ws.filter(([,w])=>d<=w).map(([k])=>t.id+':'+k);
if(!ks.some(k=>!sent[k]))return;ks.forEach(k=>sent[k]=1);ch=true;const m=`${t.title} belum selesai. Deadline ${fmt(t.deadline)}`;log.unshift({t:now,m});notify(uid,'Reminder deadline tugas',m)});
if(ch){lsSet('ct_sent_'+uid,sent);lsSet('ct_log_'+uid,log.slice(0,30))}return ch}
