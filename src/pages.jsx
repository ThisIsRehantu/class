import {useState,useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {GoogleAuthProvider,signInWithPopup,signInWithRedirect,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendPasswordResetEmail,sendEmailVerification} from 'firebase/auth';
import {doc,setDoc,addDoc,updateDoc,deleteDoc,collection,query,where,getDocs,serverTimestamp} from 'firebase/firestore';
import {auth,db} from './firebase';
import {Progress,Comments,Attach} from './extras';
import {Ic,G,Brand,fmt,ymd,mkCode,lsGet,lsSet,getPrefs,stOf,kind,toast,askPerm,notify,toLocalInput,Pick,JENIS,REM,fmtFull,rel,hue,digestList,DIGEST_GAP,isArch,gcalUrl,downloadIcs} from './lib';

const FE={'auth/invalid-credential':'Email atau password salah.','auth/wrong-password':'Email atau password salah.','auth/user-not-found':'Email belum terdaftar.','auth/email-already-in-use':'Email sudah terdaftar. Pindah ke Login.','auth/weak-password':'Password minimal 6 karakter.','auth/invalid-email':'Email belum valid.','auth/popup-closed-by-user':'Login Google dibatalkan.','auth/network-request-failed':'Koneksi bermasalah. Coba lagi.','auth/unauthorized-domain':'Domain ini belum diizinkan di Firebase Authentication > Settings > Authorized domains.','auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi nanti.','permission-denied':'Akses ditolak. Cek Firestore Rules.','auth/missing-email':'Isi email dulu.','auth/user-disabled':'Akun ini dinonaktifkan.'};
export const fe=e=>FE[e.code]||('Terjadi kesalahan: '+(e.code||e.message));
const logout=()=>signOut(auth).catch(x=>toast(fe(x)));
const copy=async v=>{try{await navigator.clipboard.writeText(v);toast('Disalin')}catch{toast(v)}};
const Err=({e})=><div className="err">{e}</div>;

const FEATS=[['list','Catat tugas','Semua tersimpan rapi.'],['clock','Deadline','Lihat yang dekat/telat.'],['bell','Reminder','Ingatkan tepat waktu.'],['check','Progress','Belum, Proses, Selesai.'],['chat','Diskusi','Bahas tugas di satu tempat.',1],['ring','Notifikasi','Info penting mudah dicek.',1]];
export const Landing=({onStart})=><main className="land"><section className="hero"><Brand/><h1>Kelola tugas kelas <em>tanpa ribet.</em></h1><p>Deadlineku bantu kelas mencatat tugas, cek deadline, kirim reminder, diskusi, dan pantau progress dalam satu tempat.</p></section>
<section className="feats"><div className="feats-h"><span>BIAR TUGAS LEBIH JELAS</span><b>4 inti</b></div>{FEATS.map(([i,t,d,x])=><div className={'feat'+(x?' xtra':'')} key={t}><div className="logo"><Ic n={i}/></div><h3>{t}</h3><p>{d}</p></div>)}</section>
<button className="btn cta" onClick={onStart}>Mulai sekarang<i><Ic n="arr"/></i></button></main>;

export function Auth({pending}){
const [reg,setReg]=useState(false),[err,setErr]=useState(''),[info,setInfo]=useState(''),[busy,setBusy]=useState(false),fr=useRef(null);
const forgot=async()=>{const e=(new FormData(fr.current).get('email')||'').trim().toLowerCase();if(!/\S+@\S+\.\S+/.test(e))return setErr('Isi email yang valid di kolom Email, lalu tekan Lupa password.');setErr('');try{await sendPasswordResetEmail(auth,e);setInfo('Jika email terdaftar, link reset password sudah dikirim ke '+e+'. Cek inbox atau spam.')}catch(x){setInfo('');setErr(fe(x))}};
const google=async()=>{const p=new GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
try{await signInWithPopup(auth,p)}catch(x){if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(x.code))return signInWithRedirect(auth,p);if(x.code!=='auth/cancelled-popup-request')setErr(fe(x))}};
const submit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget)),em=(f.email||'').trim().toLowerCase();
const v=reg&&!(f.name||'').trim()?'Nama lengkap wajib diisi.':!/\S+@\S+\.\S+/.test(em)?'Email belum valid.':(f.pw||'').length<6?'Password minimal 6 karakter.':'';
if(v)return setErr(v);setErr('');setInfo('');setBusy(true);
try{if(reg){pending.current=f.name.trim();const c=await createUserWithEmailAndPassword(auth,em,f.pw);await updateProfile(c.user,{displayName:pending.current});sendEmailVerification(c.user).catch(()=>{});try{await setDoc(doc(db,'users',c.user.uid),{name:pending.current},{merge:true})}catch{}}
else await signInWithEmailAndPassword(auth,em,f.pw)}catch(x){pending.current=null;setErr(fe(x));setBusy(false)}};
return<main className="center"><Brand/><h1>Masuk ke Deadlineku.</h1><p>Gunakan Google atau email, lalu buat kelas atau join kelas sebelum dashboard terbuka.</p>
<div className="card xl"><button className="btn w100" style={{height:52}} onClick={google}><span dangerouslySetInnerHTML={{__html:G}}/> Masuk dengan Google</button><div className="or">ATAU</div>
<div className="tabs"><button className={reg?'':'on'} onClick={()=>setReg(false)}>Login</button><button className={reg?'on':''} onClick={()=>setReg(true)}>Register</button></div>
<form key={reg} ref={fr} onSubmit={submit} noValidate>{reg&&<><label>Nama lengkap</label><input name="name" placeholder="Nama kamu" autoComplete="name"/></>}
<label>Email</label><input name="email" type="email" placeholder="nama@email.com" autoComplete="email"/><label>Password</label><input name="pw" type="password" placeholder="Minimal 6 karakter" autoComplete={reg?'new-password':'current-password'}/>
<Err e={err}/>{info&&<p className="info">{info}</p>}<button className="btn w100" disabled={busy}><Ic n="lock"/> {reg?'Daftar':'Masuk'}</button>{!reg&&<button type="button" className="lnk" onClick={forgot}>Lupa password?</button>}</form>
<p className="mut" style={{textAlign:'center',fontSize:13,marginTop:14}}>{reg?'Buat akun baru dengan email aktif. Kami akan mengirim link verifikasi.':'Gunakan email dan password yang sudah terdaftar.'}</p></div></main>}

