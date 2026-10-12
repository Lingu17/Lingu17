import * as THREE from './node_modules/three/build/three.module.js';

// All geometry is semantic: file leaves, source chunks, retrieval routes,
// document passages, revision paths or source references. No random props.
const C={navy:0x071827,blue:0x0866f5,cyan:0x00c7e8,paper:0xffffff,gray:0x71849a,line:0xb9c9d8};
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.88,metalness:0});
const materials=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,mat(v)]));
function mesh(g,m,parent,pos){const o=new THREE.Mesh(g,m);if(pos)o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,x,y,z,w,h,d,m='paper'){return mesh(new THREE.BoxGeometry(w,h,d),materials[m],parent,[x,y,z]);}
function type(parent,s,x,y,z,w=1.6,size=90,color='#071827',bg=null){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
  const cx=canvas.getContext('2d');if(bg){cx.fillStyle=bg;cx.fillRect(0,0,1024,256);}
  cx.font=`600 ${size}px "Arial", sans-serif`;cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=color;cx.fillText(s,512,128);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),material);plane.position.set(x,y,z);parent.add(plane);return plane;
}
function page(parent,label,x,z,opts={}){
  const {width=1.7,height=2.15,angle=-0.13,base=0.09,selected=true,lines=7}=opts;
  const g=new THREE.Group();g.position.set(x,base+height/2,z);g.rotation.x=angle;parent.add(g);
  box(g,0,0,0,width,height,.065);
  box(g,0,0,-.05,width+.025,height+.025,.035,'line');
  type(g,label,0,height*.34,.041,width*.9,80);
  for(let i=0;i<lines;i++){
    const length=width*(.72-(i%3)*.07);
    box(g,-width*.04,-height*.02-i*.16,.041,length,.023,.013,selected&&i===1?'blue':'line');
  }
  if(selected)box(g,0,height*.48,.045,width*.89,.022,.018,'blue');
  return g;
}
function folder(parent,label,x,z,y=1.75){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  box(g,0,0,0,2.35,.72,.12,'navy');box(g,-.69,.43,0,.95,.2,.12,'navy');
  type(g,label,0,0,.071,2.1,81,'#F5F8FC');return g;
}
function route(parent,points,color='blue',dash=false){
  const vectors=points.map(p=>new THREE.Vector3(...p));
  if(dash){const geo=new THREE.BufferGeometry().setFromPoints(vectors);const m=new THREE.LineDashedMaterial({color:C[color],dashSize:.1,gapSize:.08});const line=new THREE.Line(geo,m);line.computeLineDistances();parent.add(line);return;}
  const curve=new THREE.CatmullRomCurve3(vectors,false,'centripetal');
  mesh(new THREE.TubeGeometry(curve,60,.022,6,false),materials[color],parent);
  const end=vectors.at(-1),prior=curve.getPoint(.97);const dir=end.clone().sub(prior).normalize();
  const arrow=mesh(new THREE.ConeGeometry(.075,.18,10),materials[color],parent,[end.x,end.y,end.z]);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
}
function chunks(parent,x,z,label='chunks',color='blue'){
  for(let i=0;i<4;i++){
    box(parent,x+.07*i,.13+i*.15,z-.06*i,1.6,.1,.6);
    box(parent,x+.07*i,.19+i*.15,z-.06*i+.12,1.13,.016,.026,color);
  }
  const labelMesh=type(parent,label,x,.44,z+.6,1.65,83,'#71849A');
  return labelMesh;
}
function tag(parent,label,x,z,color='navy',y=.35,w=1.65){
  box(parent,x,y,z,w,.42,.085,color);type(parent,label,x,y,z+.049,w*.9,80,'#F5F8FC');
}
function source(parent){
  folder(parent,'backend/',-4.65,0,2.18);
  page(parent,'main.py',-2.85,1.7,{width:1.65,height:2.15});
  page(parent,'rag.py',-2.85,-1.6,{width:1.65,height:2.15});
  route(parent,[[-4.45,1.7,.06],[-4.45,.6,1.7],[-3.6,.55,1.7]],'gray');
  route(parent,[[-4.45,1.7,-.06],[-4.45,.6,-1.6],[-3.6,.55,-1.6]],'gray');
  chunks(parent,-.65,1.7);chunks(parent,-.65,-1.6);
  route(parent,[[-2,.2,1.7],[-1.4,.18,1.7],[-1.1,.2,1.7]],'blue');
  route(parent,[[-2,.2,-1.6],[-1.4,.18,-1.6],[-1.1,.2,-1.6]],'blue');
  tag(parent,'lexical',1.45,1.7,'navy');tag(parent,'vector',1.45,-1.6,'blue');
  route(parent,[[.25,.22,1.7],[1.15,.17,1.65],[2.5,.15,1.65],[3.5,.2,.2]],'cyan');
  route(parent,[[.25,.22,-1.6],[1.15,.17,-1.65],[2.5,.15,-1.65],[3.5,.2,-.2]],'blue');
  for(let i=2;i>=0;i--)page(parent,i===0?'evidence':'',3.5+i*.06,-.06*i,{height:2.05,width:1.55,selected:i===0,base:i*.025});
  page(parent,'answer',5.95,0,{height:2.5,width:1.65});
  route(parent,[[4.35,.27,0],[4.8,.27,0],[5.08,.27,0]],'blue');
  route(parent,[[5.95,.12,1.1],[5.95,.12,3.25],[-2.85,.12,3.25],[-2.85,.12,2]],'gray',true);
  type(parent,'commit / file / lines',1.2,.4,3.3,3.5,78,'#71849A');
}
function documents(parent){
  for(let i=4;i>=0;i--)page(parent,i===0?'PDF / TXT':'',-4.6+i*.14,-i*.14,{width:2.1,height:3.0,base:.08,angle:-.17,selected:i===0,lines:10});
  chunks(parent,-1.1,0,'page / passage');
  route(parent,[[-3.05,.18,0],[-2.5,.17,0],[-1.8,.22,0]],'blue');
  // Three circular document-index layers, representing ChromaDB persistence.
  for(let i=0;i<3;i++){
    const c=mesh(new THREE.CylinderGeometry(.92,.92,.19,64),materials[i===0?'navy':'paper'],parent,[1.35,.19+i*.22,0]);
    const ring=mesh(new THREE.TorusGeometry(.92,.012,6,64),materials.line,parent,[1.35,.285+i*.22,0]);ring.rotation.x=Math.PI/2;
  }
  type(parent,'ChromaDB',1.35,.5,1.12,2.25,87);
  route(parent,[[-.15,.25,0],[.1,.18,0],[.43,.2,0]],'blue');
  tag(parent,'gate',3.65,0,'navy',.5,1.25);
  route(parent,[[1.65,.18,-.9],[2.5,.15,-1.3],[3.65,.18,-.2]],'blue');
  route(parent,[[1.65,.18,.9],[2.5,.15,1.3],[3.65,.18,.2]],'cyan');
  type(parent,'cosine',2.4,.43,-1.38,1.4,81,'#0866F5');
  type(parent,'coverage',2.4,.43,1.5,1.6,81,'#71849A');
  page(parent,'answer',5.65,-1.5,{width:1.8,height:2.65});
  page(parent,'NOT_FOUND',5.65,2.0,{width:1.8,height:1.55,selected:false,lines:0});
  route(parent,[[3.9,.2,-.2],[4.5,.16,-1.5],[4.7,.25,-1.5]],'blue');
  route(parent,[[3.9,.2,.2],[4.5,.16,2],[4.7,.25,2]],'gray',true);
  type(parent,'skip LLM',5.65,.4,2.3,1.8,84,'#71849A');
  route(parent,[[5.65,.12,-2.0],[5.65,.12,-2.6],[-1.1,.12,-2.6],[-1.1,.12,-.5]],'cyan',true);
}
function graph(parent){
  folder(parent,'backend/app/',-4.35,0,2.3);
  page(parent,'intelligence.py',-2.3,1.35,{width:2.25,height:2.25});
  page(parent,'github.py',-2.3,-1.7,{width:1.75,height:2.05,selected:false});
  route(parent,[[-4.3,1.84,.05],[-4.3,.5,1.35],[-3.45,.5,1.35]],'gray');
  route(parent,[[-4.3,1.84,-.05],[-4.3,.5,-1.7],[-3.24,.5,-1.7]],'gray');
  route(parent,[[-1.55,.6,1.1],[-1.05,.3,.7],[-1.05,.3,-1.35],[-1.45,.6,-1.35]],'blue');
  type(parent,'imports',-1.04,.64,-.25,1.45,81,'#0866F5');
  tag(parent,'graph()',.3,1.35,'navy',.53);
  route(parent,[[-1.05,.37,1.35],[-.65,.2,1.35],[-.4,.26,1.35]],'blue');
  type(parent,'declares',-.36,.75,1.35,1.45,81,'#71849A');
  tag(parent,'PR A',1.1,-1.4,'blue',1.1,1.2);tag(parent,'PR B',1.75,3.3,'navy',1.1,1.2);
  chunks(parent,2.45,-1.4,'changes');chunks(parent,2.95,3.3,'changes','cyan');
  route(parent,[[1.5,.18,-1.4],[1.7,.17,-1.4],[1.85,.25,-1.4]],'blue');
  route(parent,[[2.1,.18,3.3],[2.3,.17,3.3],[2.35,.25,3.3]],'cyan');
  page(parent,'findings',5.3,.5,{width:2.1,height:2.8});
  route(parent,[[3.3,.22,-1.4],[4.1,.18,-1.35],[4.4,.45,.1]],'blue');
  route(parent,[[3.8,.22,3.3],[4.45,.18,3.25],[4.4,.45,.9]],'cyan');
  type(parent,'advisory / source refs',5.3,.5,1.03,2.8,79,'#71849A');
}
export async function draw(canvas,kind,small=false){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#F5F8FC');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
  renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.setPixelRatio(2);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  const aspect=canvas.clientWidth/canvas.clientHeight;
  const view=small?6.0:4.15;
  const camera=new THREE.OrthographicCamera(-view*aspect,view*aspect,view,-view,.1,100);
  camera.position.set(8,9.5,15);camera.lookAt(.7,small?.65:1.3,.35);
  const group=new THREE.Group();scene.add(group);({codeforge:source,vericore:documents,intervexa:graph})[kind](group);
  scene.add(new THREE.HemisphereLight(0xffffff,0xc4d3e3,1.6));
  const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(-4,10,6);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);
  const ground=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.09}),scene,[0,-.01,0]);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  renderer.render(scene,camera);
  await new Promise(resolve=>requestAnimationFrame(resolve));renderer.render(scene,camera);
  return renderer;
}
