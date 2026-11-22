/** Três arenas isométricas independentes: templos antigos, castelo medieval, jardins renascentistas. */
const THEMES={
  antiga:{palette:[0xc5aa70,0xd4b980,0xb69d68,0xc0a370,0xe0c28b,0xb9a06d],line:0x8c7046,
    edge:['column','rubble','palm','column','rubble'],center:[['obelisk',8,8],['rubble',20,9],['column',25,15],['palm',11,18],['obelisk',23,21],['rubble',7,21],['column',15,5],['palm',28,9]]},
  medieval:{palette:[0x586978,0x617282,0x6f7b83,0x4a5c68,0x697c84,0x65716e],line:0x243c4d,
    edge:['wall','tower','pine','wall','wall'],center:[['well',9,8],['barrel',20,6],['tower',25,16],['pine',9,19],['well',22,19],['barrel',17,8],['tower',6,14],['pine',27,11]]},
  renascimento:{palette:[0xb7b09a,0xbab89d,0x9eb5a8,0xc4bb9f,0xc1ad94,0xa6bdaf],line:0x788d80,
    edge:['hedge','column','hedge','statue','hedge'],center:[['fountain',9,8],['column',19,7],['statue',25,15],['hedge',10,20],['fountain',23,20],['column',7,14],['hedge',17,9],['statue',27,8]]}
};
export const CIVILIZATION_WORLDS=Object.freeze(Object.keys(THEMES));
export class CivilizationWorld {
  constructor(scene,projection,era){
    if(!THEMES[era])throw new Error('Civilização desconhecida: '+era);
    this.scene=scene;this.projection=projection;this.era=era;this.theme=THEMES[era];this.obstacles=[];
  }
  create(columns,rows){
    const t=this.theme,ground=this.scene.add.graphics();
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y),seed=(x*59+y*41+x*y*13)%107;
      ground.fillStyle(t.palette[(x*7+y*11+seed)%t.palette.length]);
      ground.lineStyle(.65,t.line,.28);
      ground.beginPath();ground.moveTo(p.x,p.y-24);ground.lineTo(p.x+48,p.y);ground.lineTo(p.x,p.y+24);ground.lineTo(p.x-48,p.y);ground.closePath();ground.fillPath();ground.strokePath();
      if(seed%11===0){
        ground.lineStyle(1.2,t.line,.32);
        ground.lineBetween(p.x-18,p.y+5,p.x-7,p.y+1);
        ground.lineBetween(p.x-7,p.y+1,p.x-1,p.y+6);
      }
      if(seed%19===0){
        ground.fillStyle(this.era==='antiga'?0xf4d49a:this.era==='medieval'?0x789382:0xdce6b9,.54);
        ground.fillEllipse(p.x-2,p.y+7,14,4);
      }
      if(seed%37===0)this.detail(p.x,p.y);
    }
    ground.setDepth(-1000);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);
      this.addObstacle(p.x,p.y,t.edge[(x*5+y*3)%t.edge.length],true);
    }
    for(const [type,x,y] of t.center){const p=this.projection.toScreen(x,y);this.addObstacle(p.x,p.y,type,false);}
  }
  detail(x,y){
    const g=this.scene.add.graphics().setDepth(y+18);
    if(this.era==='antiga'){
      g.lineStyle(1.3,0x856b43,.48);g.lineBetween(x-9,y+2,x,y-4);g.lineBetween(x+4,y-1,x+13,y+5);
    }else if(this.era==='medieval'){
      g.fillStyle(0x486a61,.63);for(let i=0;i<3;i++)g.fillEllipse(x-8+i*7,y+2+(i%2)*4,10,4);
    }else{
      for(let i=0;i<4;i++){g.fillStyle(i%2?0xeac68d:0xc87964,.65);g.fillCircle(x-9+i*6,y+2+(i%2)*4,2.6);}
    }
  }
  addObstacle(x,y,kind,perimeter){
    const g=this.scene.add.graphics().setDepth(y+220),colors={
      antiga:[0x8c7857,0xe2be7c,0xf5dc9e,0x6f664b],
      medieval:[0x293f4d,0x8997a0,0xb2b8ac,0x404e61],
      renascimento:[0x486452,0xd2c5a6,0xf5e9c9,0x8ca6a1]
    }[this.era];
    const [dark,base,light,accent]=colors;
    g.fillStyle(0x162925,.32);g.fillEllipse(x+5,y+14,83,17);
    if(kind==='palm'||kind==='pine'){
      g.fillStyle(kind==='palm'?0x806043:0x705b47);g.fillRoundedRect(x-6,y-48,12,69,3);
      if(kind==='palm'){
        for(let j=-2;j<=2;j++){g.lineStyle(9,j%2?0x4e7753:0x6e915f);g.lineBetween(x,y-55,x+j*20,y-68+Math.abs(j)*16);}
      }else{
        for(let i=0;i<3;i++){const top=y-103+i*25;g.fillStyle(i%2?0x2d5148:0x416a54);g.fillTriangle(x,top,x-38+i*5,top+53,x+38-i*5,top+53);}
      }
    }else if(kind==='hedge'){
      g.fillStyle(dark);g.fillEllipse(x,y-11,77,38);g.fillStyle(0x729475);g.fillEllipse(x-11,y-23,45,18);
      g.fillStyle(0x9ab280);g.fillEllipse(x+20,y-19,27,17);
    }else if(kind==='fountain'||kind==='well'){
      g.fillStyle(dark);g.fillEllipse(x,y+5,72,28);g.fillStyle(light);g.fillEllipse(x,y-3,64,25);
      g.fillStyle(kind==='fountain'?0x72c2c1:0x304d63);g.fillEllipse(x,y-6,48,17);
      if(kind==='fountain'){
        g.fillStyle(base);g.fillRoundedRect(x-5,y-47,10,40,3);g.fillEllipse(x,y-42,29,8);
        g.fillStyle(0xa4e6dc,.75);g.fillEllipse(x,y-39,22,4);
      }
    }else if(kind==='rubble'||kind==='barrel'){
      if(kind==='barrel'){
        g.fillStyle(0x6e523f);g.fillRoundedRect(x-23,y-42,46,49,9);
        g.lineStyle(4,0xc1a572);g.lineBetween(x-21,y-29,x+21,y-29);g.lineBetween(x-20,y-4,x+20,y-4);
      }else{
        g.fillStyle(base);g.fillPoints([{x:x-33,y:y+7},{x:x-22,y:y-25},{x:x+1,y:y-44},{x:x+34,y:y+4}],true);
        g.fillStyle(light);g.fillTriangle(x-22,y-25,x+1,y-44,x+13,y-11);
      }
    }else{
      // Construções sólidas; não são apenas recolorações do mesmo obstáculo.
      const column=kind==='column'||kind==='obelisk'||kind==='statue';
      g.fillStyle(dark);g.fillRoundedRect(x-29,y-4,58,17,3);
      if(column){
        g.fillStyle(base);g.fillRoundedRect(x-17,y-80,34,83,3);
        g.fillStyle(light);g.fillRoundedRect(x-18,y-86,36,12,1);
        if(kind==='obelisk'){
          g.fillStyle(base);g.fillTriangle(x-17,y-79,x,y-114,x+17,y-79);
          g.lineStyle(1.2,accent,.8);g.lineBetween(x-3,y-52,x+5,y-42);
        }
        if(kind==='statue'){
          g.fillStyle(accent);g.fillEllipse(x,y-101,19,22);
          g.fillStyle(light);g.fillRoundedRect(x-6,y-90,12,22,3);
        }
      }else{
        g.fillStyle(base);g.fillRoundedRect(x-28,y-60,56,58,1);
        g.fillStyle(light);for(let i=0;i<3;i++)g.fillRoundedRect(x-28+i*21,y-72,14,16,1);
        g.lineStyle(2,dark,.7);g.lineBetween(x-29,y-35,x+29,y-35);
      }
    }
    const radius={hedge:[42,24],fountain:[38,23],well:[39,22],pine:[33,23],palm:[27,20],rubble:[40,26],barrel:[30,23],column:[31,23],obelisk:[35,25],statue:[34,24],wall:[36,29],tower:[36,29]}[kind]||[35,25];
    this.obstacles.push({x,y,rx:radius[0],ry:radius[1],type:kind,perimeter});
  }
}
