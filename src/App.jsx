import {useEffect,useRef,useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {doc,getDoc,setDoc,updateDoc,onSnapshot,collection,query,where,serverTimestamp} from 'firebase/firestore';
import {auth,db,OK} from './firebase';
import {Ic,Brand,useMedia,toast,checkReminders} from './lib';
import {Landing,Auth,Setup,Dash,Cal,Notif,Klas,Add,fe} from './pages';

const JOIN=new URLSearchParams(location.search).get('class');
const NAV=[['dash','Dashboard','home','Home'],['cal','Kalender','cal','Kalender'],['notif','Notifikasi','bell','Notif'],['class','Kelas','users','Kelas'],['add','Tambah Tugas','pc','Tambah']];
const Loading=()=><main className="center" style={{textAlign:'center',paddingTop:'30vh'}}><Brand sub={false}/><p className="mut" style={{marginTop:20}}>Memuat...</p></main>;

export default function App(){
const [ready,setReady]=useState(false),[uid,setUid]=useState(null),[profile,setProfile]=useState(null),[klass,setKlass]=useState(null),[members,setMembers]=useState([]),[tasks,setTasks]=useState([]);
const [view,setView]=useState(JOIN?'auth':'landing'),[tab,setTab]=useState('dash'),[logV,setLogV]=useState(0);
const pending=useRef(null),joined=useRef(false),mb=useMedia('(max-width:900px)');

useEffect(()=>{if(!OK){setReady(true);return}let un=()=>{};
const off=onAuthStateChanged(auth,async u=>{un();setUid(u?.uid||null);
if(!u){setProfile(null);setView(v=>v==='auth'?v:'landing');setReady(true);return}
const ref=doc(db,'users',u.uid);
try{if(!(await getDoc(ref)).exists())await setDoc(ref,{name:pending.current||u.displayName||u.email.split('@')[0],email:u.email,photo:u.photoURL||'',role:null,classId:null,createdAt:serverTimestamp()})}catch(x){toast(fe(x))}
pending.current=null;
un=onSnapshot(ref,async s=>{if(!s.exists())return;const p={id:s.id,...s.data()};
if(!p.classId&&JOIN&&!joined.current){joined.current=true;try{if((await getDoc(doc(db,'classes',JOIN))).exists()){await updateDoc(ref,{classId:JOIN,role:'member'});history.replaceState(null,'',location.pathname);return}}catch{toast('Link kelas tidak valid')}}
setProfile(p);setReady(true)},x=>{toast(fe(x));setReady(true)})});
return()=>{off();un()}},[]);

useEffect(()=>{const cid=profile?.classId;if(!cid){setKlass(null);setMembers([]);setTasks([]);setTab('dash');return}
const bad=x=>toast(fe(x)),u=[onSnapshot(doc(db,'classes',cid),s=>setKlass(s.exists()?{id:s.id,...s.data()}:null),bad),
onSnapshot(query(collection(db,'users'),where('classId','==',cid)),s=>setMembers(s.docs.map(d=>({id:d.id,...d.data()}))),bad),
onSnapshot(query(collection(db,'tasks'),where('classId','==',cid)),s=>setTasks(s.docs.map(d=>({id:d.id,...d.data()}))),bad)];
return()=>u.forEach(f=>f())},[profile?.classId]);

useEffect(()=>{if(!uid||!tasks.length)return;const run=()=>checkReminders(uid,tasks)&&setLogV(v=>v+1);run();const i=setInterval(run,60000);return()=>clearInterval(i)},[uid,tasks]);

if(!ready)return<Loading/>;
if(!OK)return<main className="center"><Brand/><div className="card" style={{marginTop:24}}><b>Firebase belum dikonfigurasi.</b><p className="mut" style={{marginTop:8,lineHeight:1.6}}>Salin <code>.env.example</code> menjadi <code>.env</code>, isi nilainya, lalu jalankan ulang.</p></div></main>;
if(uid&&!profile)return<Loading/>;
if(!profile)return view==='auth'?<Auth pending={pending}/>:<Landing onStart={()=>setView('auth')}/>;
if(!profile.classId)return<Setup profile={profile}/>;
if(!klass)return<Loading/>;

const adm=profile.role==='admin',nav=NAV.filter(n=>n[0]!=='add'||adm),T=Object.fromEntries(NAV.map(n=>[n[0],n[1]])),t2=adm||tab!=='add'?tab:'dash';
const out=()=>import('firebase/auth').then(m=>m.signOut(auth));
const page={dash:<Dash tasks={tasks} uid={uid} adm={adm}/>,cal:<Cal tasks={tasks}/>,notif:<Notif tasks={tasks} uid={uid} logV={logV}/>,class:<Klas klass={klass} members={members} profile={profile}/>,add:<Add klass={klass} uid={uid} tasks={tasks} onDone={()=>setTab('dash')}/>}[t2];
return<div className="shell">
<aside className="side"><Brand/><nav className="nav" style={{'--n':nav.length,'--i':Math.max(0,nav.findIndex(n=>n[0]===t2))}}><span className="ind" aria-hidden="true"/>{nav.map(n=><button key={n[0]} className={t2===n[0]?'on':''} onClick={()=>setTab(n[0])}><Ic n={n[2]}/>{n[1]}</button>)}</nav>
<div className="who"><small>{adm?'ADMIN KELAS':'ANGGOTA'}</small><b>{profile.name}</b><span>{profile.email}</span><button className="btn ghost" onClick={out}><Ic n="out"/> Keluar</button></div></aside>
<div className="main"><header className="head">{mb?<div className="tl"><div className="logo"><Ic n="cap"/></div><div><h1>Deadline<span className="ac">ku</span></h1><small>Kelas: {klass.name}</small></div></div>:<div><small>KELAS: {klass.name}</small><h1>{T[t2]}</h1></div>}
<div className="r">{mb?<button className="ib" onClick={out} aria-label="Keluar"><Ic n="out"/></button>:<span className="code" title="Kode kelas">{klass.code}</span>}
{adm&&(mb?<button className="ib pl" onClick={()=>setTab('add')} aria-label="Tambah tugas"><Ic n="plus"/></button>:<button className="btn" onClick={()=>setTab('add')}><Ic n="plus"/> Tugas</button>)}</div></header>
<div className="page">{page}</div></div>
<nav className="bar" style={{'--n':nav.length,'--i':Math.max(0,nav.findIndex(n=>n[0]===t2))}}><span className="ind" aria-hidden="true"/>{nav.map(n=><button key={n[0]} className={t2===n[0]?'on':''} onClick={()=>setTab(n[0])}><Ic n={n[2]}/>{n[3]}</button>)}</nav></div>}
