import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {sourceCounts} from './models.js';
import {fitOrtho} from './fit.js';

// Exploded view of the retrieval-grounded systems behind the featured projects:
// storage, retrieval, generation and interface. File-block heights follow the
// CodeForge line counts in models.js; everything else is schematic.
const THEMES={
  dark:{slab:0x1a2d47,block:0x0b1726,alt:0x1c2f49,white:0xf5f8fc,blue:0x0866f5,cyan:0x00c7e8,grey:0x71849a,
    ink:'#F5F8FC',muted:'#8A9EB3',hemi:[0xdbe7ff,0x0b1626,1.7],sun:2.3,floor:.32,
    ui:{bg:'#0a1828',line:'#22395a',text:'#c9d6e6',muted:'#71849a',bubble:'#0866f5',chip:'#00c7e8'}},
  light:{slab:0xf8fafd,block:0x0d1b2c,alt:0xdfe7f1,white:0xffffff,blue:0x0866f5,cyan:0x00b4d8,grey:0x8a9eb3,
    ink:'#F5F8FC',muted:'#526B82',hemi:[0xffffff,0x9fb0c4,2.3],sun:1.65,floor:.06,
    ui:{bg:'#ffffff',line:'#d4dfe9',text:'#1b2a3d',muted:'#71849a',bubble:'#0866f5',chip:'#0866f5'}},
};
const SLAB=4.4,HALF=SLAB/2,THICK=.3,GAP=1.85,COLUMN=[1.55,1.55];

