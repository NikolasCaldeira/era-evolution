/** Chefes das Eras VI–IX: três conjuntos de ataques e avisos geométricos. */
export const MODERN_BOSSES=Object.freeze({
  industrial:Object.freeze({
    name:'TITÃ A VAPOR',health:390,speed:80,color:0xf2bd7a,
    attacks:['steamline','pressureburst','slagfall','steamline'],
    attackNames:{steamline:'JATO DE VAPOR',pressureburst:'EXPLOSÃO DA CALDEIRA',slagfall:'CHUVA DE ESCÓRIA',summon:'MÁQUINAS AUXILIARES'},
    hint:'VAPOR · CALDEIRA · ESCÓRIA · APOIO'
  }),
  contemporanea:Object.freeze({
    name:'COLOSSO BLINDADO',health:445,speed:98,color:0xa0d5e9,
    attacks:['roadcharge','signalburst','streetmines','roadcharge'],
    attackNames:{roadcharge:'INVESTIDA BLINDADA',signalburst:'VARREDURA DE SINAL',streetmines:'ZONA DE ALERTA',summon:'DRONES DE APOIO'},
    hint:'INVESTIDA · VARREDURA · ZONAS DE ALERTA · APOIO'
  }),
  digital:Object.freeze({
    name:'NÚCLEO CORROMPIDO',health:510,speed:104,color:0x9cf8df,
    attacks:['datagrid','glitchring','packetstorm','datagrid'],
    attackNames:{datagrid:'GRADE DE DADOS',glitchring:'PULSO CORROMPIDO',packetstorm:'TEMPESTADE DE PACOTES',summon:'CÓPIAS DIGITAIS'},
    hint:'GRADE · PULSO · PACOTES · CÓPIAS'
  }),
  espacial:Object.freeze({
    name:'SENTINELA ORBITAL',health:575,speed:112,color:0xa2dcf9,
    attacks:['orbitalbeam','gravitywell','meteorstorm','plasmaring'],
    attackNames:{orbitalbeam:'FEIXES ORBITAIS',gravitywell:'POÇO GRAVITACIONAL',meteorstorm:'TEMPESTADE DE METEOROS',plasmaring:'ANEL DE PLASMA',summon:'REFORÇOS CÓSMICOS'},
    hint:'FEIXES · GRAVIDADE · METEOROS · PLASMA · APOIO'
  })
});
const point=(x,y)=>({x,y});
const length=(v)=>Math.hypot(v.x,v.y);
/** O mesmo conjunto de formas determina aviso no chão e colisão. */
export function modernAttackPlan(era,type,from,target){
  if(!MODERN_BOSSES[era])throw new Error('Chefe moderno inválido');
  if(type==='summon')return [{kind:'circle',x:from.x,y:from.y,radius:84,warningOnly:true}];
  const dx=target.x-from.x,dy=target.y-from.y,d=Math.hypot(dx,dy)||1;
  const dir=point(dx/d,dy/d),side=point(-dir.y,dir.x);
  const line=(offset,reach,radius,turn=0)=>{
    const cx=from.x+side.x*offset,cy=from.y+side.y*offset-10;
    const angle=Math.atan2(dir.y,dir.x)+turn;
    return {kind:'line',from:point(cx,cy),to:point(cx+Math.cos(angle)*reach,cy+Math.sin(angle)*reach),radius};
  };
  const circle=(x,y,radius)=>({kind:'circle',x,y,radius});
  switch(type){
    case 'steamline':return [line(0,465,32),line(67,370,13)];
    case 'pressureburst':return [{kind:'ring',x:from.x,y:from.y,inner:64,outer:180}];
    case 'slagfall':return [-1,0,1].map(i=>circle(target.x+side.x*77*i,target.y+side.y*77*i,35));
    case 'roadcharge':return [line(0,Math.max(285,Math.min(590,d+100)),33)];
    case 'signalburst':return [{kind:'cone',x:from.x,y:from.y-9,angle:Math.atan2(dy,dx),reach:320,halfAngle:.42}];
    case 'streetmines':return [circle(target.x,target.y,44),circle(target.x+side.x*116,target.y+side.y*116,36),circle(target.x-side.x*116,target.y-side.y*116,36)];
    case 'datagrid':return [-85,0,85].map(offset=>line(offset,485,17));
    case 'glitchring':return [{kind:'ring',x:from.x,y:from.y,inner:83,outer:197}];
    case 'packetstorm':return [-1,0,1].map(i=>circle(target.x+side.x*i*100+dir.x*55*(i%2),target.y+side.y*i*100+dir.y*55*(i%2),39));
    case 'orbitalbeam':return [-78,0,78].map(offset=>line(offset,510,22));
    case 'gravitywell':return [circle(target.x,target.y,67)];
    case 'meteorstorm':return [-1,0,1].map(i=>circle(target.x+side.x*i*96+dir.x*(i===0?40:0),target.y+side.y*i*96+dir.y*(i===0?40:0),42));
    case 'plasmaring':return [{kind:'ring',x:from.x,y:from.y,inner:92,outer:208}];
    default:throw new Error(`Ataque moderno inexistente: ${type}`);
  }
}
export function modernShapeHits(shape,target,radius=10){
  if(shape.warningOnly)return false;
  if(shape.kind==='line'){
    const dx=shape.to.x-shape.from.x,dy=shape.to.y-shape.from.y,l2=dx*dx+dy*dy;
    const t=l2<1?0:Math.max(0,Math.min(1,((target.x-shape.from.x)*dx+(target.y-shape.from.y)*dy)/l2));
    return Math.hypot(target.x-shape.from.x-dx*t,target.y-shape.from.y-dy*t)<=shape.radius+radius;
  }
  const d=Math.hypot(target.x-shape.x,target.y-shape.y);
  if(shape.kind==='circle')return d<=shape.radius+radius;
  if(shape.kind==='ring')return d>=shape.inner-radius&&d<=shape.outer+radius;
  if(shape.kind==='cone'){
    const da=Math.atan2(target.y-shape.y,target.x-shape.x)-shape.angle;
    const normalized=Math.atan2(Math.sin(da),Math.cos(da));
    return d<=shape.reach+radius&&Math.abs(normalized)<=shape.halfAngle+Math.atan2(radius,Math.max(1,d));
  }
  return false;
}
export function modernAttackHits(shapes,target,radius=10){return shapes.some(s=>modernShapeHits(s,target,radius));}
export class ModernBossState {
  constructor(era){this.config=MODERN_BOSSES[era];if(!this.config)throw Error('Chefe de era não existente');this.health=this.config.health;this.attackIndex=0;this.summons=0;}
  get alive(){return this.health>0;}
  get phase(){return this.health>Math.round(this.config.health*.7)?1:this.health>Math.round(this.config.health*.35)?2:3;}
  get healthRatio(){return Math.max(0,this.health/this.config.health);}
  takeDamage(damage){if(!this.alive)return false;this.health=Math.max(0,this.health-Math.max(1,Math.floor(damage)));return true;}
  chooseAttack(){const index=this.attackIndex++;if(this.phase===3&&this.summons<2&&index%5===0){this.summons++;return 'summon';}return this.config.attacks[index%this.config.attacks.length];}
  windupMs(){return Math.max(900,1500-(this.phase-1)*180);}
  cooldownMs(){return Math.max(1750,3520-(this.phase-1)*450);}
}
