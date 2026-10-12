import * as T from './node_modules/three/build/three.module.js';
// Conceptual software-workbench geometry: source editor, module graph and
// interface/API/data layers. It is not a product screenshot or system topology.
const colors={navy:0x101a20,teal:0x527c80,cream:0xf1ebd6,orange:0xc68158,steel:0x526c82,dark:0x17262d};
const mats=Object.fromEntries(Object.entries(colors).map(([k,c])=>[k,new T.MeshStandardMaterial({color:c,roughness:.38,metalness:.22})]));
function mesh(g,geo,c,x,y,z){const o=new T.Mesh(geo,mats[c]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function box(g,x,y,z,w,h,d,c){return mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z);}
function text(g,s,x,y,z,w,c='#f1ebd6',font=110){
const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.font=`600 ${font}px Consolas,monospace`;ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(s,512,128);
const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const p=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));p.position.set(x,y,z);g.add(p);return p;
}
function route(g,pts,c='teal',width=.027){const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));mesh(g,new T.TubeGeometry(curve,64,width,8,false),c,0,0,0);}
function window(g,x,y,z,w,h,c='teal'){
box(g,x,y,z,w,h,.30,c);box(g,x,y-.08,z+.1,w-.18,h-.36,.065,'dark');box(g,x,y+h/2-.14,z+.15,w-.12,.25,.075,'orange');
for(let i=0;i<3;i++)mesh(g,new T.SphereGeometry(.043,16,12),i===2?'dark':'cream',x-w/2+.15+i*.13,y+h/2-.14,z+.2);
}
export async function draw(canvas){
const scene=new T.Scene();const g=new T.Group();scene.add(g);
// Three-tier full-stack foundation, each layer corresponds to software concerns.
for(let i=0;i<3;i++){const o=box(g,1.45,.45+i*.42,-.32,3.0,.19,2.65,['orange','teal','steel'][i]);o.rotation.y=.05;}
box(g,.4,.07,0,7,.14,5.1,'navy');
// Source and interface windows form a single deliberately constructed workbench.
window(g,-.8,2.8,-.55,3.05,3.75,'steel');window(g,.02,2.58,.09,2.9,3.65,'teal');
text(g,'{ }',-.42,3.87,.245,1.14,'#f1ebd6',180);
for(let i=0;i<9;i++){const widths=[1.13,.73,1.48,.87,1.3,.68,1.14,1.6,.87];box(g,-.26+((i%2)*.12),3.36-i*.21,.24,widths[i],.028,.022,i===2||i===6?'orange':'steel');}
// A separate source-module graph overlays the interface, without neural motifs.
box(g,1.63,3.14,.64,2.0,2.2,.26,'cream');
const nodes=[[-.58,.62],[-.58,-.17],[.2,.37],[.2,-.48],[.66,.02]];
for(const[a,b]of[[0,2],[0,3],[1,2],[1,3],[2,4],[3,4]]){const p=nodes[a],q=nodes[b];route(g,[[1.63+p[0],3.14+p[1],.81],[1.63+q[0],3.14+q[1],.81]],'steel',.018);}
for(let i=0;i<nodes.length;i++){const[x,y]=nodes[i];mesh(g,new T.CylinderGeometry(.105,.105,.065,32),i===4?'orange':'teal',1.63+x,3.14+y,.85).rotation.x=Math.PI/2;}
// An API/source syntax tile and a restrained document/data stack add real semantics.
box(g,-1.53,1.0,.77,1.5,1.4,.19,'cream');text(g,'{ }',-1.53,1.0,.884,1.37,'#527c80',185);
for(let i=0;i<5;i++){box(g,2.0,1.34+i*.073,1.13,1.6,.046,.96,i===4?'cream':'steel');}
route(g,[[-1.3,.15,.8],[-1.3,.15,1.95],[1.2,.15,1.95],[1.55,.49,1.4]],'orange',.025);
// Volumetric data store with machined rims and an orbiting copper cable.
for(let i=0;i<3;i++){mesh(g,new T.CylinderGeometry(.42,.42,.23,48),'teal',-2.15,.38+i*.27,-1.03);const rim=mesh(g,new T.TorusGeometry(.42,.025,12,48),'cream',-2.15,.49+i*.27,-1.03);rim.rotation.x=Math.PI/2;}
route(g,[[-2.3,1.3,-.65],[-2.9,1.5,.3],[-2.6,2.2,1.3],[-1.8,2.5,1.1]],'orange',.035);
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:true});renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.setPixelRatio(2);renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const aspect=canvas.clientWidth/canvas.clientHeight,view=3.25;const camera=new T.OrthographicCamera(-view*aspect,view*aspect,view,-view,.1,80);camera.position.set(8,7.5,12);camera.lookAt(.38,2.1,0);
scene.add(new T.HemisphereLight(0xffffff,0x688189,1.7));const sun=new T.DirectionalLight(0xffffff,2.0);sun.position.set(-5,10,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.normalBias=.025;scene.add(sun);
const floor=new T.Mesh(new T.PlaneGeometry(18,18),new T.ShadowMaterial({opacity:.28}));floor.rotation.x=-Math.PI/2;floor.position.y=.0;floor.receiveShadow=true;scene.add(floor);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.left=-view*w/h;camera.right=view*w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);}new ResizeObserver(resize).observe(canvas);resize();
renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
}
