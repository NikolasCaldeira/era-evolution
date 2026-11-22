/** Sprites desenhados em Canvas, com silhuetas e equipamentos próprios para as eras III–V. */
export const CIVILIZATION_SPECIES=Object.freeze({
  antiga:['escaravelho','guardiao-de-arenito','espirito-chacal'],
  medieval:['lobo-sombrio','gargula','cavaleiro-encantado'],
  renascimento:['automato','quimera-alquimica','sentinela-de-bronze']
});
const CIV_FACINGS=['right','down-right','down','down-left','left','up-left','up','up-right'];
function civOval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function civPoly(c,pts,color,stroke=null){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=color;c.fill();if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}}
function civLine(c,x,y,tx,ty,color,width=3){c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.lineWidth=width;c.lineCap='round';c.strokeStyle=color;c.stroke();}
function civTexture(scene,key,w,h,paint){if(scene.textures.exists(key))return;const t=scene.textures.createCanvas(key,w,h),c=t.getContext();c.clearRect(0,0,w,h);c.save();paint(c);c.restore();t.refresh();}
function civHuman(c,era,facing,frame){
  const left=facing.includes('left'),back=facing.startsWith('up'),stride=[-4,2,4,-2][frame],bob=[0,-2,0,-1][frame];
  c.translate(50,87+bob);c.scale(left?-1:1,1);
  const tunic=era==='antiga'?'#e8d8a4':era==='medieval'?'#5c7180':'#a36c52';
  const coat=era==='antiga'?'#587e73':era==='medieval'?'#50687e':'#384f64';
  const trim=era==='antiga'?'#cbb569':era==='medieval'?'#b4bbc0':'#ddb88a';
  civPoly(c,[[-13,-1],[-4,0],[-8,22+stride],[-17,23+stride]],'#554b44');
  civPoly(c,[[4,0],[13,-1],[17,23-stride],[8,23-stride]],'#5d4e45');
  civOval(c,-13,23+stride,9,4,'#292e2e');civOval(c,13,23-stride,9,4,'#292e2e');
  civPoly(c,[[-19,-37],[18,-37],[23,8],[-22,9]],tunic,'#5f5a4c');
  civPoly(c,[[-20,-37],[3,-34],[-2,9],[-21,9]],coat);
  civLine(c,-18,-35,-22,-6+stride*.5,'#b68c6f',7);civLine(c,18,-35,23,-8-stride*.5,'#c09a79',7);
  civOval(c,-23,-6+stride*.5,5,4,'#d1a287');civOval(c,23,-8-stride*.5,5,4,'#d1a287');
  civLine(c,-18,0,19,0,trim,4);civOval(c,4,0,4,3,'#e9ca7c');
  civOval(c,0,-45,15,18,'#c99d7b');
  if(era==='antiga'){
    civPoly(c,[[-17,-57],[17,-57],[14,-67],[-14,-67]],'#bb914b');
    civPoly(c,[[-10,-67],[10,-67],[4,-78],[-4,-78]],'#e6cb7f');
  }else if(era==='medieval'){
    civPoly(c,[[-17,-51],[-13,-66],[0,-74],[13,-66],[17,-51]],'#8796a2','#3f4b53');
    civLine(c,-15,-56,15,-56,'#d2d4cd',3);
  }else{
    civOval(c,0,-59,24,8,'#704737');
    civPoly(c,[[-15,-59],[-7,-73],[13,-71],[18,-59]],'#77503d');
    civLine(c,11,-67,18,-82,'#e2b879',3);
  }
  if(back)civOval(c,0,-45,11,12,'#645047');else{
    civOval(c,5,-45,2,2,'#31302b');if(!facing.includes('right')&&!left)civOval(c,-6,-45,2,2,'#31302b');
    civLine(c,-4,-34,6,-34,'#a57b5e',1.5);
  }
  // Artefato mágico visível na mão em todas as eras.
  civOval(c,29,-12,7,8,era==='antiga'?'#ffd691':era==='medieval'?'#a9e2ed':'#dbacfc');
  civOval(c,29,-13,3,3,'#fff4da');
}
function civScarab(c,frame){
  c.translate(55,76+[0,-2,0,-1][frame]);
  for(const [x,y] of [[-23,-11],[-16,4],[0,10],[16,4],[23,-11]]){civLine(c,x,y,x+(x<0?-13:13),y+15,'#685338',5);}
  civOval(c,0,-11,29,23,'#9d713b');civOval(c,0,-16,25,20,'#387878');
  civPoly(c,[[-22,-19],[-6,-32],[0,-9],[-4,8]],'#6daca0');civPoly(c,[[22,-19],[6,-32],[0,-9],[4,8]],'#2d5d68');
  civOval(c,0,-8,4,4,'#dfbd67');civOval(c,-10,-31,4,3,'#e1b873');civOval(c,10,-31,4,3,'#e1b873');
}
function civSandstone(c,frame){
  c.translate(55,80+[0,-2,0,-1][frame]);
  for(const x of [-19,19]){civPoly(c,[[x-9,-5],[x+7,-5],[x+11,21],[x-10,21]],'#8c744c');}
  civPoly(c,[[-28,-38],[24,-38],[30,-5],[-30,-5]],'#c4a66b','#7f694f');
  civPoly(c,[[-32,-45],[31,-45],[25,-69],[-24,-67]],'#d6bd84');
  civPoly(c,[[-23,-76],[23,-76],[19,-49],[-21,-49]],'#bea071');
  civOval(c,-10,-65,3,4,'#b8e8d4');civOval(c,10,-65,3,4,'#b8e8d4');
  civLine(c,-30,-32,-35,6,'#927b55',9);civLine(c,30,-32,35,6,'#927b55',9);
}
function civJackal(c,frame){
  c.translate(55,75+[0,-3,0,-1][frame]);const step=[-3,3,-2,2][frame];
  civPoly(c,[[-35,-21],[-54,-45],[-49,-7]],'#424443');
  for(const x of [-24,-3,18,29]){civLine(c,x,-8,x+2,19+(x%2?step:-step),'#484742',8);}
  civOval(c,-7,-19,36,22,'#544d42');civOval(c,18,-32,26,19,'#474744');
  civPoly(c,[[16,-42],[19,-68],[29,-47]],'#454640');civPoly(c,[[28,-44],[39,-65],[39,-33]],'#454640');
  civPoly(c,[[34,-30],[56,-22],[40,-12]],'#595044');civOval(c,34,-32,3,3,'#e0cc71');
  civLine(c,40,-15,52,-20,'#d0a879',3);
}
function civWolf(c,frame){
  c.translate(52,75+[0,-3,0,-1][frame]);const stride=[-4,3,4,-3][frame];
  civPoly(c,[[-27,-26],[-52,-42],[-42,-12]],'#455363');
  for(const x of [-25,-3,17,31])civLine(c,x,-5,x+3,18+(x%2?stride:-stride),'#33404e',8);
  civOval(c,0,-22,34,21,'#64758a');civOval(c,23,-29,22,21,'#445263');
  civPoly(c,[[9,-40],[13,-65],[27,-46]],'#354755');civPoly(c,[[26,-45],[37,-63],[40,-37]],'#354755');
  civPoly(c,[[31,-26],[57,-17],[39,-9]],'#7d8b8c');civOval(c,34,-34,3,3,'#f1d4ad');
}
function civGargoyle(c,frame){
  c.translate(54,80+[0,-4,0,-2][frame]);
  civPoly(c,[[-12,-25],[-42,-53],[-51,-20],[-45,5],[-21,-3]],'#677e90');
  civPoly(c,[[13,-25],[40,-53],[53,-20],[46,5],[21,-3]],'#465f74');
  for(const x of [-15,15]){civLine(c,x,-1,x+2,18,'#394a56',10);}
  civOval(c,0,-21,24,26,'#6e8799');civOval(c,0,-50,16,17,'#9ab1b5');
  civPoly(c,[[-10,-57],[-19,-79],[-2,-62]],'#7e959e');civPoly(c,[[10,-57],[19,-79],[2,-62]],'#7e959e');
  civOval(c,-7,-51,3,3,'#f0d47e');civOval(c,8,-51,3,3,'#f0d47e');
}
function civKnight(c,frame){
  c.translate(55,82+[0,-2,0,-1][frame]);
  for(const x of [-14,14]){civPoly(c,[[x-8,-10],[x+7,-10],[x+9,21],[x-9,21]],'#4e5964');}
  civPoly(c,[[-26,-43],[27,-43],[25,-5],[-24,-5]],'#8094a1','#40515d');
  civPoly(c,[[-18,-47],[19,-47],[12,-66],[-13,-66]],'#a6b8bd');
  civOval(c,0,-66,19,17,'#899eaa');
  civPoly(c,[[-16,-79],[15,-79],[8,-88],[-10,-88]],'#b7c0b9');
  civLine(c,-26,-29,-35,3,'#a7bbc3',9);civLine(c,26,-30,34,1,'#778b93',9);
  civLine(c,-6,-65,7,-65,'#33414c',4);civOval(c,0,-20,4,4,'#f0d28a');
}
function civAutomaton(c,frame){
  c.translate(55,79+[0,-2,0,-1][frame]);
  for(const x of [-18,17]){civLine(c,x,-6,x+2,22,'#735c3b',11);civOval(c,x+2,22,10,5,'#3e5147');}
  civPoly(c,[[-27,-44],[26,-44],[30,-5],[-29,-5]],'#a98346','#715b3c');
  civOval(c,0,-28,17,17,'#6a867b');civOval(c,0,-28,10,10,'#d8b87a');civOval(c,0,-28,4,4,'#5b6b64');
  civOval(c,0,-57,20,20,'#c6a76b');
  for(const x of [-9,9])civOval(c,x,-60,4,3,'#8de6df');
  civLine(c,-29,-33,-39,2,'#b59c6d',9);civLine(c,29,-33,39,2,'#b59c6d',9);
  civLine(c,0,-77,0,-90,'#7d7353',3);civOval(c,0,-91,5,5,'#e9ce92');
}
function civChimera(c,frame){
  c.translate(54,81+[0,-4,0,-2][frame]);
  civPoly(c,[[-29,-24],[-48,-44],[-52,-13],[-32,4]],'#86b9aa');
  civPoly(c,[[29,-24],[48,-44],[52,-13],[32,4]],'#6897a2');
  civOval(c,0,-18,25,27,'#65a9a3');civOval(c,0,-46,18,18,'#a4cfb4');
  civPoly(c,[[-15,-53],[-22,-76],[-2,-62]],'#b4dda9');civPoly(c,[[15,-53],[22,-76],[2,-62]],'#c1e3c2');
  civOval(c,-6,-45,3.3,3.3,'#f2e2a4');civOval(c,7,-45,3.3,3.3,'#f2e2a4');
  for(const x of [-14,14])civLine(c,x,1,x,17,'#5a8d85',8);
}
function civSentry(c,frame){
  c.translate(54,80+[0,-2,0,-1][frame]);
  for(const x of [-14,14]){civLine(c,x,-1,x,23,'#5c685b',9);}
  civPoly(c,[[-24,-44],[25,-44],[32,-5],[-31,-5]],'#bca36c','#7d765b');
  civOval(c,0,-29,20,19,'#d0b57d');civOval(c,0,-29,11,12,'#507a79');
  civPoly(c,[[-20,-50],[-14,-72],[14,-72],[22,-50]],'#b5a27a');
  civOval(c,0,-64,19,13,'#d1ba8f');civOval(c,-7,-64,3,3,'#70dccc');civOval(c,8,-64,3,3,'#70dccc');
  civLine(c,-27,-29,-38,-1,'#a8a386',10);civLine(c,27,-29,38,-1,'#a8a386',10);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;civLine(c,Math.cos(a)*11,Math.sin(a)*11-29,Math.cos(a)*19,Math.sin(a)*19-29,'#a38b56',3);}
}
const PAINTERS={
  'escaravelho':civScarab,'guardiao-de-arenito':civSandstone,'espirito-chacal':civJackal,
  'lobo-sombrio':civWolf,'gargula':civGargoyle,'cavaleiro-encantado':civKnight,
  'automato':civAutomaton,'quimera-alquimica':civChimera,'sentinela-de-bronze':civSentry
};
export function civilizationPlayerTexture(era,facing,frame){return `era-${era}-player-${CIV_FACINGS.includes(facing)?facing:'down'}-${frame%4}`;}
export function civilizationCreatureTexture(era,species,flip,frame){return `era-${era}-${species}-${flip?'left':'right'}-${frame%4}`;}
export function civilizationBossTexture(era,flip,frame){return `era-${era}-boss-${flip?'left':'right'}-${frame%4}`;}
export function createCivilizationArt(scene,era){
  if(!CIVILIZATION_SPECIES[era])throw new Error('Era inválida');
  for(const facing of CIV_FACINGS)for(let frame=0;frame<4;frame++)
    civTexture(scene,civilizationPlayerTexture(era,facing,frame),100,122,c=>civHuman(c,era,facing,frame));
  for(const species of CIVILIZATION_SPECIES[era])for(const flip of [false,true])for(let frame=0;frame<4;frame++){
    civTexture(scene,civilizationCreatureTexture(era,species,flip,frame),112,112,c=>{
      if(flip){c.translate(112,0);c.scale(-1,1);}
      PAINTERS[species](c,frame);
    });
  }
  for(const flip of [false,true])for(let frame=0;frame<4;frame++){
    civTexture(scene,civilizationBossTexture(era,flip,frame),174,182,c=>{
      c.translate(19,30);c.scale(1.23,1.22);
      if(flip){c.translate(112,0);c.scale(-1,1);}
      const prototype=CIVILIZATION_SPECIES[era][era==='antiga'?1:era==='medieval'?1:0];
      PAINTERS[prototype](c,frame);
      c.fillStyle=era==='antiga'?'#f7df8d':era==='medieval'?'#cce1f1':'#efcd8e';
      c.beginPath();c.moveTo(30,14);c.lineTo(41,-7);c.lineTo(54,7);c.lineTo(68,-7);c.lineTo(80,14);c.closePath();c.fill();
    });
  }
}
