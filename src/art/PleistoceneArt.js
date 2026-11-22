/** Personagens originais do Pleistoceno desenhados em Canvas, sem assets externos. */
export const PLEISTOCENE_SPECIES=Object.freeze(['smilodonte','rinoceronte-lanoso','mamute-jovem']);
const FACINGS=['down','down-right','right','up-right','up','up-left','left','down-left'];
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function poly(c,points,color,stroke=null){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function stroke(c,x,y,xx,yy,color,width){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function make(scene,key,w,h,draw){if(scene.textures.exists(key))return;const t=scene.textures.createCanvas(key,w,h),c=t.getContext();c.clearRect(0,0,w,h);c.save();draw(c);c.restore();t.refresh();}
function human(c,facing,frame){
  const flip=facing.includes('left'),back=facing.startsWith('up'),side=facing.includes('left')||facing.includes('right'),stride=[0,4,0,-4][frame],bounce=[0,-2,0,-1][frame];
  c.translate(48,78+bounce);c.scale(flip?-1:1,1);
  // Botas de couro e leggings de pele
  poly(c,[[-13,1],[-3,1],[-5,21+stride],[-18,23+stride]],'#604638','#3e3732');
  poly(c,[[3,1],[13,1],[18,23-stride],[5,22-stride]],'#684c3b','#3e3732');
  oval(c,-12,23+stride,10,4,'#332e2b');oval(c,12,23-stride,10,4,'#332e2b');
  poly(c,[[-18,-34],[15,-35],[21,10],[-21,9]],'#9a7757','#503f39');
  // Pelego aberto sobre lã escura
  poly(c,[[-14,-29],[13,-30],[16,9],[-15,10]],'#5a686a','#344851');
  poly(c,[[0,-28],[14,-28],[14,9],[0,9]],'#3c5b63');
  if(back){poly(c,[[-11,-27],[11,-27],[13,-1],[-13,-1]],'#71503f','#483a32');stroke(c,-7,-25,5,-2,'#dbc49c',3);}
  poly(c,[[-16,-3],[17,-3],[17,4],[-16,4]],'#4b3530');oval(c,0,0,4,3,'#d1b47d');
  stroke(c,-18,-24,-22,-4-stride*.6,'#b98e73',8);stroke(c,18,-24,22,-5+stride*.6,'#b98e73',8);
  oval(c,-22,-5-stride*.6,5,5,'#d1a282');oval(c,22,-5+stride*.6,5,5,'#d1a282');
  // Artefato de energia gelada: estilo fantástico, distinto do Cretáceo
  poly(c,[[17,-8],[25,-10],[29,-2],[20,1]],'#5f6662');oval(c,28,-7,6,8,'#90e8f0');oval(c,28,-8,3,4,'#f5ffff');
  // Pele e cabelos longos, capuz de pêlo
  oval(c,0,-38,16,19,'#c99e83');oval(c,0,-52,19,9,'#4b3d38');
  oval(c,-15,-43,7,17,'#8b715d');oval(c,15,-43,7,17,'#8b715d');
  if(back){oval(c,0,-42,13,12,'#675147');}else{
    oval(c,-6+(side?6:0),-39,1.8,2.2,'#2d302b');if(!side)oval(c,6,-39,1.8,2.2,'#2d302b');
    stroke(c,-4,-31,5,-31,'#93664c',2);
  }
  stroke(c,-14,-27,13,-27,'#dfcfb3',8);
  for(let i=-1;i<=1;i++)oval(c,i*8,-26,4,4,'#f3e0bf');
}
function smilodon(c,frame,flip){
  c.translate(55,80+[0,-2,0,-1][frame]);c.scale(flip?-1:1,1);const a=[0,4,0,-4][frame];
  // cauda baixa, patas musculosas, juba felina
  stroke(c,-22,-13,-48,-11,'#a9794d',8);oval(c,-46,-11,6,5,'#9b6848');
  for(const [x,d] of [[-19,a],[-4,-a],[13,a],[24,-a]]){
    stroke(c,x,-2,x-2,21+d,'#785f49',9);oval(c,x-3,21+d,8,4,'#4c5147');
  }
  oval(c,-2,-14,34,19,'#b48f61');oval(c,8,-21,22,15,'#cfae81');oval(c,13,-28,21,22,'#8a6e52');
  oval(c,31,-29,18,15,'#c5a276');
  poly(c,[[20,-38],[18,-55],[29,-46]],'#9d7857');poly(c,[[32,-41],[40,-55],[42,-36]],'#95704d');
  oval(c,35,-29,3.5,3.2,'#f5dfb2');oval(c,36,-29,1.6,2.0,'#303c39');
  poly(c,[[38,-19],[42,-1],[46,-20]],'#fff0d1');poly(c,[[29,-20],[30,-1],[37,-22]],'#f8e2c3');
  oval(c,45,-18,8,4,'#594d43');
}
function rhino(c,frame,flip){
  c.translate(52,80+[0,-1,0,-1][frame]);c.scale(flip?-1:1,1);const a=[0,2,0,-2][frame];
  for(const [x,d] of [[-22,a],[-4,-a],[12,a],[26,-a]]){
    poly(c,[[x-7,-6],[x+6,-6],[x+10,22+d],[x-8,22+d]],'#79634f');oval(c,x+1,22+d,10,4,'#504840');
  }
  oval(c,-8,-18,39,26,'#806b59');oval(c,-8,-26,33,20,'#ad9075');
  for(let i=0;i<8;i++)stroke(c,-28+i*7,-27,-28+i*7,-37-(i%3)*4,'#b8a089',3);
  oval(c,24,-14,24,21,'#977c65');oval(c,40,-10,17,12,'#b5a08a');
  poly(c,[[38,-18],[42,-52],[51,-20]],'#f1e3c7','#ccc5b6');
  oval(c,36,-18,3,3,'#f8e8c2');oval(c,36.5,-18,1.5,1.7,'#2d3433');
  oval(c,48,-2,3.8,2.5,'#4b4741');
}
function mammoth(c,frame,flip){
  c.translate(52,80+[0,-1,0,-2][frame]);c.scale(flip?-1:1,1);const a=[0,3,0,-3][frame];
  for(const [x,d] of [[-23,a],[-6,-a],[12,a],[25,-a]]){
    poly(c,[[x-7,-6],[x+7,-6],[x+9,22+d],[x-9,22+d]],'#705648');oval(c,x,22+d,9,4,'#463c37');
  }
  oval(c,-10,-20,42,30,'#8b6e52');
  oval(c,-12,-27,36,25,'#9c7959');
  for(let i=0;i<9;i++)stroke(c,-38+i*8,-30,-35+i*8,-37-(i%3)*5,'#6a5344',4);
  oval(c,23,-23,26,26,'#9b795a');oval(c,31,-36,13,14,'#a98968');
  oval(c,10,-26,14,18,'#715644');
  // tromba e presas curvadas, estética não violenta
  stroke(c,39,-13,43,7,'#9c795a',15);stroke(c,43,7,39,12,'#9c795a',11);
  c.beginPath();c.moveTo(29,-9);c.quadraticCurveTo(49,16,62,-2);c.strokeStyle='#e9dcc2';c.lineWidth=6;c.stroke();
  oval(c,33,-29,4,4,'#e9d7b7');oval(c,34,-29,1.6,2,'#2a302e');
}
export function createPleistoceneArt(scene){
  for(const facing of FACINGS)for(let frame=0;frame<4;frame++)make(scene,`era2-player-${facing}-${frame}`,96,116,c=>human(c,facing,frame));
  for(const species of PLEISTOCENE_SPECIES)for(const flip of [false,true])for(let frame=0;frame<4;frame++){
    make(scene,`era2-${species}-${flip?'left':'right'}-${frame}`,112,110,c=>{
      if(species==='smilodonte')smilodon(c,frame,flip);
      else if(species==='rinoceronte-lanoso')rhino(c,frame,flip);
      else mammoth(c,frame,flip);
    });
  }
}
export function pleistocenePlayerTexture(facing,frame){return `era2-player-${FACINGS.includes(facing)?facing:'down'}-${frame%4}`;}
export function pleistoceneCreatureTexture(species,flip,frame){return `era2-${species}-${flip?'left':'right'}-${frame%4}`;}
