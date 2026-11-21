/** Mundo 2.5D do Cretáceo fictício. A arte é desenhada em vetor, em camadas,
 *  sem modificar o modelo de colisões aprovado no Ciclo 04.
 */
export class WorldGenerator {
  constructor(scene,projection){this.scene=scene;this.projection=projection;this.obstacles=[];}
  create(columns,rows){
    this.columns=columns;this.rows=rows;
    const ground=this.scene.add.graphics();
    const grass=[0x4b7056,0x587b57,0x61815b,0x50745a,0x66865b,0x587959,0x5b8056];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y);
      const seed=(x*1277+y*1579+x*y*17)%101;
      const color=grass[(x*17+y*31)%grass.length];
      ground.fillStyle(color,1);ground.lineStyle(.5,0x183f36,.23);
      ground.beginPath();ground.moveTo(p.x,p.y-24);ground.lineTo(p.x+48,p.y);
      ground.lineTo(p.x,p.y+24);ground.lineTo(p.x-48,p.y);ground.closePath();ground.fillPath();ground.strokePath();
      // manchas de terra, musgos e líquenes sob os objetos, sem alinhamento rígido
      if(seed%7===0){
        ground.fillStyle(0x9b865c,.12);ground.fillEllipse(p.x+(seed%19)-9,p.y+(seed%11)-5,18+seed%13,7);
      }
      if(seed%11===0){
        ground.fillStyle(0xb8c688,.17);
        for(let j=0;j<4;j++)ground.fillCircle(p.x-18+j*7,p.y+(j%2)*4,1.3);
      }
      if(seed%13===0){
        ground.lineStyle(2,0x9cbd78,.28);
        for(let j=0;j<3;j++)ground.lineBetween(p.x-10+j*7,p.y+6,p.x-12+j*7,p.y+1);
      }
      // Folhagem baixa; a geometria é decorativa, não bloqueia movimento.
      if((x*13+y*19)%27===0)this.addFern(p.x,p.y-5,seed%2===0,.62);
      if((x*23+y*7)%53===0)this.addSporeCluster(p.x,p.y);
      if((x*11+y*29)%73===0)this.addCycad(p.x,p.y-4,.56);
    }
    ground.setDepth(-1000);
    this.addPerimeter(columns,rows);
    [[7,7,'rock'],[12,10,'tree'],[19,7,'rock'],[24,15,'tree'],[9,20,'rock'],[28,20,'tree'],[16,10,'rock']].forEach(([tx,ty,type])=>{
      const p=this.projection.toScreen(tx,ty);
      this.addObstacle(p.x,p.y,type==='tree'?48:40,type==='tree'?32:28,type);
    });
  }
  addPerimeter(columns,rows){
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);
      const kind=(x*7+y*11)%5;
      if(kind===0||kind===3)this.addObstacle(p.x,p.y,30,18,'rock',true);
      else if(kind===1)this.addObstacle(p.x,p.y,28,20,'tree',true);
      else this.addBush(p.x,p.y);
    }
  }
  addSporeCluster(x,y){
    const g=this.scene.add.graphics();
    g.fillStyle(0x0a2a20,.25);g.fillEllipse(x,y+10,41,10);
    for(let i=0;i<5;i++){
      const dx=-17+i*8,dy=Math.sin(i*5)*5;
      g.lineStyle(2,0x507b58,.9);g.lineBetween(x+dx,y+6,x+dx-2,y-5+dy);
      g.fillStyle(i%2?0xdbb77a:0x8dbc8f,.9);g.fillEllipse(x+dx-2,y-7+dy,5,4);
    }
    g.setDepth(y+90);
  }
  addFern(x,y,flipped=false,scale=1){
    const g=this.scene.add.graphics();g.setDepth(y+100);
    const left=flipped?-1:1;
    g.fillStyle(0x112e24,.28);g.fillEllipse(x,y+10,47*scale,11*scale);
    for(let branch=-3;branch<=3;branch++){
      const startX=x+branch*3*scale;
      const tipX=x+left*(branch*6+9)*scale;
      const tipY=y-11*scale-Math.cos(branch*.65)*13*scale;
      g.lineStyle(2.5*scale,0x315c3b,.9);g.lineBetween(startX,y+4,tipX,tipY);
      for(let j=1;j<=3;j++){
        const t=j/4,bx=startX+(tipX-startX)*t,by=y+4+(tipY-y-4)*t;
        g.fillStyle((branch+j)%2?0x7eb06b:0x456e47,1);
        g.fillEllipse(bx-5*scale,by-2*scale,12*scale,4.2*scale);
        g.fillEllipse(bx+4*scale,by,12*scale,4*scale);
      }
    }
  }
  addCycad(x,y,scale=1){
    const g=this.scene.add.graphics();g.setDepth(y+105);
    g.fillStyle(0x12251c,.27);g.fillEllipse(x,y+14,55*scale,12*scale);
    g.fillStyle(0x7a6445);g.fillRoundedRect(x-5*scale,y-22*scale,10*scale,35*scale,3);
    for(let i=0;i<11;i++){
      const a=i*Math.PI*2/11,ex=x+Math.cos(a)*39*scale,ey=y-28*scale+Math.sin(a)*17*scale;
      g.lineStyle(3*scale,0x2c563b,1);g.lineBetween(x,y-25*scale,ex,ey);
      g.fillStyle(i%2?0x7fa663:0x446c47);
      g.fillEllipse((ex+x)/2,(ey+y-25*scale)/2,37*scale,7*scale,a);
    }
    g.fillStyle(0xb29f68);g.fillEllipse(x,y-23*scale,8*scale,12*scale);
  }
  addBush(x,y){
    const g=this.scene.add.graphics();
    g.fillStyle(0x122a1c,.4);g.fillEllipse(x,y+11,73,18);
    g.fillStyle(0x244f3c);g.fillEllipse(x-17,y-7,43,29);
    g.fillStyle(0x366d4d);g.fillEllipse(x+12,y-16,47,40);
    g.fillStyle(0x52875b);g.fillEllipse(x-6,y-22,35,21);
    for(let i=0;i<5;i++){g.fillStyle(i%2?0x9fbd78:0x76a771,.65);g.fillCircle(x-22+i*11,y-19+(i%3)*3,3);}
    g.setDepth(y+200);
    this.obstacles.push({x,y,rx:38,ry:24,type:'bush',perimeter:true});
  }
  addObstacle(x,y,rx,ry,type,perimeter=false){
    const g=this.scene.add.graphics();
    g.fillStyle(0x0b2b24,.38);g.fillEllipse(x+4,y+16,rx*2.6,19);
    if(type==='tree'){
      // Tronco estriado, raízes e uma copa tropical escalonada.
      g.fillStyle(0x604c34);g.fillRoundedRect(x-8,y-47,17,76,5);
      g.lineStyle(2,0x96754e,.85);g.lineBetween(x-3,y-41,x-4,y+20);g.lineBetween(x+4,y-36,x+5,y+21);
      g.lineStyle(7,0x604c34,.9);g.lineBetween(x-3,y+23,x-19,y+28);g.lineBetween(x+5,y+22,x+22,y+28);
      g.fillStyle(0x244c3b);g.fillEllipse(x,y-62,rx*2.4,ry*2.5);
      g.fillStyle(0x316749);g.fillEllipse(x-23,y-74,rx*1.42,ry*1.4);
      g.fillStyle(0x467c55);g.fillEllipse(x+18,y-72,rx*1.5,ry*1.45);
      g.fillStyle(0x72a069,.85);g.fillEllipse(x-17,y-92,rx*.94,ry*.67);
      for(let i=0;i<8;i++){g.fillStyle(i%3?0x8ea967:0xb0a66c,.65);g.fillCircle(x-30+(i*13)%60,y-63-(i*7)%26,2.5);}
    }else{
      // Rocha com várias faces, fissuras e líquenes.
      g.fillStyle(0x58645d);g.fillPoints([{x:x-rx,y:y+6},{x:x-rx*.7,y:y-ry*.9},{x:x+rx*.22,y:y-ry*1.5},{x:x+rx,y:y+3},{x:x+rx*.32,y:y+ry*.63}],true);
      g.fillStyle(0x879686);g.fillTriangle(x-rx*.7,y-ry*.85,x+rx*.2,y-ry*1.5,x+rx*.38,y-ry*.2);
      g.fillStyle(0xa7ad94,.78);g.fillTriangle(x-rx*.63,y-ry*.65,x-rx*.12,y-ry*1.3,x+rx*.15,y-ry*.34);
      g.fillStyle(0x495c51);g.fillTriangle(x+rx*.38,y-ry*.2,x+rx,y+3,x+rx*.3,y+ry*.5);
      g.lineStyle(1.8,0x435b51,.6);g.lineBetween(x-rx*.1,y-ry*.45,x+rx*.14,y+ry*.4);
      for(let i=0;i<4;i++){g.fillStyle(0x6d996d,.4);g.fillCircle(x-rx*.6+i*rx*.34,y-3+(i%2)*6,3.2);}
    }
    g.setDepth(y+200);
    this.obstacles.push({x,y,rx:rx+12,ry:ry+14,type,perimeter});
  }
}
