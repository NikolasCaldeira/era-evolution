/** Arte original em Canvas. Sem dependências de imagens externas ou sprites de terceiros.
 *  Gera quadros 2D com oito direções do protagonista e três espécies distintas.
 */
const PLAYER_FACINGS = ['down','down-right','right','up-right','up','up-left','left','down-left'];
const CREATURE_SPECIES = ['compsognato','anquilossauro','pterossauro'];
const PLAYER_FRAMES = 4;
const CREATURE_FRAMES = 4;

function oval(ctx, x, y, rx, ry, fill, rotation=0) {
  ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();
}
function path(ctx, points, fill, stroke=null, lineWidth=2) {
  ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
}
function curve(ctx, points, fill, stroke=null, width=2) {
  ctx.beginPath();ctx.moveTo(...points[0]);
  for (let i=1;i+2<points.length;i+=3) ctx.bezierCurveTo(...points.slice(i,i+3).flat());
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function line(ctx,x1,y1,x2,y2,stroke,width=2) {
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
}
function fillTexture(scene,key,w,h,draw) {
  if(scene.textures.exists(key))return;
  const texture=scene.textures.createCanvas(key,w,h);
  const ctx=texture.getContext();ctx.clearRect(0,0,w,h);
  ctx.save(); draw(ctx);ctx.restore();texture.refresh();
}
function drawPlayer(ctx, facing, frame) {
  const isBack = facing.startsWith('up');
  const isSide = facing.includes('left') || facing.includes('right');
  const left = facing.includes('left');
  const stride = [0,4,0,-4][frame], bob = [0,-1,-2,-1][frame];
  ctx.translate(48,78+bob);
  ctx.scale(left?-1:1,1);
  const edge='#28392c', boots='#423b2b';
  // pernas / botas: pés visíveis durante as passadas
  path(ctx,[[-12,3],[-3,3],[-5,22+stride],[-17,23+stride]],'#635038',edge,2);
  path(ctx,[[3,3],[13,3],[17,23-stride],[5,23-stride]],'#6a5740',edge,2);
  oval(ctx,-11,23+stride,9,4,boots);oval(ctx,11,23-stride,9,4,boots);
  // manto curto, voltado para trás, e equipamento de sobrevivente fictício
  path(ctx,[[-21,-35],[14,-36],[23,8],[-23,9]],'#6c7950','#253f34',2.5);
  path(ctx,[[-15,-33],[13,-32],[15,12],[-16,12]],'#31736a','#193d3c',2.5);
  path(ctx,[[1,-32],[14,-32],[15,9],[1,9]],'#234e54');
  if (isBack) {
    // mochila e correias visíveis quando o jogador se afasta da câmera
    path(ctx,[[-11,-27],[11,-27],[13,-2],[-13,-2]],'#977348','#543d2a',2);
    line(ctx,-8,-25,5,-2,'#ceb078',3);line(ctx,9,-26,-4,-2,'#d4b87e',3);
    oval(ctx,0,-14,6,6,'#c7a56b');
  }
  // cinto, tira cruzada, botões e fivela dourada
  path(ctx,[[-16,-3],[17,-3],[17,4],[-16,4]],'#5a422e');
  oval(ctx,1,0,4,3,'#e0bb70');
  if(!isBack) line(ctx,-13,-32,11,-3,'#c7a66b',4);
  // braços alternando no caminhar
  line(ctx,-18,-25,-22,-4-stride*.6,'#bc8864',8);
  line(ctx,17,-24,22,-6+stride*.6,'#bc8864',8);
  oval(ctx,-22,-4-stride*.6,5,5,'#d3a175');
  oval(ctx,22,-6+stride*.6,5,5,'#d3a175');
  // luva e artefato luminoso de disparo (fantasia, não arma real)
  path(ctx,[[18,-8],[26,-10],[29,-3],[20,0]],'#85643c','#4a3c29',2);
  oval(ctx,28,-7,5,7,'#4cd6bd');oval(ctx,28,-9,2,3,'#e9ffee');
  // cabeça / cabelo / expressão direcional
  oval(ctx,0,-39,15,17,'#d6a77a');
  oval(ctx,-2,-52,16,8,'#4b3729');
  path(ctx,[[-17,-48],[-13,-56],[0,-58],[11,-54],[14,-49]],'#6b4a2e');
  if(isBack){
    oval(ctx,0,-40,13,11,'#6b4a2e');
    line(ctx,-8,-34,8,-34,'#c49a72',2);
  } else {
    const eyeShift = isSide ? 5 : 0;
    oval(ctx,-6+eyeShift,-39,1.7,2.1,'#263b39');
    if(!isSide)oval(ctx,6,-39,1.7,2.1,'#263b39');
    line(ctx,-3+eyeShift,-30,4+eyeShift,-31,'#9e6847',2);
  }
  // gola de pelo, marca registrada da primeira era
  line(ctx,-12,-27,11,-27,'#e5c991',6);
  oval(ctx,0,-28,8,3,'#c9b180');
  if(isSide) {
    oval(ctx,11,-39,4,5,'#c3946d');
  }
}

function drawCompsognato(ctx, frame, flip) {
  ctx.translate(52,74+[0,-2,0,-1][frame]);ctx.scale(flip?-1:1,1);
  const stride = [0,5,0,-5][frame];
  // cauda longa e arqueada, corpo estreito e pernas de corredor
  ctx.beginPath();ctx.moveTo(-12,-12);ctx.bezierCurveTo(-43,-12,-47,-35,-51,-39);ctx.bezierCurveTo(-46,-16,-35,-3,-10,-3);ctx.closePath();ctx.fillStyle='#558c5c';ctx.fill();
  line(ctx,-5,3,-14,23+stride,'#426847',7);
  line(ctx,8,4,14,22-stride,'#416744',7);
  line(ctx,-14,23+stride,-24,24+stride,'#354a31',4);
  line(ctx,14,22-stride,25,23-stride,'#354a31',4);
  oval(ctx,-3,-13,20,15,'#6d9f63',-.23);oval(ctx,-1,-20,13,5,'#9ac17a',-.23);
  // pescoço curvado e cabeça alongada, crista
  line(ctx,8,-17,18,-35,'#598d57',11);
  oval(ctx,25,-39,15,11,'#78ac6b',-.16);
  path(ctx,[[31,-38],[48,-32],[36,-27],[23,-29]],'#b8c783','#4c7250',1.2);
  path(ctx,[[14,-47],[18,-58],[24,-47]],'#cc8c58');
  oval(ctx,27,-41,3.3,3.3,'#fff1ca');oval(ctx,28,-41,1.5,2,'#263b29');
  // marcas distintas no dorso
  for(let i=0;i<4;i++)oval(ctx,-16+i*8,-22-(i%2),2.8,3.6,'#cfb56d');
  line(ctx,3,-5,17,0,'#568458',3);
}
function drawAnquilossauro(ctx,frame,flip) {
  ctx.translate(51,74+[0,-1,0,-1][frame]);ctx.scale(flip?-1:1,1);
  const step = [0,3,0,-3][frame];
  // cauda e ponta arredondada (não gráfica)
  line(ctx,-23,-2,-40,-13,'#617e4a',12);
  oval(ctx,-45,-15,10,8,'#718d50');
  for(const [x,y,d] of [[-18,6,step],[5,8,-step],[19,7,step]]) {
    path(ctx,[[x-5,y],[x+5,y],[x+8,y+16+d],[x-6,y+16+d]],'#516d43','#354b3e',2);
  }
  oval(ctx,-4,-13,34,23,'#678856');
  oval(ctx,-4,-19,28,15,'#9da769');
  for(const [x,y] of [[-24,-26],[-8,-31],[8,-30],[22,-23]])path(ctx,[[x-7,y+8],[x,y-10],[x+6,y+8]],'#b9a776','#556f51',1.8);
  for(const [x,y] of [[-17,-16],[0,-18],[17,-14]])oval(ctx,x,y,4,3,'#5a7048');
  oval(ctx,24,-7,18,13,'#83a56b');
  oval(ctx,35,-5,4.2,4,'#efe4b1');oval(ctx,36,-5,1.7,2.3,'#2b3c30');
  oval(ctx,41,1,5,2,'#5c744b');
}
function drawPterossauro(ctx,frame,flip) {
  ctx.translate(50,73+[0,-2,0,-1][frame]);ctx.scale(flip?-1:1,1);
  const wing = [0,3,0,-3][frame];
  // pterossauro terrestre: asas dobradas com membranas visíveis
  line(ctx,-6,-5,-16,20,'#4a7976',6);line(ctx,7,-5,14,20,'#4a7976',6);
  line(ctx,-16,20,-23,20,'#345e5b',3);line(ctx,14,20,23,20,'#345e5b',3);
  path(ctx,[[-6,-26],[-42,-35+wing],[-33,-4],[-4,5]],'#57968c','#2c5b59',2);
  path(ctx,[[7,-26],[37,-32-wing],[27,-4],[0,7]],'#49827d','#2e5d5a',2);
  line(ctx,-6,-26,-33,-4,'#b4c99d',2);line(ctx,7,-26,27,-4,'#b4c99d',2);
  oval(ctx,0,-15,12,21,'#80aaa0');
  line(ctx,4,-30,11,-43,'#649589',11);
  oval(ctx,14,-49,13,10,'#91b5a2');
  path(ctx,[[18,-48],[43,-44],[22,-39],[12,-40]],'#cfb07c','#5c7967',1.5);
  path(ctx,[[2,-52],[-6,-63],[13,-55]],'#ba8b64');
  oval(ctx,17,-50,3.7,3.5,'#f5efc7');oval(ctx,18,-50,1.4,1.8,'#283d38');
}

function drawCreature(ctx, species, frame, flip) {
  if(species==='compsognato')drawCompsognato(ctx,frame,flip);
  if(species==='anquilossauro')drawAnquilossauro(ctx,frame,flip);
  if(species==='pterossauro')drawPterossauro(ctx,frame,flip);
}

export function createCharacterArt(scene) {
  for (const facing of PLAYER_FACINGS) for(let frame=0;frame<PLAYER_FRAMES;frame++) {
    fillTexture(scene,`era-player-${facing}-${frame}`,96,116,ctx=>drawPlayer(ctx,facing,frame));
  }
  for(const species of CREATURE_SPECIES) for(const flip of [false,true]) for(let frame=0;frame<CREATURE_FRAMES;frame++) {
    fillTexture(scene,`era-${species}-${flip?'left':'right'}-${frame}`,112,110,ctx=>drawCreature(ctx,species,frame,flip));
  }
}
export function playerTexture(facing, frame){return `era-player-${PLAYER_FACINGS.includes(facing)?facing:'down'}-${frame%PLAYER_FRAMES}`;}
export function creatureTexture(species, toLeft, frame){return `era-${species}-${toLeft?'left':'right'}-${frame%CREATURE_FRAMES}`;}
export const creaturesList = CREATURE_SPECIES;