export function Setup({profile}){
const [create,setCreate]=useState(true),[err,setErr]=useState(''),[busy,setBusy]=useState(false),uid=profile.id;
const submit=async e=>{e.preventDefault();const v=new FormData(e.currentTarget).get('v').trim();if(!v)return setErr(create?'Nama kelas wajib diisi.':'Kode kelas wajib diisi.');setErr('');setBusy(true);
try{if(create){let code,n=0;do{code=mkCode(v);n++}while(n<5&&!(await getDocs(query(collection(db,'classes'),where('code','==',code)))).empty);
const r=await addDoc(collection(db,'classes'),{name:v,code,admin:uid,createdAt:serverTimestamp()});await updateDoc(doc(db,'users',uid),{classId:r.id,role:'admin'})}
else{const q=await getDocs(query(collection(db,'classes'),where('code','==',v.toUpperCase())));if(q.empty){setErr('Kode kelas tidak ditemukan.');return setBusy(false)}await updateDoc(doc(db,'users',uid),{classId:q.docs[0].id,role:'member'})}}catch(x){setErr(fe(x));setBusy(false)}};
return<main className="center"><div className="top"><div className="pill"><div className="logo"><Ic n="cap"/></div><div><b>{profile.name}</b><small>{profile.email}</small></div></div><button className="ib" onClick={logout} aria-label="Keluar"><Ic n="out"/></button></div>
<div className="card xl" style={{padding:24}}><small className="lab">SETUP KELAS</small><h1 style={{fontSize:32,margin:'8px 0 12px',lineHeight:1.15}}>Pilih satu kelas untuk akun ini.</h1><p className="mut" style={{lineHeight:1.7}}>Akun Deadlineku dibuat untuk satu kelas supaya dashboard tidak campur dan role admin tetap jelas.</p>
<div className="tabs"><button className={create?'on':''} onClick={()=>setCreate(true)}>Buat kelas</button><button className={create?'':'on'} onClick={()=>setCreate(false)}>Join kelas</button></div>
<form key={create} onSubmit={submit}><label>{create?'Nama kelas':'Kode kelas'}</label><input name="v" placeholder={create?'Contoh: IF 2025 A':'Contoh: FTT-GH7L'}/><Err e={err}/><button className="btn w100" disabled={busy}><Ic n={create?'school':'users'}/> {create?'Buat kelas sebagai admin':'Join sebagai anggota'}</button></form></div></main>}

