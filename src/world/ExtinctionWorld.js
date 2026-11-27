/** Décima era: o solo colapsado de uma Terra futura e fictícia. */
export const EXTINCTION_OBSTACLES=Object.freeze({
  spire:[32,29],ruin:[43,27],witheredTree:[31,26],riftPylon:[28,25],
  craterWall:[42,24],fallenMachine:[45,27]
});

export class ExtinctionWorld {
  constructor(scene,projection){this.scene=scene;this.projection=projection;this.obstacles=[];}
  create(columns,rows){
    const g=this.scene.add.graphics().setDepth(-1000);
    const shades=[0x493e4d,0x57434d,0x403a4c,0x5c4b51,0x493e43,0x383744];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y),seed=(x*109+y*83+x*y*7)%127;
      g.fillStyle(shades[(seed+x+y*3)%shades.length]);
      g.lineStyle(.65,0xbe8a93,.2);
      g.beginPath();g.moveTo(p.x,p.y-24);g.lineTo(p.x+48,p.y);g.lineTo(p.x,p.y+24);g.lineTo(p.x-48,p.y);g.closePath();g.fillPath();g.strokePath();
      if(seed%9===0){
        g.lineStyle(1.2,0xd17781,.42);
        g.lineBetween(p.x-18,p.y+5,p.x-1,p.y-3);
        g.lineBetween(p.x-1,p.y-3,p.x+11,p.y+8);
        g.fillStyle(0xe58285,.22);g.fillEllipse(p.x,p.y+4,15,5);
      }
      if(seed%17===0){
        g.fillStyle(0xaaa0a0,.36);
        for(let i=0;i<4;i++)g.fillCircle(p.x-15+(i*13)%30,p.y-4+(i*7)%13,1.2+i%2);
      }
      if(seed%29===0){
        g.lineStyle(2,0xecab7b,.42);g.strokeEllipse(p.x-4,p.y,26,8);
      }
    }
    // A barreira física coincide com o contorno isométrico, sem cercar a área central.
    const edge=['spire','ruin','witheredTree','craterWall','riftPylon','fallenMachine'];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);
      this.addObstacle(p.x,p.y,edge[(x*5+y*7)%edge.length],true);
    }
    const interior=[
      ['ruin',8,7],['spire',25,6],['witheredTree',23,18],['craterWall',7,19],
      ['riftPylon',27,15],['fallenMachine',14,6],['ruin',21,10],['spire',13,22],
      ['craterWall',26,9],['witheredTree',9,13]
    ];
    for(const [type,x,y] of interior){const p=this.projection.toScreen(x,y);this.addObstacle(p.x,p.y,type);}
  }
  addObstacle(x,y,type,perimeter=false){
    const [rx,ry]=EXTINCTION_OBSTACLES[type];
    const g=this.scene.add.graphics().setDepth(y+220);
    g.fillStyle(0x1b141d,.42);g.fillEllipse(x+3,y+16,rx*2.7,19);
    if(type==='spire'){
      g.fillStyle(0x302c3a);g.fillPoints([{x:x-rx,y:y+9},{x:x-19,y:y-45},{x:x+2,y:y-113},{x:x+rx,y:y+7}],true);
      g.fillStyle(0x736172);g.fillTriangle(x-19,y-45,x+2,y-113,x+9,y-30);
      g.lineStyle(3,0xe68d99,.85);g.lineBetween(x+2,y-93,x-1,y-59);g.lineBetween(x-1,y-59,x+13,y-28);
    }else if(type==='ruin'){
      g.fillStyle(0x393a43);g.fillRoundedRect(x-38,y-48,76,62,3);
      g.fillStyle(0x7b7376);g.fillPoints([{x:x-41,y:y-48},{x:x-23,y:y-77},{x:x+5,y:y-59},{x:x+31,y:y-85},{x:x+43,y:y-43}],true);
      g.fillStyle(0x272731);for(let i=0;i<3;i++)g.fillRect(x-27+i*23,y-31,12,20);
      g.lineStyle(2,0xd9888a,.58);g.lineBetween(x+5,y-48,x-3,y-8);
    }else if(type==='witheredTree'){
      g.lineStyle(12,0x493c43);g.lineBetween(x,y+11,x-2,y-82);
      g.lineStyle(6,0x65525a);g.lineBetween(x,y-57,x-33,y-93);g.lineBetween(x-2,y-43,x+30,y-82);
      g.lineBetween(x-14,y-70,x-38,y-78);g.lineBetween(x+24,y-72,x+41,y-85);
      g.fillStyle(0x8c5a61,.7);g.fillCircle(x-2,y-80,5);
    }else if(type==='riftPylon'){
      g.fillStyle(0x333047);g.fillRoundedRect(x-19,y-55,38,66,6);
      g.fillStyle(0x77576f);g.fillTriangle(x-23,y-56,x,y-95,x+23,y-56);
      g.fillStyle(0xd66fba,.65);g.fillEllipse(x,y-52,13,47);
      g.lineStyle(3,0xf9b8d8,.7);g.lineBetween(x,y-83,x,y-30);
    }else if(type==='craterWall'){
      g.fillStyle(0x262732);g.fillEllipse(x,y+4,rx*2,ry*1.3);
      g.lineStyle(7,0x746269,.96);g.strokeEllipse(x,y+3,rx*2,ry);
      g.fillStyle(0xe58a74,.45);g.fillEllipse(x,y+4,rx*.9,ry*.4);
      g.fillStyle(0x59515b);g.fillTriangle(x-rx,y+6,x-rx*.4,y-27,x,y-5);
    }else{
      g.fillStyle(0x38353e);g.fillRoundedRect(x-44,y-36,88,49,4);
      g.fillStyle(0x70626d);g.fillRoundedRect(x-35,y-40,69,29,4);
      g.fillStyle(0x302c37);g.fillRoundedRect(x-30,y-31,59,14,3);
      g.lineStyle(2.5,0xe1a47f,.82);for(let i=0;i<4;i++)g.lineBetween(x-23+i*15,y-31,x-23+i*15,y-18);
      g.fillStyle(0x27252d);g.fillCircle(x-30,y+12,9);g.fillCircle(x+30,y+12,9);
    }
    this.obstacles.push({x,y,rx,ry,type,perimeter});
  }
}
