import * as T from 'three';

// Aim an orthographic camera along `direction` and size its frustum so `object` fills
// target = [x, y, w, h] (canvas pixels) of a W x H canvas.
export function fitOrtho(camera,object,direction,lookAt,W,H,target){
  camera.position.copy(lookAt).add(direction.clone().normalize().multiplyScalar(60));
  camera.lookAt(lookAt);camera.updateMatrixWorld();
  const box=new T.Box3().setFromObject(object),view=new T.Box3();
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])
    view.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
  const [tx,ty,tw,th]=target,ppu=Math.min(tw/(view.max.x-view.min.x),th/(view.max.y-view.min.y));
  const mx=(view.min.x+view.max.x)/2,my=(view.min.y+view.max.y)/2;
  camera.left=mx-(tx+tw/2)/ppu;camera.right=camera.left+W/ppu;camera.top=my+(ty+th/2)/ppu;camera.bottom=camera.top-H/ppu;
  camera.near=.1;camera.far=200;camera.updateProjectionMatrix();
}