const LBL={done:['Selesai','done'],late:['Telat','late'],soon:['Mendesak','soon'],ok:['Aman','']};
const SL=[['belum','Belum','clip'],['proses','Proses','hour'],['selesai','Done','check']];
const DF={q:'',jenis:'all',st:'all',dl:'all',arc:'aktif'};
const remLabel=r=>(REM.find(x=>x[0]===r)||[])[1]||'Tanpa reminder';
const pay=f=>({title:f.title.trim(),course:f.course.trim(),desc:f.desc,deadline:new Date(f.deadline).toISOString(),jenis:f.jenis,reminder:f.reminder,link:f.link,ref:f.ref,note:f.note});
const bad=f=>!f.title.trim()||!f.course.trim()||!f.deadline?'Judul, mata kuliah, dan deadline wajib diisi.':'';
const share=async t=>{const text=`${t.title} (${t.course})\nDeadline: ${fmtFull(t.deadline)}`+(/^https?:\/\//.test(t.link||'')?`\nKumpulkan: ${t.link}`:'');
if(navigator.share){try{await navigator.share({title:t.title,text})}catch{}}else copy(text)};

function Modal({onClose,label,children}){
useEffect(()=>{const k=e=>e.key==='Escape'&&onClose(),o=document.body.style.overflow;document.addEventListener('keydown',k);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',k);document.body.style.overflow=o}},[onClose]);
return createPortal(<div className="mdl" onPointerDown={e=>e.target===e.currentTarget&&onClose()}><div className="mdl-c card xl" role="dialog" aria-modal="true" aria-label={label}>{children}</div></div>,document.body)}

function TaskForm({t,busy,err,onSubmit,onCancel,head,className,style,wide}){
const d=t?new Date(t.deadline):(()=>{const x=new Date(Date.now()+864e5);x.setMinutes(0);return x})();
const F=(l,n,ph,tag='input')=>{const T=tag;return<div><label>{l}</label><T name={n} placeholder={ph} defaultValue={t?.[n]||''}/></div>},W=({children})=>wide?<div className="pair">{children}</div>:<>{children}</>;
return<form className={className} style={style} onSubmit={onSubmit}>{head}
{F('Judul tugas','title','Contoh: Laporan basis data')}{F('Mata kuliah','course','Contoh: Pemrograman Web')}{F('Deskripsi','desc','Instruksi tugas yang jelas dan ringkas','textarea')}
<W><div><label>Deadline</label><input name="deadline" type="datetime-local" defaultValue={toLocalInput(d)}/></div>
<div><label>Jenis</label><Pick name="jenis" label="Jenis tugas" options={JENIS.map(j=>[j,j])} defaultValue={t?.jenis||'individu'}/></div></W>
<div><label>Reminder</label><Pick name="reminder" label="Reminder" options={REM} defaultValue={t?.reminder||'H-1'}/></div>
<W>{F('Link pengumpulan','link','https://...')}{F('Link referensi','ref','https://...')}</W>
{F('Catatan','note','Catatan tambahan dari ketua kelas','textarea')}
<Err e={err}/><div className="row" style={{marginTop:6}}><button type="button" className="btn ghost" style={{flex:1}} onClick={onCancel}><Ic n="x"/> Batal</button><button className="btn" style={{flex:1}} disabled={busy}><Ic n="save"/> Simpan</button></div></form>}

function EditTask({t,onClose}){
const [err,setErr]=useState(''),[busy,setBusy]=useState(false);
const submit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget)),v=bad(f);if(v)return setErr(v);setErr('');setBusy(true);
try{await updateDoc(doc(db,'tasks',t.id),pay(f));toast('Tugas diperbarui');onClose()}catch(x){setErr(fe(x));setBusy(false)}};
return<Modal onClose={onClose} label="Edit tugas"><TaskForm t={t} busy={busy} err={err} onSubmit={submit} onCancel={onClose} head={<div className="row sb nw"><div><small className="lab">EDIT TUGAS</small><h2 style={{fontSize:26,marginTop:4}}>Ubah tugas</h2></div><button type="button" className="ib" onClick={onClose} aria-label="Tutup"><Ic n="x"/></button></div>}/></Modal>}

