/** Component único garante que estrela, halo e brilho partilham exatamente o mesmo centro. */
export function relicCenter(x,y){return {x,y:y-24};}
export function createRelicVisual(scene,x,y,color,title){
  const center=relicCenter(x,y);
  const halo=scene.add.circle(0,0,23,color,.09).setStrokeStyle(2,color,.85);
  const glow=scene.add.circle(0,0,13,color,.22);
  const star=scene.add.star(0,0,6,9,18,color).setStrokeStyle(2,0xffffff,.88);
  const container=scene.add.container(center.x,center.y,[halo,glow,star]).setDepth(y+440);
  const label=scene.add.text(x,center.y-37,title,{
    fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',align:'center',color:'#fff5d8',stroke:'#153029',strokeThickness:4
  }).setOrigin(.5).setDepth(y+500);
  scene.tweens.add({targets:halo,scaleX:1.28,scaleY:1.28,alpha:.25,yoyo:true,repeat:-1,duration:1050});
  scene.tweens.add({targets:glow,alpha:.35,scale:1.15,yoyo:true,repeat:-1,duration:850});
  // Importante: não mover a estrela; apenas os círculos pulsam.
  return {container,halo,glow,star,label,center,destroy(){container.destroy();label.destroy();}};
}
