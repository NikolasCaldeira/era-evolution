/** Ciclo 13 — Ataques diferenciados com geometria idêntica para aviso e colisão.
 * Todas as funções são puras: podem ser testadas sem Phaser.
 */
export const CIVILIZATION_BOSSES=Object.freeze({
  antiga:Object.freeze({
    name:'GUARDIÃO DA ESFINGE',health:210,speed:78,color:0xf1c77e,
    attackNames:{sandfan:'LEQUE DE AREIA',quicksand:'AREIAS MOVEDIÇAS',sunray:'RAIO SOLAR',summon:'ESCARAVELHOS DESPERTAM'},
    attacks:['sandfan','quicksand','sunray','sandfan'],
    hint:'LEQUE DE AREIA · AREIAS MOVEDIÇAS · RAIO SOLAR · APOIO'
  }),
  medieval:Object.freeze({
    name:'GÁRGULA COROADA',health:270,speed:92,color:0xa7d5eb,
    attackNames:{dive:'MERGULHO SOMBRIO',runefall:'CHUVA DE RUNAS',stonegaze:'OLHAR PETRIFICANTE',summon:'MATILHA DA NOITE'},
    attacks:['dive','runefall','stonegaze','runefall'],
    hint:'MERGULHO · RUNAS · PETRIFICAÇÃO · APOIO'
  }),
  renascimento:Object.freeze({
    name:'AUTÔMATO MAGNO',health:330,speed:86,color:0xe9bd7b,
    attackNames:{gearring:'ANEL DE ENGRENAGENS',piston:'PISTÕES DE IMPACTO',arcbeam:'FEIXES PARALELOS',summon:'ENGENHOS DE APOIO'},
    attacks:['gearring','piston','arcbeam','piston'],
    hint:'ENGRENAGENS · PISTÕES · FEIXES · APOIO'
  })
});

const point=(x,y)=>({x,y});
const rotate=(v,angle)=>point(v.x*Math.cos(angle)-v.y*Math.sin(angle),v.x*Math.sin(angle)+v.y*Math.cos(angle));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/** Congela a mira ao começar o aviso. A colisão usa precisamente as mesmas formas. */
export function makeBossAttackPlan(era,type,origin,target){
  if(!CIVILIZATION_BOSSES[era])throw new Error('Era inválida');
  if(type==='summon')return [{kind:'circle',x:origin.x,y:origin.y,radius:86,warningOnly:true}];
  const delta=point(target.x-origin.x,target.y-origin.y);
  const len=Math.hypot(delta.x,delta.y)||1;
  const dir=point(delta.x/len,delta.y/len),side=point(-dir.y,dir.x);
  const line=(offset,length,width,turn=0)=>{
    const shifted=point(origin.x+side.x*offset,origin.y+side.y*offset-12);
    const ray=rotate(dir,turn);
    return {kind:'line',from:shifted,to:point(shifted.x+ray.x*length,shifted.y+ray.y*length),radius:width};
  };
  const circle=(x,y,radius)=>({kind:'circle',x,y,radius});
  switch(type){
    case 'sandfan':return [-.29,0,.29].map(angle=>line(0,440,18,angle));
    case 'sunray':return [line(0,520,27)];
    case 'quicksand':return [circle(target.x,target.y,57),circle(target.x+side.x*105,target.y+side.y*105,43)];
    case 'dive':return [line(0,Math.min(580,Math.max(270,len+75)),30)];
    case 'runefall':return [-1,0,1].map(i=>circle(target.x+side.x*i*90,target.y+side.y*i*90,36));
    case 'stonegaze':return [{kind:'cone',x:origin.x,y:origin.y-15,angle:Math.atan2(dir.y,dir.x),reach:280,halfAngle:.38}];
    case 'gearring':return [{kind:'ring',x:origin.x,y:origin.y,inner:72,outer:155}];
    case 'piston':return [circle(target.x,target.y,40),circle(target.x+dir.x*95+side.x*56,target.y+dir.y*95+side.y*56,34),circle(target.x+dir.x*95-side.x*56,target.y+dir.y*95-side.y*56,34)];
    case 'arcbeam':return [line(-48,480,21),line(48,480,21)];
    default:throw new Error(`Ataque não configurado: ${type}`);
  }
}

export function withinBossBeam(from,to,player,width=35){
  const dx=to.x-from.x,dy=to.y-from.y,len2=dx*dx+dy*dy;
  if(len2<1)return distance(player,from)<=width;
  const t=Math.max(0,Math.min(1,((player.x-from.x)*dx+(player.y-from.y)*dy)/len2));
  return Math.hypot(player.x-(from.x+dx*t),player.y-(from.y+dy*t))<=width;
}
export function bossShapeHits(shape,player,playerRadius=10){
  if(shape.warningOnly)return false;
  if(shape.kind==='line')return withinBossBeam(shape.from,shape.to,player,shape.radius+playerRadius);
  const d=Math.hypot(player.x-shape.x,player.y-shape.y);
  if(shape.kind==='circle')return d<=shape.radius+playerRadius;
  if(shape.kind==='ring')return d>=shape.inner-playerRadius&&d<=shape.outer+playerRadius;
  if(shape.kind==='cone'){
    if(d>shape.reach+playerRadius||d<1)return false;
    const a=Math.atan2(player.y-shape.y,player.x-shape.x);
    const delta=Math.atan2(Math.sin(a-shape.angle),Math.cos(a-shape.angle));
    return Math.abs(delta)<=shape.halfAngle+Math.atan2(playerRadius,Math.max(1,d));
  }
  return false;
}
export function bossAttackHits(shapes,player,playerRadius=10){return shapes.some(shape=>bossShapeHits(shape,player,playerRadius));}

export class CivilizationBossState {
  constructor(era){this.config=CIVILIZATION_BOSSES[era];if(!this.config)throw new Error('Boss de era inválida');this.health=this.config.health;this.attackIndex=0;this.summons=0;}
  get alive(){return this.health>0;}
  get phase(){return this.health>Math.round(this.config.health*.7)?1:this.health>Math.round(this.config.health*.35)?2:3;}
  get healthRatio(){return Math.max(0,this.health/this.config.health);}
  takeDamage(damage){if(!this.alive)return false;this.health=Math.max(0,this.health-Math.max(1,Math.floor(damage)));return true;}
  chooseAttack(_distance){
    const index=this.attackIndex++;
    if(this.phase===3&&this.summons<2&&index%5===0){this.summons++;return 'summon';}
    // Primeira fase apresenta os padrões com um aviso amplo; fases posteriores
    // alternam todos os golpes, incluindo os que exigem mudança de posicionamento.
    return this.config.attacks[index%this.config.attacks.length];
  }
  windupMs(){return Math.max(880,1490-(this.phase-1)*165);}
  cooldownMs(){return Math.max(1750,3600-(this.phase-1)*490);}
}