function Detail({t,uid,onClose,profile,members,adm}){
const k=kind(t,uid),s=SL.find(x=>x[0]===stOf(t,uid)),Row=({a,b})=><div className="mem"><span className="mut">{a}</span><b style={{textAlign:'right',fontWeight:500}}>{b}</b></div>;
return<Modal onClose={onClose} label="Detail tugas"><div className="row sb nw"><div className="row"><span className={'tag ic '+LBL[k][1]}><Ic n="clock"/>{rel(t.deadline)}</span><span className="tag ic"><Ic n={s[2]}/>{s[1]}</span></div><button className="ib" onClick={onClose} aria-label="Tutup"><Ic n="x"/></button></div>
<h2 style={{fontSize:26,margin:'14px 0 6px',overflowWrap:'anywhere'}}>{t.title}</h2>{t.desc&&<p className="mut" style={{lineHeight:1.6,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{t.desc}</p>}
<div style={{marginTop:12}}><Row a="Mata kuliah" b={t.course}/><Row a="Jenis" b={t.jenis}/><Row a="Deadline" b={fmtFull(t.deadline)}/><Row a="Prioritas" b={LBL[k][0]}/><Row a="Reminder" b={remLabel(t.reminder)}/></div>
{t.note&&<div className="dash" style={{marginTop:14,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}><b style={{color:'var(--txt)'}}>Catatan</b><br/>{t.note}</div>}
<div className="row" style={{marginTop:16}}>{[['link','Link pengumpulan'],['ref','Link referensi']].map(([a,b])=>/^https?:\/\//.test(t[a]||'')&&<a key={a} className="btn ghost sm" href={t[a]} target="_blank" rel="noopener noreferrer"><Ic n="ext"/> {b}</a>)}<button className="btn ghost sm" onClick={()=>share(t)}><Ic n="send"/> Bagikan</button><a className="btn ghost sm" href={gcalUrl(t)} target="_blank" rel="noopener noreferrer"><Ic n="cal"/> Google Calendar</a></div>
<Progress t={t} members={members} adm={adm} full/><Attach t={t} adm={adm}/><Comments t={t} profile={profile}/></Modal>}

function TaskCard({t,uid,adm,profile,members}){
const [m,setM]=useState(null),k=kind(t,uid),cur=stOf(t,uid),h=hue(t.course);
const setSt=v=>updateDoc(doc(db,'tasks',t.id),{['status.'+uid]:v}).catch(x=>toast(fe(x)));
const del=async()=>{if(!confirm('Hapus tugas ini?'))return;try{const q=await getDocs(query(collection(db,'comments'),where('classId','==',t.classId),where('taskId','==',t.id)));await Promise.all(q.docs.map(d=>deleteDoc(d.ref)));await deleteDoc(doc(db,'tasks',t.id))}catch(x){toast(fe(x))}};
const arc=isArch(t),toggleArc=()=>updateDoc(doc(db,'tasks',t.id),{archived:!arc}).then(()=>toast(arc?'Tugas dipulihkan':'Tugas diarsipkan')).catch(x=>toast(fe(x)));
const s=SL.find(x=>x[0]===cur);
return<article className="card task">
<div className="row sb nw"><span className={'tag ic '+LBL[k][1]}><Ic n="clock"/>{rel(t.deadline)}</span><span className="bk" style={{background:`linear-gradient(135deg,hsl(${h} 75% 55%),hsl(${(h+45)%360} 70% 45%))`}}><Ic n="book"/></span></div>
<h3>{t.title}</h3>{t.desc&&<p className="desc">{t.desc}</p>}
<div className="row" style={{margin:'12px 0'}}><span className="tag">{t.course}</span><span className="tag">{t.jenis}</span>{arc&&<span className="tag">Arsip</span>}<span className={'tag ic '+(cur==='selesai'?'done':cur==='proses'?'soon':'')}><Ic n={s[2]}/>{s[1]}</span></div>
<div className="infos"><div><small>Deadline</small><b>{fmtFull(t.deadline)}</b></div><div><small>Prioritas</small><b>{LBL[k][0]}</b></div></div>
<Progress t={t} members={members}/>
<div className="seg" role="group" aria-label="Status tugas">{SL.map(([v,l,i])=><button key={v} className={cur===v?'on '+v:''} aria-pressed={cur===v} onClick={()=>cur!==v&&setSt(v)}><Ic n={i}/>{l}</button>)}</div>
<div className="acts"><button className="btn ghost" onClick={()=>setM('detail')}><Ic n="ext"/> Detail</button>
{adm&&<button className="ib" onClick={()=>setM('edit')} aria-label="Edit tugas"><Ic n="edit"/></button>}{adm&&<button className="ib" onClick={toggleArc} aria-label={arc?'Pulihkan dari arsip':'Arsipkan tugas'} title={arc?'Pulihkan':'Arsipkan'}><Ic n="archive"/></button>}<button className="ib" onClick={()=>share(t)} aria-label="Bagikan tugas"><Ic n="send"/></button>{adm&&<button className="ib del" onClick={del} aria-label="Hapus tugas"><Ic n="trash"/></button>}</div>
{m==='detail'&&<Detail t={t} uid={uid} adm={adm} profile={profile} members={members} onClose={()=>setM(null)}/>}{m==='edit'&&<EditTask t={t} onClose={()=>setM(null)}/>}</article>}

export function TaskList({tasks,uid,adm,F=DF,profile,members=[]}){
const q=F.q.toLowerCase(),now=Date.now();
const r=tasks.filter(t=>{const d=new Date(t.deadline),s=stOf(t,uid);return((F.arc==='arsip')===isArch(t))&&(!q||(t.title+t.course).toLowerCase().includes(q))&&(F.jenis==='all'||t.jenis===F.jenis)&&(F.st==='all'||s===F.st)&&(F.dl==='all'||(F.dl==='late'?d<now&&s!=='selesai':F.dl==='today'?d.toDateString()===new Date().toDateString():d-now<6048e5&&d>=now))}).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
if(!r.length)return<div className="card empty"><b>Tidak ada tugas</b><span className="mut">{F.arc==='arsip'?'Belum ada tugas yang diarsipkan. Tugas yang lewat deadline lebih dari 7 hari masuk arsip otomatis.':'Filter saat ini belum menemukan tugas yang cocok.'}</span></div>;
return<div className="list">{r.map(t=><TaskCard key={t.id} t={t} uid={uid} adm={adm} profile={profile} members={members}/>)}</div>}

export function Dash({tasks,uid,adm,profile,members}){
const [F,setF]=useState(DF),act=tasks.filter(t=>!isArch(t)),k=act.map(t=>kind(t,uid)),n=x=>k.filter(y=>y===x).length;
const S=[['TOTAL TUGAS',act.length,'list'],['MENDESAK',n('soon'),'clock'],['SELESAI',n('done'),'check'],['TELAT',n('late'),'alert']];
const O={jenis:[['all','Semua'],...JENIS.map(j=>[j,j[0].toUpperCase()+j.slice(1)])],st:[['all','Status'],['belum','Belum'],['proses','Proses'],['selesai','Selesai']],dl:[['all','Deadline'],['today','Hari ini'],['week','7 hari'],['late','Telat']]};
return<><div className="stats">{S.map(([l,v,i])=><div className="stat" key={l}><small>{l}</small><b>{v}</b><span className="ib"><Ic n={i}/></span></div>)}</div>
<div className="card" style={{borderRadius:28,padding:14}}><div className="srch"><Ic n="search"/><input placeholder="Cari tugas atau mata kuliah" value={F.q} onChange={e=>setF({...F,q:e.target.value})}/></div>
<div className="filters">{Object.entries(O).map(([key,o])=><div className="sel" key={key}><Ic n="filter"/><select value={F[key]} onChange={e=>setF({...F,[key]:e.target.value})}>{o.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>)}</div></div>
<div className="tabs" role="tablist"><button className={F.arc==='aktif'?'on':''} onClick={()=>setF({...F,arc:'aktif'})}>Aktif ({act.length})</button><button className={F.arc==='arsip'?'on':''} onClick={()=>setF({...F,arc:'arsip'})}>Arsip ({tasks.length-act.length})</button></div>
<TaskList tasks={tasks} uid={uid} adm={adm} F={F} profile={profile} members={members}/></>}

export function Cal({tasks,uid}){
const [cm,setCm]=useState(()=>new Date()),[sel,setSel]=useState(ymd(new Date())),y=cm.getFullYear(),m=cm.getMonth(),today=ymd(new Date());
const st=new Date(y,m,1-new Date(y,m,1).getDay()),cells=[...Array(42)].map((_,i)=>new Date(st.getFullYear(),st.getMonth(),st.getDate()+i));
const has=k=>tasks.some(t=>ymd(new Date(t.deadline))===k),list=tasks.filter(t=>ymd(new Date(t.deadline))===sel);
const go=d=>setCm(new Date(y,m+d,1));
return<><div className="card xl calc"><div className="row sb nw calh"><button className="ib big" onClick={()=>go(-1)} aria-label="Bulan sebelumnya"><Ic n="cl"/></button><h2>{cm.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</h2><button className="ib big" onClick={()=>go(1)} aria-label="Bulan berikutnya"><Ic n="cr"/></button></div>
<div className="cgrid">{['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=><span className="dw2" key={d}>{d}</span>)}
{cells.map(d=>{const k=ymd(d);return<button key={k} className={'cd'+(d.getMonth()!==m?' out':'')+(k===sel?' sel2':'')+(k===today?' today':'')} onClick={()=>setSel(k)}>{d.getDate()}{has(k)&&<i/>}</button>})}</div></div>
<button className="btn ghost w100 icsb" onClick={()=>{const l=tasks.filter(t=>!isArch(t)&&stOf(t,uid)!=='selesai');l.length?downloadIcs(l):toast('Tidak ada tugas aktif untuk diekspor')}}><Ic n="cal"/> Ekspor ke Google Calendar (.ics)</button>
<div className="card xl"><small className="lab">DEADLINE TANGGAL INI</small><h2 className="seld">{new Date(sel+'T00:00').toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</h2>
{list.length?list.map(t=><div className="mem" key={t.id}><span>{t.title}<br/><small className="mut">{t.course}</small></span><span className="calr"><span className="mut">{new Date(t.deadline).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span><a className="ib" href={gcalUrl(t)} target="_blank" rel="noopener noreferrer" aria-label="Tambah ke Google Calendar" title="Tambah ke Google Calendar"><Ic n="cal"/></a></span></div>):<div className="dash">Tidak ada deadline di tanggal ini.</div>}</div></>}

const permState=()=>!('Notification' in window)?['Tidak didukung','Browser ini belum mendukung notifikasi.']:Notification.permission==='granted'?['Sudah diizinkan','Reminder akan muncul sebagai notifikasi saat Deadlineku terbuka atau masih berjalan di latar belakang.']:Notification.permission==='denied'?['Diblokir','Buka pengaturan situs di browser, lalu izinkan Notifikasi untuk Deadlineku.']:['Belum diizinkan','Tekan Izinkan Notifikasi supaya reminder bisa muncul walau Deadlineku sedang tidak dibuka.'];
const wait=ms=>{const m=Math.ceil(ms/6e4);return m>=60?`${Math.floor(m/60)} jam ${m%60} menit`:`${m} menit`};
export function Notif({tasks,uid,logV,profile}){
const [p,setP]=useState(()=>getPrefs(uid)),[,bump]=useState(0),[sum,setSum]=useState(null),[busy,setBusy]=useState(false),[ps,pd]=permState(),now=Date.now(),adm=profile.role==='admin';
useEffect(()=>{const i=setInterval(()=>bump(x=>x+1),30000);return()=>clearInterval(i)},[]);
const upd=n=>{setP(n);lsSet('ct_prefs_'+uid,n)};
const near=tasks.filter(t=>stOf(t,uid)!=='selesai'&&new Date(t.deadline)>now&&new Date(t.deadline)-now<7*864e5),log=lsGet('ct_log_'+uid,[]);
const tog=async k=>{if(k==='push'&&!p.push&&!(await askPerm()))return bump(x=>x+1);upd({...p,[k]:!p[k]});bump(x=>x+1)};
const allow=async()=>{const ok=await askPerm();if(ok&&!p.push)upd({...p,push:true});bump(x=>x+1)};
const last=adm?0:(profile.lastDigest?.toMillis?.()||0),left=adm?0:Math.max(0,last+DIGEST_GAP-now);
const cek=async()=>{if(busy)return;const t0=Date.now();if(left>0)return toast('Bisa dipakai lagi dalam '+wait(left));
setBusy(true);
try{if(!adm){try{await updateDoc(doc(db,'users',uid),{lastDigest:serverTimestamp()})}catch(x){return toast(x.code==='permission-denied'?'Masih dalam jeda 3 jam. Coba lagi nanti.':fe(x))}}
const list=digestList(tasks,uid);setSum({t:t0,list});
if(!list.length){await notify(uid,'Deadlineku','Semua tugas sudah selesai. Mantap!',true,'Semua tugas sudah selesai','digest');return}
const line=t=>`${new Date(t.deadline)<t0?'⚠️ ':'• '}${t.title} — ${rel(t.deadline)}`,top=list.slice(0,5).map(line).join('\n')+(list.length>5?`\n+${list.length-5} tugas lain`:'');
if('Notification' in window&&Notification.permission==='default')await askPerm();
await notify(uid,`${list.length} tugas belum selesai`,top,true,`${list.length} tugas belum selesai, lihat daftar di bawah`,'digest');
const lg=lsGet('ct_log_'+uid,[]);lg.unshift({t:t0,m:`Cek tugas: ${list.length} belum selesai. Terdekat: ${list[0].title}`});lsSet('ct_log_'+uid,lg.slice(0,30));bump(x=>x+1)}finally{setBusy(false)}};
const Sw=({k,i,l,d})=><div className="pref"><span className="pi"><Ic n={i}/></span><div style={{flex:1}}><b>{l}</b>{d&&<small>{d}</small>}</div><button className={'sw'+(p[k]?' on':'')} role="switch" aria-checked={p[k]} aria-label={l} onClick={()=>tog(k)}/></div>;
const Row=({a,b})=><div className="mem"><span>{a}</span><span className="mut" style={{textAlign:'right'}}>{b}</span></div>;
return<><div className="col"><div className="card xl"><div className="row sb nw"><div><small className="lab">PREFERENSI</small><h2 style={{fontSize:30,marginTop:4}}>Reminder</h2></div><span style={{color:'#aef'}}><Ic n="ring"/></span></div>
<div className="g12" style={{marginTop:18}}><Sw k="push" i="phone" l="Push notification HP" d="Muncul di notifikasi HP setelah izin aktif."/><Sw k="h3" i="wand" l="Reminder H-3"/><Sw k="h1" i="wand" l="Reminder H-1"/></div>
<label style={{display:'block',marginTop:18}}>Jam sebelum deadline</label><input type="number" inputMode="numeric" min="0" max="168" placeholder="0 = nonaktif" value={p.hours} onChange={e=>upd({...p,hours:e.target.value===''?'':Math.min(168,Math.max(0,Math.floor(Number(e.target.value)||0)))})}/>
<p className="mut" style={{fontSize:14,lineHeight:1.6,marginTop:14}}>Pengaturan H-3, H-1, dan jam di atas hanya berlaku untuk akunmu sendiri. Reminder dari admin di setiap tugas tetap ikut berjalan.</p>
<button className="btn w100" style={{marginTop:14,opacity:left?.6:1}} disabled={busy} onClick={cek}><Ic n="vol"/> Cek tugas mepet</button>
<p className="mut" style={{fontSize:13,lineHeight:1.5,marginTop:8,textAlign:'center'}}>{adm?'Admin bisa memakai fitur ini tanpa batas.':left?`Bisa dipakai lagi dalam ${wait(left)}.`:'Setiap anggota bisa memakainya 1 kali tiap 3 jam.'}</p>
<button className="btn ghost w100" style={{marginTop:14}} onClick={allow}><Ic n="phone"/> Izinkan Notifikasi</button>
<div className="dash" style={{marginTop:14,borderStyle:'solid'}}><b style={{color:'#ffe9a8',display:'block',marginBottom:6}}>{ps}</b>{pd}</div></div>
{sum&&<div className="card xl"><h2 style={{fontSize:26,marginBottom:4}}>Tugas belum selesai</h2><small className="mut">Urut dari deadline tercepat · dicek {fmt(sum.t)}</small><div className="dg" style={{marginTop:10}}>{sum.list.length?sum.list.map((t,i)=><div className="mem" key={t.id}><span style={{display:'flex',alignItems:'flex-start'}}><i className="dg-n">{i+1}</i><span>{t.title}<small className="mut">{t.course} · {fmt(t.deadline)}</small></span></span><span className={'tag '+(new Date(t.deadline)<sum.t?'late':new Date(t.deadline)-sum.t<172800000?'soon':'')} style={{alignSelf:'flex-start',flex:'none'}}>{rel(t.deadline)}</span></div>):<div className="dash">Semua tugas sudah selesai. 🎉</div>}</div></div>}
<div className="card xl"><h2 style={{fontSize:26,marginBottom:12}}>Deadline dekat</h2>{near.length?near.map(t=><Row key={t.id} a={<>{t.title}<br/><small className="mut">{t.course}</small></>} b={fmt(t.deadline)}/>):<div className="dash">Tidak ada deadline dalam 7 hari.</div>}</div>
</div><div className="card xl" data-v={logV}><h2 className="row nw" style={{fontSize:26,marginBottom:12,gap:12}}><span style={{color:'#aef'}}><Ic n="send"/></span>Log notifikasi</h2>{log.length?log.map((l,i)=><Row key={i} a={l.m} b={fmt(l.t)}/>):<div className="dash">Belum ada log notifikasi untuk akun ini.</div>}</div></>}

export function Klas({klass:c,members,profile}){
const adm=profile.role==='admin',own=profile.id===c.admin,link=location.origin+location.pathname+'?class='+c.id,adms=members.filter(u=>u.role==='admin'),rest=members.filter(u=>u.role!=='admin');
const Box=({l,v,big})=><div className="dash"><small className="lab" style={{fontWeight:500}}>{l}</small><div className="row sb nw" style={{marginTop:8}}><b style={big?{fontSize:30,letterSpacing:'.02em',color:'var(--txt)'}:{fontSize:16,wordBreak:'break-all',lineHeight:1.5,color:'var(--txt)'}}>{v}</b><button className="ib" onClick={()=>copy(v)} aria-label="Salin"><Ic n="copy"/></button></div></div>;
const H=({i,t})=><h2 className="row nw" style={{fontSize:28,marginBottom:14,gap:12}}><span style={{color:'#aef'}}><Ic n={i}/></span>{t}</h2>;
const rename=async e=>{e.preventDefault();const n=new FormData(e.currentTarget).get('n').trim();if(n)try{await updateDoc(doc(db,'classes',c.id),{name:n});toast('Nama kelas disimpan')}catch(x){toast(fe(x))}};
const regen=()=>updateDoc(doc(db,'classes',c.id),{code:mkCode(c.name)}).then(()=>toast('Kode kelas diganti')).catch(x=>toast(fe(x)));
const [cf,setCf]=useState(null),[bz,setBz]=useState(false);
const CF={kick:{lab:'KELUARKAN ANGGOTA',h:'Yakin mau mengeluarkan?',ok:'Ya, keluarkan',danger:1,d:u=>`${u.name} akan dikeluarkan dari kelas ${c.name} dan harus join lagi dengan kode kelas.`,w:{classId:null,role:null},m:u=>u.name+' dikeluarkan dari kelas'},
promote:{lab:'JADIKAN ADMIN',h:'Yakin jadikan admin?',ok:'Ya, jadikan admin',d:u=>`${u.name} akan jadi admin: bisa menambah, mengubah, dan menghapus tugas, serta mengelola anggota.`,w:{role:'admin'},m:u=>u.name+' sekarang admin'},
demote:{lab:'TURUNKAN ADMIN',h:'Yakin turunkan jadi anggota?',ok:'Ya, turunkan',danger:1,d:u=>`${u.name} akan kembali jadi anggota biasa dan tidak bisa lagi mengelola tugas atau anggota.`,w:{role:'member'},m:u=>u.name+' sekarang anggota biasa'},
transfer:{lab:'PINDAHKAN KEPEMILIKAN',h:'Pindahkan kepemilikan kelas?',ok:'Ya, pindahkan',danger:1,d:u=>`${u.name} akan menjadi pembuat (pemilik) kelas ini. Kamu tetap admin, tapi bisa diturunkan olehnya. Tindakan ini tidak bisa kamu batalkan sendiri.`}};
const doCf=async()=>{if(!cf)return;const k=CF[cf.type];setBz(true);try{if(cf.type==='transfer')await updateDoc(doc(db,'classes',c.id),{admin:cf.u.id});else await updateDoc(doc(db,'users',cf.u.id),k.w);toast(cf.type==='transfer'?cf.u.name+' sekarang pemilik kelas':k.m(cf.u));setCf(null)}catch(x){toast(fe(x))}setBz(false)};
const leave=()=>own?toast('Pindahkan kepemilikan ke admin lain dulu.'):confirm(adm?'Kamu admin kelas ini. Keluar dari kelas?':'Keluar dari kelas ini?')&&updateDoc(doc(db,'users',profile.id),{classId:null,role:null}).catch(x=>toast(fe(x)));
return<><div className="card xl"><div className="row sb nw"><div><small className="lab">KELAS AKTIF</small><h2 style={{fontSize:34,marginTop:4}}>{c.name}</h2></div><span style={{color:'#aef'}}><Ic n="school"/></span></div>
<div className="g12" style={{marginTop:20,gap:14}}><Box l="KODE KELAS" v={c.code} big/><Box l="LINK KELAS" v={link}/></div>
{adm&&<form key={c.name} onSubmit={rename}><label>Nama kelas</label><input name="n" defaultValue={c.name}/><div className="row nw" style={{marginTop:14}}><button className="btn" style={{flex:1}}>Simpan</button><button type="button" className="btn ghost" style={{flex:1}} onClick={regen}><Ic n="refresh"/> Kode</button></div></form>}
<div style={{borderTop:'1px solid var(--line)',marginTop:24,paddingTop:20}}><b style={{color:'#ff9fb2',fontSize:18}}>Ganti Kelas Lain</b><p className="mut" style={{lineHeight:1.7,margin:'8px 0 14px'}}>Peringatan: Jika Anda ingin bergabung ke kelas teman Anda (Join Kelas), Anda harus keluar dari kelas yang aktif saat ini. Data pada kelas ini akan ditinggalkan.</p>{own&&<p className="info" style={{marginBottom:12}}>Kamu pembuat kelas. Pindahkan kepemilikan ke admin lain (tombol "Jadikan pemilik" di daftar admin) sebelum keluar.</p>}<button className="btn w100" disabled={own} style={{background:'#2a1a2e',borderColor:'rgba(255,120,150,.4)',opacity:own?.5:1}} onClick={leave}><Ic n="xc"/> Keluar &amp; Join Kelas Lain</button></div></div>
<div className="col"><div className="card xl"><H i="shield" t="Admin kelas"/>{adms.map(u=><div className="dash" style={{borderStyle:'solid'}} key={u.id}><b style={{fontSize:18,color:'var(--txt)'}}>{u.name}</b><div style={{margin:'6px 0 14px'}}>{u.email}</div><div className="row"><span className="tag">{u.id===c.admin?'pembuat kelas':'admin'}</span><span className="tag done">approved</span>{adm&&u.id!==profile.id&&u.id!==c.admin&&<button className="btn ghost sm" onClick={()=>setCf({type:'demote',u})}><Ic n="down"/> Turunkan</button>}{own&&u.id!==profile.id&&<button className="btn ghost sm" onClick={()=>setCf({type:'transfer',u})}><Ic n="crown"/> Jadikan pemilik</button>}</div></div>)}</div>
<div className="card xl"><H i="users" t="Anggota"/>{rest.length?rest.map(u=><div className="mem" key={u.id}><span>{u.name}<br/><small className="mut">{u.email}</small></span>{adm?<span className="ma"><button className="ib up" onClick={()=>setCf({type:'promote',u})} aria-label={'Jadikan '+u.name+' admin'} title="Jadikan admin"><Ic n="shield"/></button><button className="ib kick" onClick={()=>setCf({type:'kick',u})} aria-label={'Keluarkan '+u.name} title="Keluarkan dari kelas"><Ic n="xc"/></button></span>:<span className="tag done">approved</span>}</div>):<div className="dash">Belum ada data.</div>}</div></div>
{cf&&<Modal onClose={()=>!bz&&setCf(null)} label="Konfirmasi"><small className="lab">{CF[cf.type].lab}</small><h2 style={{fontSize:26,margin:'6px 0 10px'}}>{CF[cf.type].h}</h2><p className="mut" style={{lineHeight:1.6}}>{CF[cf.type].d(cf.u)}</p><div className="row cf nw"><button className="btn ghost" style={{flex:1}} disabled={bz} onClick={()=>setCf(null)}>Batal</button><button className={'btn'+(CF[cf.type].danger?' danger':'')} style={{flex:1}} disabled={bz} onClick={doCf}>{CF[cf.type].ok}</button></div></Modal>}</>}

export function Add({klass,uid,tasks,onDone,profile,members}){
const [err,setErr]=useState(''),[busy,setBusy]=useState(false);
const submit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget)),v=bad(f);if(v)return setErr(v);setErr('');setBusy(true);
try{await addDoc(collection(db,'tasks'),{...pay(f),classId:klass.id,status:{},createdBy:uid,createdAt:serverTimestamp()});toast('Tugas disimpan');onDone()}catch(x){setErr(fe(x));setBusy(false)}};
return<><TaskForm wide className="card" busy={busy} err={err} onSubmit={submit} onCancel={onDone} head={<><small className="lab">INPUT TUGAS</small><h2 style={{fontSize:30,marginTop:4}}>Tugas baru</h2></>}/>
<div className="card"><h2 style={{fontSize:28,marginBottom:14}}>Tugas kelas</h2><TaskList tasks={tasks} uid={uid} adm profile={profile} members={members}/></div></>}
