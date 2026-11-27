/** Desenho procedural de personagens e criaturas para as Eras VI–IX. */
export const MODERN_SPECIES=Object.freeze({
  industrial:['rato-de-ferro','automato-fabril','besouro-a-vapor'],
  contemporanea:['cao-mecanico','sentinela-urbano','drone-de-vigilancia'],
  digital:['bug-de-codigo','firewall-vivo','espectro-digital'],
  espacial:['rover-corrompido','sentinela-astral','raia-nebulosa'],
  extincao:['rastejante-de-cinzas','espectro-de-fenda','guardiao-obsidiana']
});
const FACES=['right','down-right','down','down-left','left','up-left','up','up-right'];
const PALETTES={
  industrial:{body:'#9c7751',light:'#e5b98a',shadow:'#493b34',trim:'#d5bc78',eye:'#f6db91'},
  contemporanea:{body:'#506e8b',light:'#a8c6d5',shadow:'#293c50',trim:'#e3cd80',eye:'#98e4ea'},
  digital:{body:'#2f789b',light:'#65dec9',shadow:'#143456',trim:'#d99bec',eye:'#c9fff6'},
  espacial:{body:'#b3c6d6',light:'#e8f3fa',shadow:'#465e83',trim:'#6fe1e7',eye:'#aaf5f2'},
  extincao:{body:'#5e5969',light:'#ca9da0',shadow:'#302b39',trim:'#efa58a',eye:'#ffcaca'}
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
  if(era==='espacial'){
    // Macacão pressurizado, mochila de oxigênio e capacete panorâmico.
    rect(c,-23,-41,45,42,'#7a97b3');rect(c,-15,-36,30,26,'#cad7e4');
    rect(c,-27,-27,10,22,p.shadow);rect(c,17,-27,10,22,p.shadow);
    ellipse(c,0,-51,23,24,'#e4edf4');ellipse(c,0,-53,19,18,'#456987');
    ellipse(c,-6,-59,10,5,'#8ed9e7');rect(c,-16,-34,32,6,'#6ae1e1');
    rect(c,-14,-7,29,5,'#263a56');ellipse(c,2,-5,4,4,p.trim);
  }else if(era==='extincao'){
    // Armadura improvisada para sobreviver ao colapso do planeta.
    rect(c,-20,-41,40,43,'#554451');rect(c,-16,-34,30,27,'#8b7680');
    poly(c,[[-20,-61],[-15,-81],[0,-85],[17,-80],[22,-61]],'#4b3748');
    rect(c,-18,-66,36,12,'#e8ac9b');rect(c,-12,-64,24,7,'#503a4c');
    rect(c,-24,-32,9,23,'#b28082');rect(c,15,-32,9,23,'#b28082');
    line(c,-17,6,19,6,p.trim,3);
  }else if(era==='industrial'){
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
  if(era==='espacial'){
    ellipse(c,0,-54,23,25,'#e1ebf4');ellipse(c,0,-55,19,19,'#3e6b8a');
    ellipse(c,-7,-63,10,5,'#9de4e9');rect(c,-17,-38,34,5,'#6c8aab');
    rect(c,-22,-27,8,15,'#7b96ad');rect(c,15,-27,8,15,'#7b96ad');
    if(back)rect(c,-18,-53,36,24,'#829fb6');
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

// Eras IX: três silhuetas e animações próprias da base lunar.
function lunarRover(c,f){
  c.translate(56,79+[0,-2,0,-1][f]);
  for(const x of [-32,-13,16,34]){
    line(c,x,-5,x+(f%2?2:-2),18,'#48617b',9);
    ellipse(c,x,19,10,7,'#243a55');ellipse(c,x,19,4,3,'#9ac8da');
  }
  poly(c,[[-39,-39],[-22,-52],[25,-52],[39,-35],[34,1],[-34,1]],'#899aad');
  poly(c,[[-28,-45],[19,-45],[27,-22],[-28,-22]],'#41627e');
  ellipse(c,8,-35,12,7,'#73e4dc');ellipse(c,8,-35,5,4,'#e2ffff');
  line(c,-2,-50,-3,-66,'#bfcdd4',5);ellipse(c,-3,-68,6,6,'#ebc992');
  for(let i=0;i<3;i++)rect(c,-24+i*19,-9,13,4,'#e4d6a7');
}
function cosmicSentinel(c,f){
  c.translate(56,81+[0,-3,0,-2][f]);
  for(const x of [-18,18]){line(c,x,-6,x+3*(f%2?1:-1),20,'#4d6188',12);ellipse(c,x,22,11,5,'#263b57');}
  poly(c,[[-27,-56],[27,-56],[34,-18],[18,2],[-18,2],[-34,-18]],'#637fa8');
  poly(c,[[-21,-47],[21,-47],[14,-23],[-14,-23]],'#9bd5e2');
  ellipse(c,0,-33,9,9,'#6de4e8');ellipse(c,0,-33,4,4,'#eaffef');
  line(c,-26,-47,-37,-10,'#839db5',10);line(c,26,-47,37,-10,'#839db5',10);
  ellipse(c,0,-70,23,18,'#dae8ec');rect(c,-18,-74,36,10,'#467b9a');
  for(const x of [-10,10])ellipse(c,x,-69,3.3,3.3,'#cafff8');
}
function nebulaManta(c,f){
  c.translate(56,69+[0,-6,0,-3][f]);
  const wing=[0,7,0,-5][f];
  poly(c,[[-13,-25],[-50,-61+wing],[-41,-12],[-9,5]],'#6387b4');
  poly(c,[[13,-25],[50,-61-wing],[41,-12],[9,5]],'#845cab');
  poly(c,[[-38,-38],[-9,-10],[-6,-28]],'#8dd1dd');
  poly(c,[[38,-38],[9,-10],[6,-28]],'#b5a5e2');
  ellipse(c,0,-20,21,29,'#a5afd4');ellipse(c,0,-27,12,14,'#6edee4');
  ellipse(c,-8,-30,3,3,'#f3ffff');ellipse(c,8,-30,3,3,'#f3ffff');
  line(c,-6,0,-17,27,'#86d1d8',4);line(c,6,0,17,27,'#ad96e0',4);
}
function orbitalGuardian(c,f,left){
  c.translate(95,114+[0,-3,0,-2][f]);
  if(left)c.scale(-1,1);
  // Corpo em forma de estação de defesa orbital: anel, asas solares, núcleo e sensores.
  for(const side of [-1,1]){
    poly(c,[[side*23,-34],[side*78,-52],[side*86,-5],[side*30,14]],side<0?'#456fa0':'#657aa9');
    poly(c,[[side*34,-29],[side*74,-39],[side*73,-5],[side*36,3]],'#2d426e');
    for(let k=0;k<3;k++)line(c,side*(43+k*12),-32,side*(47+k*11),-1,'#7ed4e7',2);
  }
  ellipse(c,0,-25,39,43,'#496587');ellipse(c,0,-25,29,31,'#afc7d8');
  ellipse(c,0,-28,21,21,'#426c95');ellipse(c,0,-28,13,13,'#70f1de');
  ellipse(c,0,-28,6,6,'#f2eac4');
  for(const side of [-1,1]){
    line(c,side*17,-62,side*26,-85,'#9fbcd4',5);
    ellipse(c,side*26,-87,9,7,'#edca9a');
    line(c,side*16,4,side*22,29,'#9bbad0',9);
    ellipse(c,side*22,33,15,7,'#3c527e');
  }
  ellipse(c,0,-78,36,10,'#6f8faf');ellipse(c,0,-82,18,6,'#bbf1ed');
  for(let i=0;i<4;i++)rect(c,-15+i*10,8,6,5,'#f1c98e');
}

// Era X — criaturas pós-apocalípticas com movimentos e silhuetas próprios.
function ashCrawler(c,f){
  c.translate(56,79+[0,-3,0,-2][f]);
  for(const x of [-31,-16,14,30])line(c,x,-13,x+(x<0?-9:9),19+(f%2?3:-3),'#5e4b55',7);
  poly(c,[[-35,-24],[-9,-51],[26,-44],[41,-17],[24,6],[-32,1]],'#67535f');
  poly(c,[[-14,-46],[11,-65],[30,-42],[9,-29]],'#9a6b75');
  line(c,-28,-28,-42,-52,'#bf8286',7);line(c,32,-29,45,-56,'#bf8286',7);
  ellipse(c,27,-32,5,5,'#ffe0b7');ellipse(c,29,-33,2,2,'#ffe6ef');
  for(let i=0;i<5;i++)line(c,-20+i*12,-24,-16+i*12,-31,'#e4a38f',2);
}
function riftWraith(c,f){
  c.translate(56,69+[0,-7,0,-4][f]);
  poly(c,[[-23,-44],[0,-86],[23,-43],[37,4],[12,-2],[0,19],[-13,-4],[-37,5]],'#413b61');
  poly(c,[[-17,-40],[0,-67],[17,-40],[19,-2],[0,10],[-19,-1]],'#a75c9a');
  ellipse(c,0,-38,15,23,'#d78ca4');ellipse(c,-7,-39,4,4,'#fff5d6');ellipse(c,7,-39,4,4,'#fff5d6');
  line(c,-24,-31,-42,-12,'#e99ea5',5);line(c,24,-31,42,-12,'#e99ea5',5);
  line(c,-16,5,-25,24,'#705779',3);line(c,16,5,25,24,'#705779',3);
}
function obsidianGuardian(c,f){
  c.translate(56,81+[0,-3,0,-2][f]);
  for(const x of [-18,18]){line(c,x,-5,x+2*(f%2?1:-1),22,'#393543',12);ellipse(c,x,23,12,5,'#292632');}
  poly(c,[[-30,-51],[30,-51],[37,-9],[20,2],[-19,2],[-38,-13]],'#564858');
  poly(c,[[-23,-43],[0,-66],[24,-43],[15,-20],[-17,-20]],'#95707d');
  poly(c,[[-22,-70],[0,-86],[21,-72],[18,-55],[-17,-55]],'#383646');
  rect(c,-17,-68,35,8,'#df9b95');ellipse(c,-9,-65,3,3,'#f7d7bc');ellipse(c,9,-65,3,3,'#f7d7bc');
  line(c,-31,-47,-43,-5,'#806878',11);line(c,32,-47,43,-5,'#806878',11);
  line(c,0,-29,0,-8,'#edb398',4);ellipse(c,0,-29,6,6,'#f4bb9f');
}
function extinctionHeart(c,f,left){
  c.translate(95,112+[0,-6,0,-3][f]);if(left)c.scale(-1,1);
  // Núcleo instável suspenso entre estilhaços — nunca se confunde com os chefes anteriores.
  for(const side of [-1,1]){
    poly(c,[[side*24,-40],[side*78,-84],[side*73,-32],[side*88,6],[side*33,7]],side<0?'#554158':'#5e4859');
    poly(c,[[side*40,-39],[side*62,-57],[side*70,-11],[side*33,-4]],'#92717d');
    line(c,side*29,-47,side*73,-26,'#f0a795',3);
    poly(c,[[side*20,13],[side*42,31],[side*24,52],[side*11,10]],'#46374a');
  }
  ellipse(c,0,-39,47,47,'#4d3c54');ellipse(c,0,-39,35,39,'#a5687c');
  ellipse(c,0,-43,25,28,'#e0a18d');ellipse(c,0,-43,15,18,'#ebccd0');
  ellipse(c,0,-43,7,10,'#fff0d8');
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4+f*.08;
    const x=Math.cos(a)*57,y=-42+Math.sin(a)*57;
    poly(c,[[x-6,y+3],[x,y-12],[x+10,y+7]],i%2?'#b47f8c':'#6e576d');
  }
  for(let i=0;i<4;i++)line(c,-21+i*14,0,-18+i*14,10,'#f3c1aa',3);
}

const DRAW={
  'rato-de-ferro':ironRat,'automato-fabril':factoryBot,'besouro-a-vapor':steamBeetle,
  'cao-mecanico':mechDog,'sentinela-urbano':urbanSentinel,'drone-de-vigilancia':surveillanceDrone,
  'bug-de-codigo':codeBug,'firewall-vivo':firewallCreature,'espectro-digital':digitalSpecter,
  'rover-corrompido':lunarRover,'sentinela-astral':cosmicSentinel,'raia-nebulosa':nebulaManta,
  'rastejante-de-cinzas':ashCrawler,'espectro-de-fenda':riftWraith,'guardiao-obsidiana':obsidianGuardian
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
      if(era==='espacial'){orbitalGuardian(c,f,left);return;}
      if(era==='extincao'){extinctionHeart(c,f,left);return;}
      c.translate(21,31);c.scale(1.32,1.30);
      if(left){c.translate(112,0);c.scale(-1,1);}
      const representative={industrial:'automato-fabril',contemporanea:'sentinela-urbano',digital:'firewall-vivo'}[era];
      DRAW[representative](c,f);
      const p=PALETTES[era];
      ellipse(c,0,-82,33,10,p.trim);rect(c,-15,-94,30,13,p.shadow);
      ellipse(c,0,-94,8,5,p.eye);
    });
}
