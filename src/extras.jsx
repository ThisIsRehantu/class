import {useState,useEffect} from 'react';
import {sendEmailVerification} from 'firebase/auth';
import {doc,collection,query,where,onSnapshot,addDoc,deleteDoc,updateDoc,arrayUnion,arrayRemove,serverTimestamp} from 'firebase/firestore';
import {auth,db} from './firebase';
import {Ic,Brand,toast,fmt,hue} from './lib';

const em=e=>e.code==='permission-denied'?'Akses ditolak. Cek Firestore Rules.':'Terjadi kesalahan: '+(e.code||e.message);
const ok=u=>/^https?:\/\/\S+$/.test(u||'');

/* ===== verifikasi email ===== */
export function Verify({user,onOk,onOut}){
const [busy,setBusy]=useState(false),[cd,setCd]=useState(0);
useEffect(()=>{if(cd<=0)return;const i=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(i)},[cd]);
useEffect(()=>{const i=setInterval(async()=>{try{await user.reload();if(auth.currentUser?.emailVerified)onOk()}catch{}},4000);return()=>clearInterval(i)},[user,onOk]);
const send=async()=>{try{await sendEmailVerification(user);toast('Email verifikasi dikirim. Cek inbox atau spam.');setCd(60)}catch(x){toast(x.code==='auth/too-many-requests'?'Terlalu sering meminta. Coba lagi nanti.':em(x))}};
const check=async()=>{setBusy(true);try{await user.reload();if(auth.currentUser?.emailVerified)onOk();else toast('Email belum terverifikasi')}catch(x){toast(em(x))}setBusy(false)};
return<main className="center"><div className="top"><Brand sub={false}/><button className="ib" onClick={onOut} aria-label="Keluar"><Ic n="out"/></button></div>
<div className="card xl" style={{padding:24,marginTop:24}}><small className="lab">VERIFIKASI EMAIL</small><h1 style={{fontSize:30,margin:'8px 0 12px',lineHeight:1.15}}>Cek email kamu dulu.</h1>
<p className="mut" style={{lineHeight:1.7,overflowWrap:'anywhere'}}>Kami mengirim link verifikasi ke <b style={{color:'var(--txt)'}}>{user.email}</b>. Buka link itu, lalu kembali ke sini. Halaman ini otomatis lanjut setelah email terverifikasi.</p>
<div className="g12" style={{marginTop:18}}><button className="btn w100" disabled={busy} onClick={check}><Ic n="check"/> Saya sudah verifikasi</button><button className="btn ghost w100" disabled={cd>0} onClick={send}><Ic n="send"/> {cd>0?`Kirim ulang (${cd}d)`:'Kirim ulang email'}</button></div></div></main>}

/* ===== progress kelas per tugas ===== */
const SLB={belum:'Belum',proses:'Proses',selesai:'Selesai'};
export function Progress({t,members,adm,full}){
const ms=members.map(m=>({m,s:t.status?.[m.id]||'belum'})),n=Math.max(1,ms.length),d=ms.filter(x=>x.s==='selesai').length,p=ms.filter(x=>x.s==='proses').length;
return<div className="pg"><div className="pg-h"><small>Progress kelas</small><b>{d}/{ms.length} selesai{p?` · ${p} proses`:''}</b></div>
<div className="pg-b" role="progressbar" aria-valuemin="0" aria-valuemax={ms.length} aria-valuenow={d}><i className="d" style={{width:d/n*100+'%'}}/><i className="p" style={{width:p/n*100+'%'}}/></div>
{full&&adm&&<details className="pg-d"><summary>Lihat per anggota</summary>{ms.sort((a,b)=>['belum','proses','selesai'].indexOf(a.s)-['belum','proses','selesai'].indexOf(b.s)).map(({m,s})=><div className="mem" key={m.id}><span>{m.name}</span><span className={'tag '+(s==='selesai'?'done':s==='proses'?'soon':'')}>{SLB[s]}</span></div>)}</details>}</div>}

