/** Capítulos VI–VIII: ambientes com obstáculo e identidade visual próprios. */
const CONFIG = Object.freeze({
  industrial:{
    palette:[0x776e62,0x847b69,0x665f56,0x90816a,0x706961,0x887765],line:0x51483d,
    edge:['pipe','furnace','crate','smokestack','pipe'],
    center:[['boiler',8,7],['crate',25,6],['pipe',22,19],['gear',7,19],['smokestack',27,15],['crate',14,6],['boiler',20,10],['gear',13,22]]
  },
  contemporanea:{
    palette:[0x777d81,0x858b8c,0x696f78,0x9ba09b,0x7c8889,0x8e9393],line:0x454f58,
    edge:['barrier','lamppost','truck','barrier','tree'],
    center:[['car',7,8],['barrier',22,7],['truck',26,16],['lamppost',8,19],['car',21,21],['tree',13,7],['barrier',17,10],['truck',28,9]]
  },
  digital:{
    palette:[0x283a52,0x304765,0x24334c,0x40526b,0x293d58,0x354a61],line:0x4e9eae,
    edge:['firewall','node','server','firewall','node'],
    center:[['server',8,8],['node',23,7],['firewall',26,16],['node',9,19],['server',22,20],['crystal',15,6],['firewall',15,11],['crystal',26,9]]
  }
});
export const MODERN_WORLDS=Object.freeze(Object.keys(CONFIG));

