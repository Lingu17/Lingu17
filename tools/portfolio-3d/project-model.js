import * as T from 'three';
import {builders} from './models.js';
import {fitOrtho} from './fit.js';

// Renders one verified project scene from models.js onto a transparent canvas so the
// sheet can supply a dark or light page; geometry and materials are unchanged.
const VIEWS={codeforge:[[10,10,16],[.7,1,0]],vericore:[[9,12,17],[.4,1,0]],intervexa:[[10,18,14],[.2,.4,0]]};

export async function drawProject(canvas,{kind,theme,target}){
  const dark=theme==='dark',scene=new T.Scene(),g=new T.Group();scene.add(g);builders[kind](g);
  const W=canvas.clientWidth,H=canvas.clientHeight;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(W,H,false);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  scene.add(new T.HemisphereLight(0xffffff,dark?0x71849a:0xdce5ed,1.75));
  const light=new T.DirectionalLight(0xffffff,2.05);light.position.set(-6,14,8);light.castShadow=true;light.shadow.mapSize.set(4096,4096);
  Object.assign(light.shadow.camera,{left:-17,right:17,top:14,bottom:-14});light.shadow.normalBias=.025;scene.add(light);
  const ground=new T.Mesh(new T.PlaneGeometry(120,120),new T.ShadowMaterial({opacity:dark?.3:.1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
  const [dir,look]=VIEWS[kind],camera=new T.OrthographicCamera();
  fitOrtho(camera,g,new T.Vector3(...dir).sub(new T.Vector3(...look)),new T.Vector3(...look),W,H,target);
  renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
}
