/** Era IX: posto científico numa lua fictícia, com obstáculos isométricos próprios.
 * Somente a base física das instalações bloqueia passagem; detalhes da arte não colidem.
 */
export const SPACE_OBSTACLES=Object.freeze({
  dome:[44,32],antenna:[27,23],lunarRock:[37,25],solarPanel:[46,23],
  roverStation:[39,27],beacon:[25,22]
});

export class SpaceWorld {
  constructor(scene,projection){this.scene=scene;this.projection=projection;this.obstacles=[];}
  create(columns,rows){
    const g=this.scene.add.graphics().setDepth(-1000);
    const shades=[0x454c62,0x505b6b,0x404b5d,0x606a78,0x4c5669,0x424860];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const p=this.projection.toScreen(x,y),seed=(x*131+y*83+x*y*11)%113;
      g.fillStyle(shades[(seed+x+2*y)%shades.length]);g.lineStyle(.65,0x839cbd,.22);
      g.beginPath();g.moveTo(p.x,p.y-24);g.lineTo(p.x+48,p.y);g.lineTo(p.x,p.y+24);g.lineTo(p.x-48,p.y);g.closePath();g.fillPath();g.strokePath();
      if(seed%14===0){
        g.lineStyle(1.2,0xaab0c3,.3);g.strokeEllipse(p.x-4,p.y,25+seed%13,8);
        g.fillStyle(0x27314a,.35);g.fillEllipse(p.x-4,p.y+1,19,6);
      }
      if(seed%19===0){
        g.fillStyle(0x9db7c7,.38);
        for(let i=0;i<4;i++)g.fillCircle(p.x-15+(i*13)%29,p.y-4+(i*7)%13,1.3+(i%2));
      }
      // Cabos e marcas de plataformas científicas, integrados aos tiles.
      if(seed%23===0){
        g.lineStyle(1.5,0x73cbd9,.42);g.lineBetween(p.x-23,p.y+7,p.x+12,p.y-10);
        g.fillStyle(0xb4eff3,.5);g.fillRect(p.x+9,p.y-12,5,4);
      }
    }
    const edge=['lunarRock','antenna','solarPanel','lunarRock','beacon','dome'];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      if(x!==0&&y!==0&&x!==columns-1&&y!==rows-1)continue;
      const p=this.projection.toScreen(x,y);
      this.addObstacle(p.x,p.y,edge[(x*5+y*3)%edge.length],true);
    }
    const center=[
      ['dome',8,7],['lunarRock',25,6],['antenna',22,19],['solarPanel',7,19],
      ['roverStation',27,15],['beacon',14,6],['dome',21,10],['lunarRock',13,22],['solarPanel',26,9]
    ];
    for(const [type,x,y] of center){const p=this.projection.toScreen(x,y);this.addObstacle(p.x,p.y,type,false);}
  }
  addObstacle(x,y,type,perimeter=false){
    const g=this.scene.add.graphics().setDepth(y+220);
    const [rx,ry]=SPACE_OBSTACLES[type];
    g.fillStyle(0x11182c,.44);g.fillEllipse(x+4,y+15,rx*2.6,18);
    if(type==='lunarRock'){
      g.fillStyle(0x667188);g.fillPoints([{x:x-rx,y:y+5},{x:x-rx*.78,y:y-ry},{x:x+rx*.17,y:y-ry*1.7},{x:x+rx,y:y+2},{x:x+rx*.32,y:y+ry*.65}],true);
      g.fillStyle(0xa5b0c3);g.fillTriangle(x-rx*.73,y-ry*.9,x+rx*.16,y-ry*1.7,x+rx*.21,y-ry*.2);
      g.fillStyle(0x424e6b);g.fillTriangle(x+rx*.22,y-ry*.2,x+rx,y+2,x+rx*.32,y+ry*.65);
      g.fillStyle(0xc3d3e6,.35);g.fillCircle(x-7,y-8,4);
    }else if(type==='dome'){
      g.fillStyle(0x303d58);g.fillRoundedRect(x-42,y-20,84,32,4);
      g.fillStyle(0x9bb8ca);g.fillEllipse(x,y-26,82,68);g.fillStyle(0x4d738a);g.fillEllipse(x-1,y-32,67,49);
      g.fillStyle(0xa3eff0,.7);g.fillEllipse(x-12,y-45,30,13);
      g.lineStyle(4,0xe0ded9,.78);g.lineBetween(x-37,y-22,x+37,y-22);
      g.fillStyle(0xdac789);g.fillRoundedRect(x-12,y-11,24,19,3);
    }else if(type==='antenna'){
      g.fillStyle(0x394b62);g.fillRoundedRect(x-12,y-63,24,76,3);
      g.fillStyle(0xa3bcd4);g.fillRoundedRect(x-7,y-67,12,71,3);
      g.lineStyle(3,0x87dbe4);g.lineBetween(x,y-68,x+12,y-102);
      g.fillStyle(0x72b3d3);g.fillEllipse(x+15,y-100,49,15);g.fillStyle(0xbce4ec);g.fillEllipse(x+13,y-105,33,8);
      g.fillStyle(0xebc6a1);g.fillCircle(x+12,y-111,5);
    }else if(type==='solarPanel'){
      g.fillStyle(0x8c9eb1);g.fillRect(x-5,y-31,10,44);
      g.fillStyle(0x263e6b);g.fillPoints([{x:x-48,y:y-47},{x:x+39,y:y-50},{x:x+48,y:y-20},{x:x-38,y:y-16}],true);
      g.lineStyle(2,0x72d1e8,.75);
      for(let i=-3;i<=3;i++)g.lineBetween(x+i*11,y-45,x+i*11+8,y-19);
      g.lineBetween(x-43,y-32,x+43,y-35);
    }else if(type==='roverStation'){
      g.fillStyle(0x303a52);g.fillRoundedRect(x-39,y-45,78,56,6);
      g.fillStyle(0x8496aa);g.fillRoundedRect(x-33,y-52,66,45,5);
      g.fillStyle(0x456688);g.fillRoundedRect(x-25,y-43,50,23,3);
      g.fillStyle(0x85f1e9);for(let i=0;i<4;i++)g.fillRect(x-18+i*13,y-36,8,6);
      g.fillStyle(0x21283e);for(const wheelX of [-29,29])g.fillCircle(x+wheelX,y+7,10);
    }else{ // beacon: baliza de navegação
      g.fillStyle(0x34445f);g.fillRoundedRect(x-10,y-62,20,72,4);
      g.fillStyle(0x9fb5c9);g.fillRoundedRect(x-6,y-59,12,61,3);
      g.fillStyle(0x7cece9,.75);g.fillCircle(x,y-67,15);g.lineStyle(3,0xa1f8ef,.8);g.strokeCircle(x,y-67,22);
    }
    this.obstacles.push({x,y,rx,ry,type,perimeter});
  }
}