/* ===== lampiran (link) ===== */
export function Attach({t,adm}){
const list=t.attachments||[],[busy,setBusy]=useState(false);
const add=async e=>{e.preventDefault();const f=e.currentTarget,n=f.n.value.trim(),u=f.u.value.trim();
if(!ok(u))return toast('Link harus diawali http:// atau https://');if(list.length>=10)return toast('Maksimal 10 lampiran');
setBusy(true);try{await updateDoc(doc(db,'tasks',t.id),{attachments:arrayUnion({name:(n||'Lampiran').slice(0,60),url:u})});f.reset()}catch(x){toast(em(x))}setBusy(false)};
const rm=a=>updateDoc(doc(db,'tasks',t.id),{attachments:arrayRemove(a)}).catch(x=>toast(em(x)));
if(!list.length&&!adm)return null;
return<div className="sec"><h3>Lampiran</h3>{list.length?list.map((a,i)=><div className="att" key={i}><a href={ok(a.url)?a.url:undefined} target="_blank" rel="noopener noreferrer"><Ic n="link"/><span>{a.name}</span></a>{adm&&<button className="ib" onClick={()=>rm(a)} aria-label={'Hapus '+a.name}><Ic n="trash"/></button>}</div>):<div className="dash">Belum ada lampiran.</div>}
{adm&&<form className="afm" onSubmit={add}><input name="n" placeholder="Nama (mis. Modul 3)" maxLength="60"/><input name="u" placeholder="https://drive.google.com/..." inputMode="url"/><button className="btn sm" disabled={busy}><Ic n="plus"/> Tambah</button></form>}</div>}

/* ===== komentar ===== */
export function Comments({t,profile}){
const [list,setList]=useState([]),[txt,setTxt]=useState(''),[lk,setLk]=useState(''),[busy,setBusy]=useState(false),adm=profile.role==='admin';
useEffect(()=>onSnapshot(query(collection(db,'comments'),where('classId','==',profile.classId),where('taskId','==',t.id)),s=>setList(s.docs.map(d=>({id:d.id,...d.data({serverTimestamps:'estimate'})})).sort((a,b)=>(a.createdAt?.toMillis?.()||0)-(b.createdAt?.toMillis?.()||0))),()=>{}),[t.id,profile.classId]);
const send=async e=>{e.preventDefault();const text=txt.trim(),link=lk.trim();if(!text)return;if(link&&!ok(link))return toast('Link harus diawali http:// atau https://');
setBusy(true);try{await addDoc(collection(db,'comments'),{classId:profile.classId,taskId:t.id,uid:profile.id,name:profile.name||'Anggota',text:text.slice(0,500),link,createdAt:serverTimestamp()});setTxt('');setLk('')}catch(x){toast(em(x))}setBusy(false)};
const del=c=>confirm('Hapus komentar ini?')&&deleteDoc(doc(db,'comments',c.id)).catch(x=>toast(em(x)));
return<div className="sec"><h3>Komentar{list.length?` (${list.length})`:''}</h3>
<div className="cm-l">{list.length?list.map(c=><div className="cm" key={c.id}><span className="av" style={{background:`hsl(${hue(c.uid)} 55% 35%)`}}>{(c.name||'?')[0].toUpperCase()}</span><div className="cm-b"><div className="cm-h"><b>{c.name}</b><small className="mut">{c.createdAt?fmt(c.createdAt.toMillis()):'...'}</small>{(c.uid===profile.id||adm)&&<button className="cm-x" onClick={()=>del(c)} aria-label="Hapus komentar"><Ic n="x"/></button>}</div><p>{c.text}</p>{ok(c.link)&&<a href={c.link} target="_blank" rel="noopener noreferrer"><Ic n="link"/> {c.link.replace(/^https?:\/\//,'').slice(0,40)}</a>}</div></div>):<div className="dash">Belum ada komentar. Mulai diskusi di sini.</div>}</div>
<form className="cm-f" onSubmit={send}><textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Tulis komentar..." maxLength="500" rows="2"/><div className="cm-r"><input value={lk} onChange={e=>setLk(e.target.value)} placeholder="Link (opsional)" inputMode="url"/><button className="btn sm" disabled={busy||!txt.trim()}><Ic n="send"/> Kirim</button></div></form></div>}
