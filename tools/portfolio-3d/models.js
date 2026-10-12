import * as T from './node_modules/three/build/three.module.js';

const COLORS={navy:0x071827,black:0x06121f,blue:0x0866f5,cyan:0x00c7e8,white:0xf5f8fc,grey:0x71849a,line:0x8a9eb3};
const mats={};for(const[k,v]of Object.entries(COLORS))mats[k]=new T.MeshStandardMaterial({color:v,roughness:.7,metalness:.08});
function solid(parent,geometry,name,xyz){const o=new T.Mesh(geometry,mats[name]);o.position.set(...xyz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(g,x,y,z,w,h,d,name='white'){return solid(g,new T.BoxGeometry(w,h,d),name,[x,y,z]);}
function label(g,s,x,y,z,w=2,color='#F5F8FC',flat=false,font=80){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.font=`600 ${font}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,512,128);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const p=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));p.position.set(x,y,z);if(flat)p.rotation.x=-Math.PI/2;g.add(p);return p;
}
function route(g,pts,color='blue',radius=.025,dash=false,arrow=true){
  const vec=pts.map(p=>new T.Vector3(...p));
  if(dash){const geo=new T.BufferGeometry().setFromPoints(vec);const o=new T.Line(geo,new T.LineDashedMaterial({color:COLORS[color],dashSize:.11,gapSize:.08}));o.computeLineDistances();g.add(o);return;}
  const curve=new T.CatmullRomCurve3(vec,false,'centripetal');solid(g,new T.TubeGeometry(curve,80,radius,8,false),color,[0,0,0]);
  if(arrow){const end=vec.at(-1),dir=end.clone().sub(curve.getPoint(.97)).normalize();const o=solid(g,new T.ConeGeometry(radius*3.1,radius*7,12),color,[end.x,end.y,end.z]);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);}
}
function chip(g,name,x,z,{w=1.7,d=1.0,h=.2,y=0,color='navy',flat=true}={}){
  box(g,x,y+h/2,z,w,h,d,color);label(g,name,x,y+h+.017,z,w*.9,color==='white'?'#071827':'#F5F8FC',flat,85);return {x,z,y:y+h};
}
function ribbon(g,pts,width=.23,color='blue'){
  const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'centripetal'),verts=[],ids=[];
  for(let i=0;i<=90;i++){
    const t=i/90,p=curve.getPoint(t),dir=curve.getTangent(t),side=new T.Vector3(-dir.z,0,dir.x).normalize().multiplyScalar(width/2);
    for(const k of [-1,1])verts.push(p.x+side.x*k,p.y,p.z+side.z*k);
    if(i<90){let a=2*i;ids.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setIndex(ids);geometry.computeVertexNormals();
  const material=mats[color].clone();material.side=T.DoubleSide;const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
}
function sourceStrips(g,x,z,color='white',count=4,y=.12){
  for(let i=0;i<count;i++){
    box(g,x+.045*i,y+i*.095,z-.08*i,1.35,.045,.33,color);
    box(g,x+.045*i,y+.029+i*.095,z-.08*i,.88,.006,.025,color==='white'?'blue':'cyan');
  }
}

// Heights derive only from real file-line counts at the inspected CodeForge revision.
export const sourceCounts={'main.py':962,'scanner.py':1119,'embedding.py':78,'rag.py':39};
function codeforge(g){
  const data=[['main.py',-3.9,1.35],['scanner.py',-3.9,-1.3],['embedding.py',-1.95,1.35],['rag.py',-1.95,-1.3]];
  for(const[name,x,z]of data){
    const height=.5+2.35*Math.sqrt(sourceCounts[name]/1119);
    box(g,x,height/2,z,1.65,height,1.9,name==='rag.py'?'blue':'navy');
    // Engraved source strata run down the file volume; no fabricated code.
    for(let i=0;i<6;i++)box(g,x,height-.5-i*(height-.6)/6,z+1.01,1.2,.018,.014,'grey');
    label(g,name,x,height-.16,z+1.014,1.47,'#F5F8FC',false,80);
    route(g,[[x+.84,.2,z],[x+1.12,.18,z],[.15,.18,z]],'grey',.017,false,false);
  }
  chip(g,'backend/',-4.8,0,{w:1.4,d:5.9,h:.14,color:'black'});
  label(g,'backend/',-4.8,.18,2.52,1.4,'#F5F8FC',true,90);
  sourceStrips(g,.15,1.35);sourceStrips(g,.15,-1.3);
  label(g,'source chunks',.15,.7,2.08,1.9,'#71849A',false);
  // Retrieval is a pair of distinct result paths; rank fusion is their confluence.
  ribbon(g,[[.95,.24,-1.3],[1.7,.34,-1.5],[2.3,.6,-1.1],[3.15,.75,0]],.35,'blue');
  ribbon(g,[[.95,.24,1.35],[1.7,.34,1.65],[2.3,.6,1.12],[3.15,.75,0]],.24,'cyan');
  chip(g,'vector',1.7,-2.35,{w:1.3,d:.75,h:.13,color:'blue'});
  chip(g,'lexical',1.7,2.45,{w:1.45,d:.75,h:.13,color:'navy'});
  sourceStrips(g,3.65,0,'white',5,.75);
  label(g,'rank fusion',3.65,1.43,.54,1.85,'#F5F8FC');
  label(g,'source evidence',3.65,.5,1.08,2.1,'#71849A');
  ribbon(g,[[4.4,.9,0],[4.95,.8,0],[5.45,.8,0]],.25,'blue');
  const answer=solid(g,new T.CylinderGeometry(.78,.78,.14,64),'blue',[5.6,.78,0]);
  label(g,'answer',5.6,.862,0,1.48,'#F5F8FC',true,92);
  route(g,[[5.6,.13,1],[5.6,.13,3.6],[.1,.13,3.6],[-3.85,.13,3.6],[-3.85,.2,2.38]],'cyan',.018,true);
  label(g,'commit / file / lines',1.4,.27,3.69,3.3,'#71849A',true,88);
}

// Curved, bound document pages are unique to the evidence workflow.
function bookPage(g,offset){
  const verts=[],ids=[],nx=26,nz=30;
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
    const u=(i/nx)*2-1,z=(j/nz)*4.2-2.1;
    const x=u*3.2,y=.52+offset+Math.pow(Math.abs(u),1.5)*.45+Math.exp(-Math.abs(u)*5)*.18;
    verts.push(x,y,z);
    if(i<nx&&j<nz){let a=i*(nz+1)+j;ids.push(a,a+1,a+nz+1,a+1,a+nz+2,a+nz+1);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();
  const material=mats.white.clone();material.side=T.DoubleSide;const o=new T.Mesh(geo,material);o.castShadow=true;o.receiveShadow=true;g.add(o);
}
function vericore(g){
  const book=new T.Group();book.position.set(-2.9,0,.3);book.rotation.y=-.12;g.add(book);
  box(book,0,.11,0,6.75,.13,4.6,'navy');
  for(let i=0;i<7;i++)bookPage(book,i*.048);
  // Bound layers are parsed documents and page-aware passages, not OCR hardware.
  for(const side of [-1,1])for(let i=0;i<8;i++){
    const x=side*1.8,z=-1.3+i*.35,y=.52+.048*6+Math.pow(Math.abs(x/3.2),1.5)*.45+Math.exp(-Math.abs(x/3.2)*5)*.18+.015;
    box(book,x,y,z,2.05,.015,.026,i===2?'blue':'line');
    if(i===2)box(book,x,y+.012,z,1.5,.009,.16,'cyan');
  }
  label(book,'PDF / TXT',-1.8,1.0,-1.72,2.0,'#071827',true);
  label(book,'page / section',1.8,1.0,-1.72,2.0,'#071827',true);
  // Evidence strips are lifted from a highlighted passage on the right leaf.
  for(let i=0;i<3;i++){
    const x=.4+i*.65,y=1.1+i*.45,z=-.35-i*.3;
    box(g,x,y,z,1.65,.075,.35,'white');box(g,x,y+.05,z,1.15,.012,.06,'blue');
    route(g,[[-1.0,1,.2],[x-.8,y,.1],[x,y,z]],'cyan',.018,false,false);
  }
  label(g,'retrieved passages',1.15,2.52,-1.25,3.0,'#071827',false);
  // ChromaDB is a persisted passage collection, represented as nested index slices.
  for(let i=0;i<4;i++)chip(g,i===3?'ChromaDB':'',2.65,-1.4,{w:2.35,d:1.3,h:.12,y:.15+i*.16,color:i===3?'navy':'white'});
  route(g,[[1.8,2.03,-.9],[2.2,1.2,-1.2],[2.65,.92,-1.4]],'blue',.023);
  chip(g,'relevance gate',3.6,1.15,{w:2.15,d:1.0,h:.2,y:.16,color:'blue'});
  ribbon(g,[[2.65,.8,-.64],[2.65,.4,.1],[3.6,.4,.64]],.14,'blue');
  label(g,'cosine + coverage',3.6,.4,2.04,2.5,'#71849A',true);
  // Supported evidence is a populated excerpt; unsupported output stays blank.
  chip(g,'answer + sources',6.2,-.9,{w:2.6,d:2.0,h:.13,y:.15,color:'navy'});
  sourceStrips(g,6.2,-.82,'white',3,.37);
  label(g,'answer + sources',6.2,.31,-.17,2.4,'#F5F8FC',true);
  chip(g,'NOT_FOUND',6.2,2.6,{w:2.6,d:1.7,h:.12,y:.15,color:'white'});
  label(g,'No evidence · no LLM',6.2,.33,3.86,2.7,'#71849A',true,88);
  route(g,[[4.35,.43,.81],[5,.2,-.65],[5.3,.23,-.65]],'blue',.024);
  route(g,[[4.35,.43,1.5],[4.9,.21,2.55],[5.3,.23,2.55]],'grey',.02,true);
  route(g,[[6.2,.12,-2.0],[6.2,.12,-3.1],[.4,.12,-3.1],[.4,1.1,-.35]],'cyan',.02,true);
}

function node(g,s,x,z,r=.85,color='navy',height=.3){
  const o=solid(g,new T.CylinderGeometry(r,r,height,6),'navy',[x,height/2,z]);
  o.material=mats[color];label(g,s,x,height+.02,z,r*1.8,color==='white'?'#071827':'#F5F8FC',true,s.length>10?68:82);
}
function intervexa(g){
  // Each directed import edge is present in intelligence.py's actual source.
  node(g,'intelligence.py',-2.65,0,1.5,'white',.65);
  const files=[['github.py',-5.35,-2.4],['config.py',-2.1,-3.0],['db.py',.45,-1.8],['models.py',.55,1.3],['providers.py',-2.1,3.1],['security.py',-5.25,2.1]];
  for(const[s,x,z]of files){
    node(g,s,x,z,.92,'navy',.36);
    const dx=x+2.65,dz=z,n=Math.hypot(dx,dz);route(g,[[-2.65+dx/n*1.25,.7,dz/n*1.25],[-2.65+dx*.58,.55,dz*.58],[x-dx/n*.95,.4,z-dz/n*.95]],'blue',.022);
  }
  // A declaration edge has its own geometry, distinct from imports.
  solid(g,new T.CylinderGeometry(.53,.53,.2,48),'cyan',[-2.65,.15,-1.8]);label(g,'graph()',-2.65,.263,-1.8,1.12,'#071827',true,93);
  route(g,[[-2.65,.7,-1.2],[-2.65,.45,-1.4],[-2.65,.27,-1.51]],'cyan',.018);
  label(g,'imports',-5.1,.55,3.57,1.5,'#71849A',true,90);
  label(g,'declares',-3.35,.35,-1.8,1.15,'#71849A',true,76);
  // Revision branches are selected PR concepts, not recorded PRs or proven defects.
  const branches=[['PR A',1.75,-3.0,'blue'],['PR B',1.75,3.0,'cyan']];
  for(const[s,x,z,col]of branches){
    node(g,s,x,z,.68,col,.32);
    ribbon(g,[[2.4,.33,z],[3.1,.37,z],[3.8,.56,z*.65],[4.85,.8,0]],.2,col);
    chip(g,col==='blue'?'signature':'response keys',3.15,z,{w:1.95,d:.72,h:.12,y:.35,color:'navy'});
  }
  const finding=solid(g,new T.CylinderGeometry(1.12,1.12,.32,8),'white',[5.5,.75,0]);
  label(g,'advisory',5.5,.94,-.18,1.95,'#071827',true,86);
  label(g,'source refs',5.5,.94,.38,1.85,'#0866F5',true,88);
  route(g,[[-1.4,.1,.1],[.6,.1,.1],[1,.1,0],[4.32,.75,0]],'grey',.02,true);
  label(g,'selected revisions',2.0,.32,4.1,2.7,'#71849A',true,83);
}

export async function draw(canvas,kind,{small=false}={}){
  const isDark=kind!=='vericore',scene=new T.Scene();scene.background=new T.Color(isDark?'#06121F':'#F5F8FC');
  const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.setPixelRatio(2);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const aspect=canvas.clientWidth/canvas.clientHeight,view=small?6.35:5.25;
  const camera=new T.OrthographicCamera(-view*aspect,view*aspect,view,-view,.1,100);
  const cfg={codeforge:[10,10,16,0.7,1.0,0],vericore:[9,12,17,.4,1,0],intervexa:[10,18,14,.2,.4,0]}[kind];
  camera.position.set(...cfg.slice(0,3));camera.lookAt(...cfg.slice(3));
  scene.add(new T.HemisphereLight(0xffffff,isDark?0x71849a:0xdce5ed,1.75));
  const light=new T.DirectionalLight(0xffffff,2.05);light.position.set(-6,14,8);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-17,right:17,top:14,bottom:-14});light.shadow.normalBias=.025;scene.add(light);
  const g=new T.Group();scene.add(g);({codeforge,vericore,intervexa})[kind](g);
  const ground=new T.Mesh(new T.PlaneGeometry(120,120),new T.ShadowMaterial({opacity:isDark?.22:.1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
  renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
}