function make(theme){
  const c=THEMES[theme],cache={};
  const mat=(color,opts={})=>new T.MeshStandardMaterial({color,roughness:.62,metalness:.08,...opts});
  const m={slab:mat(c.slab),block:mat(c.block),alt:mat(c.alt),white:mat(c.white),grey:mat(c.grey),
    blue:mat(c.blue,{emissive:c.blue,emissiveIntensity:.18}),cyan:mat(c.cyan,{emissive:c.cyan,emissiveIntensity:.15})};
  const add=(g,geo,material,x,y,z)=>{const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
  const rbox=(g,x,y,z,w,h,d,material,r=.04)=>add(g,new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/2-.001,w/2,d/2)),material,x,y+h/2,z);
  function label(g,text,x,y,z,w,{color=c.ink,font=84,weight=600,family='Consolas,ui-monospace,monospace',flat=false,rotY=0}={}){
    const key=[text,color,font,weight].join('|');
    if(!cache[key]){const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');
      ctx.font=`${weight} ${font}px ${family}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,512,132);
      const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;cache[key]=tex;}
    const p=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:cache[key],transparent:true,depthWrite:false}));
    p.position.set(x,y,z);if(flat)p.rotation.x=-Math.PI/2;if(rotY)p.rotation.y=rotY;g.add(p);return p;
  }
  return {c,m,add,rbox,label};
}

function ribbon(k,g,pts,width,material,y){
  const curve=new T.CatmullRomCurve3(pts.map(([x,z])=>new T.Vector3(x,y,z)),false,'centripetal'),verts=[],ids=[],n=90;
  for(let i=0;i<=n;i++){const p=curve.getPoint(i/n),d=curve.getTangent(i/n),s=new T.Vector3(-d.z,0,d.x).normalize().multiplyScalar(width/2);
    verts.push(p.x-s.x,p.y,p.z-s.z,p.x+s.x,p.y,p.z+s.z);if(i<n){const a=2*i;ids.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();
  const mt=material.clone();mt.side=T.DoubleSide;const o=new T.Mesh(geo,mt);o.receiveShadow=true;g.add(o);
}

function interfaceTexture(c){
  const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d'),u=c.ui;
  const rr=(px,py,w,h,r,fill,stroke,lw=4)=>{x.beginPath();x.roundRect(px,py,w,h,r);if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.lineWidth=lw;x.strokeStyle=stroke;x.stroke();}};
  x.fillStyle=u.bg;x.fillRect(0,0,1024,1024);
  rr(28,28,968,968,26,null,u.line,5);x.fillStyle=u.line;x.fillRect(28,130,968,4);
  [u.muted,u.muted,u.chip].forEach((col,i)=>{x.beginPath();x.arc(84+i*40,80,11,0,7);x.fillStyle=col;x.fill();});
  x.font='600 30px Consolas,monospace';x.fillStyle=u.muted;x.textAlign='right';x.fillText('codeforage-ai @ 62d8979',950,91);
  x.textAlign='left';rr(360,182,594,92,46,u.bubble);x.font='600 33px Segoe UI,Arial,sans-serif';x.fillStyle='#ffffff';
  x.fillText('How are search results merged?',398,239);
  rr(70,322,820,372,26,null,u.line,4);x.fillStyle=u.text;x.font='600 34px Segoe UI,Arial,sans-serif';
  x.fillText('Reciprocal-rank fusion of the vector',108,388);x.fillText('and lexical result lists.',108,434);
  [[108,500,620],[108,546,520],[108,592,580]].forEach(([px,py,w])=>rr(px,py,w,16,8,u.line));
  rr(108,628,170,46,23,null,u.chip,4);rr(296,628,200,46,23,null,u.line,4);
  x.font='600 26px Consolas,monospace';x.fillStyle=u.chip;x.fillText('rag.py',146,660);x.fillStyle=u.muted;x.fillText('main.py',336,660);
  rr(70,800,884,104,52,null,u.line,4);x.fillStyle=u.chip;x.fillRect(112,826,6,52);
  x.fillStyle=u.muted;x.font='500 32px Segoe UI,Arial,sans-serif';x.fillText('Ask about this repository',140,864);
  rr(860,812,80,80,40,u.bubble);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;return tex;
}

export async function drawProfile(canvas,{theme='dark',target}){
  const k=make(theme),{c,m,add,rbox,label}=k;
  const scene=new T.Scene(),g=new T.Group();scene.add(g);
  const anchors=[];
  const ys=[0,GAP,2*GAP,3*GAP];
  const [cx,cz]=COLUMN;

  // 01 Storage: source files and two indexes.
  rbox(g,0,ys[0],0,SLAB,THICK,SLAB,m.slab,.06);
  label(g,'01',-HALF+.42,ys[0]+THICK/2,HALF+.006,.62,{color:c.muted,font:110,weight:700});
  let top=THICK;
  const files=Object.entries(sourceCounts).sort((a,b)=>b[1]-a[1]);
  files.forEach(([name,lines],i)=>{
    const h=.25+.7*Math.sqrt(lines/1119),x=-1.62+i*.8;
    rbox(g,x,top,1.82,.62,h,.5,name==='rag.py'?m.blue:m.block,.035);
    for(let s=0;s<3;s++)add(g,new T.BoxGeometry(.4-.1*(s%2),.014,.012),m.grey,x,top+h-.16-s*.07,2.075);
    label(g,name,x,top+.11,2.076,.6,{color:c.ink,font:76});
  });
  for(const z of [-1.45,-.55]){
    for(let s=0;s<3;s++){
      add(g,new T.CylinderGeometry(.3,.3,.15,48),m.alt,1.75,top+.08+s*.18,z);
      const rim=add(g,new T.TorusGeometry(.3,.012,8,48),m.cyan,1.75,top+.155+s*.18,z);rim.rotation.x=Math.PI/2;
    }
  }
  label(g,'PostgreSQL',1.75,top+.012,-1.45+.52,.86,{color:c.muted,font:72,flat:true,rotY:0});
  label(g,'ChromaDB',1.75,top+.012,-.55+.5,.8,{color:c.muted,font:72,flat:true});

  // 02 Retrieval: two result lists converge in rank fusion.
  rbox(g,0,ys[1],0,SLAB,THICK,SLAB,m.slab,.06);
  label(g,'02',-HALF+.42,ys[1]+THICK/2,HALF+.006,.62,{color:c.muted,font:110,weight:700});
  top=ys[1]+THICK;
  ribbon(k,g,[[-1.85,1.15],[-.9,1.8],[.25,1.35],[1.1,1.75],[cx,cz]],.26,m.blue,top+.012);
  ribbon(k,g,[[1.15,-1.85],[1.8,-.9],[1.35,.25],[1.75,1.1],[cx,cz]],.18,m.cyan,top+.016);
  rbox(g,-1.85,top,1.15,.78,.1,.5,m.blue,.03);label(g,'vector',-1.85,top+.106,1.15,.72,{color:'#FFFFFF',font:96,flat:true});
  rbox(g,1.15,top,-1.85,.5,.1,.78,m.block,.03);
  label(g,'lexical',1.15,top+.106,-1.85,.72,{color:'#FFFFFF',font:96,flat:true}).rotation.z=Math.PI/2;
  add(g,new T.CylinderGeometry(.36,.36,.14,48),m.white,cx,top+.07,cz);
  label(g,'RRF',cx,top+.142,cz,.62,{color:'#0866F5',font:110,weight:700,flat:true});

  // 03 Generation: evidence passes a gate before the model is called.
  rbox(g,0,ys[2],0,SLAB,THICK,SLAB,m.slab,.06);
  label(g,'03',-HALF+.42,ys[2]+THICK/2,HALF+.006,.62,{color:c.muted,font:110,weight:700});
  top=ys[2]+THICK;
  [-1.85,-1.5,-1.15].forEach((x,i)=>rbox(g,x,top,1.75,.22,.22,.22,i===1?m.white:m.cyan,.03));
  for(const x of [-.72,-.18])rbox(g,x,top,1.75,.1,.62,.1,m.block,.02);
  rbox(g,-.45,top+.62,1.75,.66,.09,.12,m.cyan,.02);
  label(g,'evidence gate',-.95,top+.012,1.32,1.15,{color:c.muted,font:72,flat:true});
  const hex=add(g,new T.CylinderGeometry(.62,.62,.38,6),m.blue,cx-.05,top+.19,cz-.05);hex.rotation.y=Math.PI/6;
  label(g,'LLM',cx-.05,top+.385,cz-.05,.82,{color:'#FFFFFF',font:120,weight:700,flat:true});
  rbox(g,1.72,top,-1.25,.62,.08,.95,m.white,.03);
  label(g,'NOT_FOUND',1.72,top+.084,-1.25,.86,{color:'#526B82',font:74,flat:true}).rotation.z=Math.PI/2;

  // 04 Interface: an answer that carries its citations.
  const uiTex=interfaceTexture(c);
  const faces=Array.from({length:6},(_,i)=>i===2?new T.MeshStandardMaterial({map:uiTex,roughness:.75,metalness:0}):m.slab);
  const ui=new T.Mesh(new T.BoxGeometry(SLAB,.18,SLAB),faces);ui.position.set(0,ys[3]+.09,0);ui.castShadow=ui.receiveShadow=true;g.add(ui);
  label(g,'04',-HALF+.42,ys[3]+.09,HALF+.006,.5,{color:c.muted,font:110,weight:700});

  // The request path runs through every layer.
  add(g,new T.CylinderGeometry(.045,.045,ys[3]-THICK,16),m.blue,cx,THICK+(ys[3]-THICK)/2,cz);
  for(const y of [THICK,ys[1]+THICK,ys[2]+THICK+.38]){const ring=add(g,new T.TorusGeometry(.13,.03,10,40),m.blue,cx,y+.02,cz);ring.rotation.x=Math.PI/2;}

  for(let i=0;i<4;i++)anchors.push(new T.Vector3(HALF,ys[i]+(i===3?.09:THICK/2),-HALF));

  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=theme==='light'?1.22:1.05;

  scene.add(new T.HemisphereLight(...c.hemi));
  const sun=new T.DirectionalLight(0xffffff,c.sun);sun.position.set(3.5,14,9);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
  Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:40});sun.shadow.normalBias=.02;sun.shadow.radius=4;scene.add(sun);
  const rim=new T.DirectionalLight(0x9cc0ff,.55);rim.position.set(9,4,-6);scene.add(rim);
  const floor=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:c.floor}));floor.rotation.x=-Math.PI/2;floor.position.y=-.001;floor.receiveShadow=true;scene.add(floor);

  const W=canvas.clientWidth,H=canvas.clientHeight,camera=new T.OrthographicCamera();
  fitOrtho(camera,g,new T.Vector3(10,8.6-ys[3]/2,10),new T.Vector3(0,ys[3]/2,0),W,H,target);
  renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
  return anchors.map(a=>{const p=a.clone().project(camera);return {x:(p.x+1)/2*W,y:(1-p.y)/2*H};});
}
