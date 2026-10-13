import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Tech-stack trays: one tray per category with its name printed on the tray,
// one block per tool with the tool's name printed on the block.
const THEMES={
  dark:{tray:0x0f1d30,chip:0x1a2c44,ink:'#F5F8FC',muted:'#71849A',hemi:[0xdbe7ff,0x0b1626,1.75],sun:2.2,floor:.34},
  light:{tray:0xe3eaf3,chip:0xffffff,ink:'#071827',muted:'#71849A',hemi:[0xffffff,0xa9b8ca,2.2],sun:1.7,floor:.1},
};
const ACCENTS={dark:['#00C7E8','#F5A524','#3D86FF','#8F9BFF','#2DD4BF'],light:['#0891B2','#C2750A','#0866F5','#5B62E8','#0D9488']};
const CHIP={h:.3,d:.66,gap:.16,pad:.34},TRAY={h:.2,pad:.26,rowGap:.2},LABEL_H=.36,FONT=82;

function texture(text,color,{font=FONT,weight=600,family="'Segoe UI',Arial,sans-serif",spacing=0}={}){
  const cv=document.createElement('canvas'),ctx=cv.getContext('2d'),f=`${weight} ${font}px ${family}`;
  ctx.font=f;ctx.letterSpacing=`${spacing}px`;const w=Math.ceil(ctx.measureText(text).width)+8;
  cv.width=w;cv.height=128;ctx.font=f;ctx.letterSpacing=`${spacing}px`;ctx.fillStyle=color;ctx.textBaseline='middle';ctx.fillText(text,4,68);
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=16;return {tex,aspect:w/128};
}

// categories: [[name, [[tool, ...], ...rows]], ...]; the category name is printed on the tray above its
// rows. Returns the sheet height in CSS pixels.
export async function drawStack(canvas,{theme,categories,layout,width,margin}){
  const c=THEMES[theme],scene=new T.Scene(),g=new T.Group();scene.add(g);
  const mat=(color,o={})=>new T.MeshStandardMaterial({color,roughness:.58,metalness:.06,...o});
  const trayMat=mat(c.tray),chipMat=mat(c.chip);
  const add=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
  const decal=({tex,aspect},h,x,y,z)=>{const p=new T.Mesh(new T.PlaneGeometry(aspect*h,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    p.rotation.x=-Math.PI/2;p.position.set(x,y,z);g.add(p);return aspect*h;};

  // Measure every block, then size all trays to the widest so the edges line up.
  const D=layout==='desktop',built=categories.map(([name,rows],k)=>{
    const accent=ACCENTS[theme][k];
    const tag=texture(`0${k+1}  ${name}`,accent,{font:58,weight:700,family:'Consolas,ui-monospace,monospace',spacing:7});
    const tagW=tag.aspect*LABEL_H;
    const blocks=rows.map(row=>row.map(tool=>{const t=texture(tool,c.ink);return {t,w:t.aspect*LABEL_H+CHIP.pad*2+.1};}));
    const rowW=blocks.map(r=>r.reduce((a,b)=>a+b.w,0)+CHIP.gap*(r.length-1));
    return {accent,tag,tagW,blocks,rowW};
  });
  const inner=Math.max(...built.flatMap(b=>b.rowW));
  const trayW=TRAY.pad*2+inner;
  let z=0;
  for(const b of built){
    const head=.78,depth=TRAY.pad*2+head+b.blocks.length*CHIP.d+(b.blocks.length-1)*TRAY.rowGap;
    const z0=z;  // the first category is the back tray, so it sits highest on screen
    add(new RoundedBoxGeometry(trayW,TRAY.h,depth,4,.06),trayMat,trayW/2,TRAY.h/2,z0+depth/2);
    const accentMat=mat(new T.Color(b.accent),{emissive:new T.Color(b.accent),emissiveIntensity:.35});
    const x0=TRAY.pad;
    decal(b.tag,LABEL_H,x0+b.tagW/2,TRAY.h+.003,z0+TRAY.pad+.16);
    b.blocks.forEach((row,r)=>{
      let x=x0;const cz=z0+TRAY.pad+head+r*(CHIP.d+TRAY.rowGap)+CHIP.d/2;
      for(const blk of row){
        add(new RoundedBoxGeometry(blk.w,CHIP.h,CHIP.d,4,.06),chipMat,x+blk.w/2,TRAY.h+CHIP.h/2,cz);
        add(new T.BoxGeometry(.05,.012,CHIP.d*.52),accentMat,x+CHIP.pad*.62,TRAY.h+CHIP.h+.004,cz);
        decal(blk.t,LABEL_H,x+CHIP.pad+.06+blk.t.aspect*LABEL_H/2,TRAY.h+CHIP.h+.004,cz+.012);
        x+=blk.w+CHIP.gap;
      }
    });
    z=z0+depth+.5;
  }

  const camera=new T.OrthographicCamera(-1,1,1,-1,.1,200);
  const yaw=(D?-10:-12)*Math.PI/180,pitch=(D?40:42)*Math.PI/180,box=new T.Box3().setFromObject(g),centre=box.getCenter(new T.Vector3());
  camera.position.set(centre.x+Math.sin(yaw)*Math.cos(pitch)*40,centre.y+Math.sin(pitch)*40,centre.z+Math.cos(yaw)*Math.cos(pitch)*40);
  camera.lookAt(centre);camera.updateMatrixWorld();
  const view=new T.Box3();
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const zz of [box.min.z,box.max.z])
    view.expandByPoint(new T.Vector3(x,y,zz).applyMatrix4(camera.matrixWorldInverse));
  const ppu=(width-2*margin[0])/(view.max.x-view.min.x),height=Math.round((view.max.y-view.min.y)*ppu+2*margin[1]);
  const mx=(view.min.x+view.max.x)/2,my=(view.min.y+view.max.y)/2;
  Object.assign(camera,{left:mx-width/2/ppu,right:mx+width/2/ppu,top:my+height/2/ppu,bottom:my-height/2/ppu});camera.updateProjectionMatrix();

  canvas.style.width=width+'px';canvas.style.height=height+'px';
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(window.devicePixelRatio);renderer.setSize(width,height,false);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=theme==='light'?1.28:1.05;
  scene.add(new T.HemisphereLight(...c.hemi));
  const sun=new T.DirectionalLight(0xffffff,c.sun);sun.position.set(centre.x-5,14,centre.z+9);sun.target.position.copy(centre);scene.add(sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);const span=Math.max(box.max.x-box.min.x,box.max.z-box.min.z);
  Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:1,far:60});sun.shadow.normalBias=.02;scene.add(sun);
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:c.floor}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  renderer.render(scene,camera);await new Promise(r=>requestAnimationFrame(r));renderer.render(scene,camera);
  return height;
}
