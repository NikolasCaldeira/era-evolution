/** Desenho procedural de personagens e criaturas para as Eras VI–VIII. */
export const MODERN_SPECIES=Object.freeze({
  industrial:['rato-de-ferro','automato-fabril','besouro-a-vapor'],
  contemporanea:['cao-mecanico','sentinela-urbano','drone-de-vigilancia'],
  digital:['bug-de-codigo','firewall-vivo','espectro-digital']
});
const FACES=['right','down-right','down','down-left','left','up-left','up','up-right'];
const PALETTES={
  industrial:{body:'#9c7751',light:'#e5b98a',shadow:'#493b34',trim:'#d5bc78',eye:'#f6db91'},
  contemporanea:{body:'#506e8b',light:'#a8c6d5',shadow:'#293c50',trim:'#e3cd80',eye:'#98e4ea'},
  digital:{body:'#2f789b',light:'#65dec9',shadow:'#143456',trim:'#d99bec',eye:'#c9fff6'}
};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function poly(c,p,color){c.fillStyle=color;c.beginPath();c.moveTo(...p[0]);for(const v of p.slice(1))c.lineTo(...v);c.closePath();c.fill();}
function line(c,x,y,u,v,color,w=4){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke();}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function texture(scene,key,w,h,draw){if(scene.textures.exists(key))return;const t=scene.textures.createCanvas(key,w,h),c=t.getContext();c.clearRect(0,0,w,h);c.save();draw(c);c.restore();t.refresh();}
function player(c,era,facing,frame){
  const p=PALETTES[era],left=facing.includes('left'),back=facing.startsWith('up'),bob=[0,-2,0,-1][frame],stride=[-4,3,4,-3][frame];
  c.translate(52,86+bob);c.scale(left?-1:1,1);
  // Botas e pernas separadas para comunicar oito direções em movimento.
  line(c,-11,-3,-14,24+stride,p.shadow,11);line(c,11,-3,15,24-stride,p.shadow,11);
  ellipse(c,-14,24+stride,9,5,'#28333a');ellipse(c,15,24-stride,9,5,'#28333a');
  poly(c,[[-20,-42],[17,-42],[24,9],[-23,9]],p.body);
  poly(c,[[-19,-39],[1,-39],[-3,8],[-22,8]],p.shadow);
  line(c,-18,-31,-26,-5+stride*.4,p.light,8);line(c,19,-31,27,-6-stride*.4,p.light,8);
  rect(c,-20,-5,42,5,p.trim);ellipse(c,3,-3,4,4,p.eye);
  ellipse(c,0,-53,16,19,'#d2a483');
  if(era==='industrial'){
    poly(c,[[-21,-60],[21,-60],[15,-67],[-15,-67]],'#56453a');
    rect(c,-16,-82,32,18,'#674d3d');rect(c,-11,-85,22,4,p.trim);
    line(c,-12,-43,12,-43,p.trim,3);
  }else if(era==='contemporanea'){
    poly(c,[[-19,-62],[20,-62],[12,-73],[-12,-73]],'#243c4c');
    rect(c,-15,-67,30,6,p.light);
    rect(c,-22,-29,8,19,'#315466');rect(c,13,-29,8,19,'#315466');
  }else{
    poly(c,[[-20,-62],[-12,-79],[11,-79],[20,-62]],p.shadow);
    rect(c,-16,-65,32,8,p.light);rect(c,-9,-62,18,4,p.eye);
    line(c,-27,-6,-34,-1,p.trim,2);
  }
  if(back)ellipse(c,0,-55,12,11,p.shadow);else{
    ellipse(c,6,-55,2,2,'#2a3037');if(!facing.includes('right')&&!left)ellipse(c,-7,-55,2,2,'#2a3037');
  }
  ellipse(c,30,-11,8,8,p.trim);ellipse(c,30,-11,3,3,'#ecfff2');
}
function ironRat(c,f){
  c.translate(56,78+[0,-3,0,-1][f]);
  line(c,-28,-5,-53,-26,'#968a6c',6);
  for(const x of [-22,-7,14,29])line(c,x,2,x+2,23+(f%2?3:-3),'#64584e',7);
  ellipse(c,-3,-13,34,22,'#766657');ellipse(c,22,-24,20,18,'#a38d73');
  ellipse(c,10,-41,10,13,'#ae8265');ellipse(c,30,-44,10,13,'#ae8265');
  ellipse(c,27,-26,3,3,'#f1df9a');line(c,38,-20,51,-16,'#66574e',3);
  for(let i=0;i<4;i++)line(c,-26+i*13,-29,-26+i*13,-34,'#d7b179',2);
}
function factoryBot(c,f){
  c.translate(54,80+[0,-2,0,-1][f]);
  for(const x of [-17,17]){line(c,x,-4,x+3,22,'#53463e',12);ellipse(c,x+3,22,9,4,'#332d2b');}
  rect(c,-25,-51,50,45,'#92704f');rect(c,-20,-46,40,18,'#c3a579');
  for(const x of [-34,34])line(c,Math.sign(x)*23,-39,x,7,'#a28c72',9);
  rect(c,-21,-77,42,24,'#4e4c49');rect(c,-16,-74,32,14,'#d1b785');
  for(const x of [-9,9])ellipse(c,x,-67,4,4,'#f4e3a2');
  ellipse(c,0,-17,13,13,'#625c4c');ellipse(c,0,-17,6,6,'#e1ac62');
}
function steamBeetle(c,f){
  c.translate(56,79+[0,-5,0,-2][f]);
  for(const x of [-26,-12,12,26])line(c,x,-9,x+(x>0?8:-8),18,'#5c5b50',5);
  ellipse(c,0,-25,34,26,'#5c756a');ellipse(c,-12,-26,20,26,'#af9570');ellipse(c,12,-26,20,26,'#987957');
  rect(c,-8,-55,16,27,'#655249');ellipse(c,0,-54,10,7,'#d2bca0');
  for(const x of [-8,8])ellipse(c,x,-30,3,3,'#eac782');
  line(c,-22,-51,-32,-70,'#807159',3);line(c,22,-51,32,-70,'#807159',3);
}
function mechDog(c,f){
  c.translate(56,77+[0,-3,0,-2][f]);
  for(const x of [-25,-5,16,32])line(c,x,-8,x+1,22+(f%2?2:-2),'#374b5d',8);
  ellipse(c,-7,-22,33,20,'#5c8199');ellipse(c,24,-34,20,18,'#496478');
  poly(c,[[11,-47],[11,-66],[25,-48]],'#2b455e');poly(c,[[26,-48],[43,-64],[39,-37]],'#2b455e');
  poly(c,[[31,-29],[54,-19],[41,-13]],'#8faeba');ellipse(c,34,-35,4,4,'#a5ffff');
  line(c,-30,-22,-54,-39,'#4d637b',6);rect(c,-23,-27,25,6,'#e0c477');
}
function urbanSentinel(c,f){
  c.translate(56,80+[0,-2,0,-1][f]);
  for(const x of [-15,15])line(c,x,-2,x,22,'#333f52',11);
  poly(c,[[-28,-49],[28,-49],[33,-5],[-32,-5]],'#486c87');rect(c,-20,-42,40,13,'#b2bfc5');
  ellipse(c,0,-67,23,23,'#243b51');rect(c,-17,-72,34,12,'#72d0e0');
  line(c,-29,-41,-38,-3,'#637f93',11);line(c,29,-41,38,-3,'#637f93',11);
  rect(c,-9,-18,18,9,'#d7c48c');
}
function surveillanceDrone(c,f){
  c.translate(56,63+[0,-5,0,-3][f]);
  poly(c,[[-35,-12],[-45,-30],[-22,-43],[-8,-23]],'#718ea4');poly(c,[[35,-12],[45,-30],[22,-43],[8,-23]],'#516b87');
  ellipse(c,0,-21,25,18,'#354f6c');ellipse(c,0,-21,16,12,'#c1d7dc');ellipse(c,0,-21,7,7,'#8ef8ef');
  line(c,-33,-24,-43,-11,'#b6b6a4',4);line(c,33,-24,43,-11,'#b6b6a4',4);
  for(const x of [-35,35])ellipse(c,x,-28,9,3,'#e5e3b3');
}
function codeBug(c,f){
  c.translate(56,79+[0,-3,0,-1][f]);
  for(const x of [-22,-10,10,22])line(c,x,0,x+(x<0?-16:16),18,'#65d3c8',5);
  poly(c,[[-28,-31],[-13,-55],[14,-55],[30,-31],[27,6],[-26,6]],'#176481');
  poly(c,[[-23,-32],[0,-47],[23,-32],[15,-10],[-14,-10]],'#38b2b2');
  ellipse(c,-9,-25,5,5,'#e1fdf2');ellipse(c,9,-25,5,5,'#e1fdf2');
  line(c,-11,11,11,11,'#b9e9e3',3);
}
function firewallCreature(c,f){
  c.translate(56,80+[0,-2,0,-1][f]);
  for(const x of [-15,15])line(c,x,0,x,21,'#1b455c',10);
  poly(c,[[-32,-57],[32,-57],[32,-5],[-32,-5]],'#3b92a8');
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)rect(c,-25+col*18,-49+row*15,14,9,(row+col)%2?'#195475':'#76d7c7');
  rect(c,-18,-70,36,10,'#b9e6e6');ellipse(c,-9,-66,3,3,'#263551');ellipse(c,9,-66,3,3,'#263551');
}
function digitalSpecter(c,f){
  c.translate(56,70+[0,-6,0,-4][f]);
  poly(c,[[-22,-45],[0,-79],[23,-45],[31,14],[12,1],[0,21],[-13,1],[-31,14]],'#3e759b');
  poly(c,[[-15,-37],[0,-65],[15,-37],[18,-3],[0,9],[-19,-3]],'#68e6c2');
  ellipse(c,-8,-29,4,3,'#ebffff');ellipse(c,8,-29,4,3,'#ebffff');
  line(c,-20,-20,-36,-2,'#d19aef',4);line(c,20,-20,36,-2,'#d19aef',4);
}
const DRAW={
  'rato-de-ferro':ironRat,'automato-fabril':factoryBot,'besouro-a-vapor':steamBeetle,
  'cao-mecanico':mechDog,'sentinela-urbano':urbanSentinel,'drone-de-vigilancia':surveillanceDrone,
  'bug-de-codigo':codeBug,'firewall-vivo':firewallCreature,'espectro-digital':digitalSpecter
};
export function modernPlayerTexture(era,facing,frame){return `modern-${era}-player-${FACES.includes(facing)?facing:'down'}-${frame%4}`;}
export function modernCreatureTexture(era,species,left,frame){return `modern-${era}-${species}-${left?'left':'right'}-${frame%4}`;}
export function modernBossTexture(era,left,frame){return `modern-${era}-boss-${left?'left':'right'}-${frame%4}`;}
export function createModernArt(scene,era){
  if(!MODERN_SPECIES[era])throw new Error('Era moderna inexistente');
  for(const facing of FACES)for(let frame=0;frame<4;frame++)
    texture(scene,modernPlayerTexture(era,facing,frame),108,124,c=>player(c,era,facing,frame));
  for(const species of MODERN_SPECIES[era])for(const left of [false,true])for(let f=0;f<4;f++)
    texture(scene,modernCreatureTexture(era,species,left,f),112,114,c=>{
      if(left){c.translate(112,0);c.scale(-1,1);}DRAW[species](c,f);
    });
  for(const left of [false,true])for(let f=0;f<4;f++)
    texture(scene,modernBossTexture(era,left,f),190,204,c=>{
      c.translate(21,31);c.scale(1.32,1.30);
      if(left){c.translate(112,0);c.scale(-1,1);}
      const representative={industrial:'automato-fabril',contemporanea:'sentinela-urbano',digital:'firewall-vivo'}[era];
      DRAW[representative](c,f);
      const p=PALETTES[era];
      ellipse(c,0,-82,33,10,p.trim);rect(c,-15,-94,30,13,p.shadow);
      ellipse(c,0,-94,8,5,p.eye);
    });
}
