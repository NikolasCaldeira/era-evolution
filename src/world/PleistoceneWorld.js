/** Terreno gelado do Pleistoceno, com geometria e colisões próprias. */
export class PleistoceneWorld {
  constructor(scene,projection){this.scene=scene;this.projection=projection;this.obstacles=[];}
  create(columns,rows){
    this.columns=columns;this.rows=rows;
    const ground=this.scene.add.graphics();
    const palette=[0x758b92,0x83999d,0x718b8d,0x8b9f9c,0x97a8a4,0x718892,0x81969d];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y),seed=(x*1277+y*1579+x*y*17)%101;
      ground.fillStyle(palette[(x*17+y*31)%palette.length]);ground.lineStyle(.6,0x344e59,.28);
      ground.beginPath();ground.moveTo(p.x,p.y-24);ground.lineTo(p.x+48,p.y);ground.lineTo(p.x,p.y+24);ground.lineTo(p.x-48,p.y);ground.closePath();ground.fillPath();ground.strokePath();
      if(seed%7===0){ground.fillStyle(0xe1e5db,.44);ground.fillEllipse(p.x-10+seed%17,p.y-4,28+seed%17,9);}
      if(seed%11===0){ground.fillStyle(0xd6eff4,.55);for(let i=0;i<4;i++)ground.fillCircle(p.x-19+i*10,p.y+(i%2)*6,1.7);}
      if(seed%19===0){ground.lineStyle(1.6,0x455d60,.52);ground.lineBetween(p.x-9,p.y+4,p.x-2,p.y);ground.lineBetween(p.x-2,p.y,p.x+7,p.y+3);}
      if((x*13+y*19)%43===0)this.addFrozenTuft(p.x,p.y);
    }
    ground.setDepth(-1000);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);const kind=(x*7+y*11)%6;
      if(kind<=2)this.addRock(p.x,p.y,kind===0?'ice':'stone',true);
      else if(kind===3)this.addPine(p.x,p.y,true);
      else this.addDrift(p.x,p.y,true);
    }
    for(const [tx,ty,type] of [[6,7,'stone'],[11,10,'pine'],[22,7,'ice'],[24,15,'pine'],[9,20,'stone'],[27,21,'pine'],[17,9,'ice'],[19,18,'stone'],[13,21,'ice']]){
      const p=this.projection.toScreen(tx,ty);
      if(type==='pine')this.addPine(p.x,p.y,false);
      else this.addRock(p.x,p.y,type,false);
    }
  }
  addFrozenTuft(x,y){
    const g=this.scene.add.graphics().setDepth(y+50);
    g.lineStyle(2,0x576f68,.74);for(let i=-2;i<=2;i++)g.lineBetween(x+i*4,y+5,x+i*8,y-3-Math.abs(i%3)*3);
    g.fillStyle(0xe3e2cc,.6);g.fillEllipse(x,y+5,20,4);
  }
  addRock(x,y,type='stone',perimeter=false){
    const g=this.scene.add.graphics().setDepth(y+200);
    const icy=type==='ice',base=icy?0x8cbdc5:0x647d82,light=icy?0xe5f8ed:0xb2c1b9,dark=icy?0x588b9e:0x455e66;
    g.fillStyle(0x273f49,.27);g.fillEllipse(x+4,y+13,105,19);
    g.fillStyle(base);g.fillPoints([{x:x-40,y:y+3},{x:x-32,y:y-19},{x:x-6,y:y-49},{x:x+30,y:y-31},{x:x+42,y:y+6},{x:x+10,y:y+14}],true);
    g.fillStyle(light);g.fillTriangle(x-32,y-19,x-6,y-49,x+14,y-19);
    g.fillStyle(dark);g.fillTriangle(x+14,y-19,x+30,y-31,x+42,y+6);
    g.lineStyle(2,0xd9efed,.75);g.lineBetween(x-19,y-19,x+12,y-19);
    this.obstacles.push({x,y,rx:49,ry:38,type:icy?'ice':'rock',perimeter});
  }
  addPine(x,y,perimeter=false){
    const g=this.scene.add.graphics().setDepth(y+200);
    g.fillStyle(0x29444a,.34);g.fillEllipse(x+7,y+17,92,18);
    g.fillStyle(0x62584e);g.fillRoundedRect(x-7,y-45,14,69,3);
    for(let level=0;level<3;level++){
      const yTop=y-105+level*26,half=25+level*11;
      g.fillStyle(level===1?0x375b59:0x284a4b);g.fillTriangle(x,yTop,x-half,yTop+52,x+half,yTop+52);
      g.fillStyle(0xc8dddb,.86);g.fillTriangle(x,yTop,x-half*.6,yTop+27,x+half*.58,yTop+27);
    }
    this.obstacles.push({x,y,rx:43,ry:29,type:'pine',perimeter});
  }
  addDrift(x,y,perimeter=false){
    const g=this.scene.add.graphics().setDepth(y+185);
    g.fillStyle(0x2d4b53,.23);g.fillEllipse(x,y+11,82,15);
    g.fillStyle(0xb9cfd1);g.fillEllipse(x-13,y-2,37,23);
    g.fillStyle(0xdce7e1);g.fillEllipse(x+10,y-6,41,26);
    g.fillStyle(0xf0f3e7,.77);g.fillEllipse(x+4,y-13,31,11);
    this.obstacles.push({x,y,rx:40,ry:24,type:'snow',perimeter});
  }
}