export class ModernWorld {
  constructor(scene,projection,era){
    if(!CONFIG[era])throw new Error(`Era moderna inexistente: ${era}`);
    this.scene=scene;this.projection=projection;this.era=era;this.cfg=CONFIG[era];this.obstacles=[];
  }
  create(columns,rows){
    const {palette,line}=this.cfg,g=this.scene.add.graphics().setDepth(-1000);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y),seed=(x*37+y*53+x*y*7)%101;
      g.fillStyle(palette[(seed+x+y)%palette.length]);g.lineStyle(.6,line,.3);
      g.beginPath();g.moveTo(p.x,p.y-24);g.lineTo(p.x+48,p.y);g.lineTo(p.x,p.y+24);g.lineTo(p.x-48,p.y);g.closePath();g.fillPath();g.strokePath();
      if(seed%11===0){
        if(this.era==='industrial'){
          g.lineStyle(1.4,0x332f2d,.42);g.lineBetween(p.x-21,p.y+6,p.x+18,p.y+6);
          for(let n=-1;n<=1;n++)g.fillStyle(0xc3a67d,.5).fillRect(p.x+n*10,p.y-2,3,3);
        }else if(this.era==='contemporanea'){
          g.lineStyle(1.6,0xbfc8c2,.53);g.lineBetween(p.x-14,p.y+6,p.x+12,p.y-7);
        }else{
          g.lineStyle(1.5,0x66e0df,.42);g.lineBetween(p.x-17,p.y+6,p.x+7,p.y-6);
          g.fillStyle(0x9cead4,.5);g.fillCircle(p.x+7,p.y-6,2.4);
        }
      }
      if(seed%31===0){
        g.fillStyle(this.era==='industrial'?0x473b31:this.era==='contemporanea'?0x697b73:0x53b7b8,.42);
        g.fillEllipse(p.x,p.y+8,15,5);
      }
    }
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);
      this.addObstacle(p.x,p.y,this.cfg.edge[(x*5+y*3)%this.cfg.edge.length],true);
    }
    for(const [kind,x,y] of this.cfg.center){const p=this.projection.toScreen(x,y);this.addObstacle(p.x,p.y,kind,false);}
  }
  addObstacle(x,y,kind,perimeter){
    const g=this.scene.add.graphics().setDepth(y+220),industrial=this.era==='industrial',digital=this.era==='digital';
    const dark=industrial?0x51473c:digital?0x192f50:0x3d4b59;
    const metal=industrial?0x9f896a:digital?0x4a8ca5:0xb6bdc2;
    const highlight=industrial?0xe6b97c:digital?0x79e7e0:0xe4e4c4;
    g.fillStyle(0x111b22,.36);g.fillEllipse(x,y+13,79,18);
    if(kind==='smokestack'||kind==='lamppost'||kind==='node'){
      g.fillStyle(dark);g.fillRoundedRect(x-9,y-103,18,113,3);
      g.fillStyle(metal);g.fillRoundedRect(x-6,y-98,7,102,2);
      if(kind==='smokestack'){
        g.fillStyle(0x392e2a);g.fillEllipse(x,y-103,34,13);g.fillStyle(0xd5b6a1,.52);g.fillEllipse(x+7,y-117,40,15);
      }else if(kind==='lamppost'){
        g.fillStyle(0xffe3a6);g.fillEllipse(x,y-104,35,18);g.fillStyle(0x48575b);g.fillRoundedRect(x-21,y-119,42,9,3);
      }else{
        g.fillStyle(0x52f0d8,.8);g.fillCircle(x,y-108,15);g.lineStyle(3,0x98eff0,.9);g.strokeCircle(x,y-108,22);
      }
    }else if(kind==='gear'||kind==='tree'||kind==='crystal'){
      if(kind==='tree'){
        g.fillStyle(0x6a5743);g.fillRoundedRect(x-6,y-57,12,78,2);
        for(let k=0;k<3;k++){g.fillStyle([0x3d6757,0x507a63,0x638e6d][k]);g.fillEllipse(x+(-1+k)*12,y-68-k*8,52,49);}
      }else if(kind==='gear'){
        g.fillStyle(dark);g.fillCircle(x,y-17,38);g.fillStyle(metal);g.fillCircle(x,y-17,29);
        g.fillStyle(0x4b4941);g.fillCircle(x,y-17,14);
        for(let i=0;i<8;i++){let a=Math.PI*i/4;g.lineStyle(7,highlight,.85);g.lineBetween(x+Math.cos(a)*25,y-17+Math.sin(a)*25,x+Math.cos(a)*41,y-17+Math.sin(a)*41);}
      }else{
        g.fillStyle(0x58d9de,.86);g.fillTriangle(x,y-82,x-38,y-8,x+37,y-8);
        g.fillStyle(0x9afcf0,.66);g.fillTriangle(x,y-82,x-38,y-8,x-4,y-8);
        g.lineStyle(3,0x29577b,.8);g.lineBetween(x,y-82,x+37,y-8);
      }
    }else if(kind==='pipe'||kind==='barrier'||kind==='firewall'){
      g.fillStyle(dark);g.fillRoundedRect(x-39,y-40,78,45,4);
      g.fillStyle(metal);g.fillRoundedRect(x-35,y-42,70,30,3);
      if(kind==='pipe'){
        g.fillStyle(0x3d352f);g.fillEllipse(x-26,y-24,20,18);g.fillStyle(0xcea46e);g.fillEllipse(x-26,y-24,10,10);
      }else if(kind==='barrier'){
        for(let k=0;k<4;k++){g.fillStyle(k%2?0xe1c371:0xb55c45);g.fillRect(x-32+k*17,y-28,15,11);}
      }else{
        g.fillStyle(0x77eaed,.7);for(let k=0;k<5;k++)g.fillRect(x-33+k*14,y-31,8,11);
      }
    }else{
      const tall=kind==='furnace'||kind==='server'||kind==='truck'||kind==='boiler';
      g.fillStyle(dark);g.fillRoundedRect(x-34,y-(tall?75:52),68,tall?80:59,5);
      g.fillStyle(metal);g.fillRoundedRect(x-30,y-(tall?73:50),60,tall?68:49,4);
      if(kind==='furnace'||kind==='boiler'){
        g.fillStyle(0x36322f);g.fillRoundedRect(x-18,y-49,37,25,2);
        g.fillStyle(0xf4a95a);g.fillEllipse(x,y-36,25,13);
        g.lineStyle(3,highlight,.75);g.lineBetween(x-30,y-61,x+30,y-61);
      }else if(kind==='server'){
        g.fillStyle(0x122b40);for(let j=0;j<4;j++)g.fillRoundedRect(x-23,y-66+j*15,46,11,2);
        for(let j=0;j<4;j++){g.fillStyle(j%2?0x78f0bc:0xe7d783);g.fillCircle(x+14,y-61+j*15,3);}
      }else if(kind==='car'||kind==='truck'){
        g.fillStyle(0x4b6075);g.fillRoundedRect(x-22,y-48,44,27,6);
        g.fillStyle(0xb9d4e0);g.fillRoundedRect(x-17,y-45,34,14,2);
        g.fillStyle(0x202e38);g.fillCircle(x-22,y+3,9);g.fillCircle(x+22,y+3,9);
      }else{
        g.fillStyle(0x6b4e35);g.fillRect(x-25,y-43,50,6);
        g.fillStyle(highlight);g.fillRect(x-24,y-28,48,4);
      }
    }
    const r={pipe:[39,25],furnace:[37,28],crate:[35,26],smokestack:[28,24],boiler:[40,28],gear:[43,28],barrier:[43,24],lamppost:[26,22],truck:[42,29],tree:[37,24],car:[43,24],firewall:[44,26],node:[28,24],server:[40,29],crystal:[40,28]}[kind]||[37,25];
    this.obstacles.push({x,y,rx:r[0],ry:r[1],type:kind,perimeter});
  }
}
