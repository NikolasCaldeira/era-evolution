/** Arsenal do Cretáceo. Regras puras, sem dependências de renderização. */
export const WEAPONS = Object.freeze({
  artefato:{label:'Artefato Verde',desc:'Um disparo preciso de energia.',color:0x64f5d2,cooldown:650,speed:480,range:165,style:'pulse'},
  duplo:{label:'Gêmeos de Quartzo',desc:'Dois cristais disparados em paralelo.',color:0x70d9ff,cooldown:760,speed:495,range:175,style:'twin'},
  lanca:{label:'Lança Solar',desc:'Projétil que atravessa até três criaturas.',color:0xffd17b,cooldown:950,speed:560,range:225,style:'pierce'},
  leque:{label:'Leque Prismático',desc:'Três fragmentos em ângulos diferentes.',color:0xc69fff,cooldown:850,speed:465,range:185,style:'fan'},
  orbe:{label:'Orbe de Âmbar',desc:'Impacto circular que alcança criaturas próximas.',color:0xffae70,cooldown:1050,speed:360,range:190,style:'splash'}
});
export const WEAPON_ORDER=Object.freeze(Object.keys(WEAPONS));
const MILESTONE_ORDER=Object.freeze(['duplo','lanca','leque','orbe','artefato','duplo','lanca','leque','orbe']);

/** Nos primeiros quatro marcos aparecem novas armas; depois, versões evoluídas. */
export function weaponRewardForKills(kills){
  if(!Number.isInteger(kills)||kills<10||kills>90||kills%10!==0)return null;
  const index=kills/10-1;
  return {milestone:kills,id:MILESTONE_ORDER[index],tier:index<4?1:2,kind:index<4?'nova':'evolucao'};
}

export class WeaponState {
  constructor(){this.reset();}
  reset(){this.unlocked=['artefato'];this.levels={artefato:1};this.active='artefato';this.collectedMilestones=new Set();}
  get current(){return WEAPONS[this.active];}
  get tier(){return this.levels[this.active]||1;}
  collect(reward){
    if(!reward||!WEAPONS[reward.id]||this.collectedMilestones.has(reward.milestone))return false;
    this.collectedMilestones.add(reward.milestone);
    if(!this.unlocked.includes(reward.id))this.unlocked.push(reward.id);
    this.levels[reward.id]=Math.max(this.levels[reward.id]||0,reward.tier);
    this.active=reward.id;
    return true;
  }
  select(id){if(!this.unlocked.includes(id))return false;this.active=id;return true;}
  cycle(direction=1){
    const index=this.unlocked.indexOf(this.active);
    this.active=this.unlocked[(index+direction+this.unlocked.length)%this.unlocked.length];
    return this.active;
  }
}

/** Construção da salva, reutilizada no jogo e validada por testes unitários. */
export function createSalvo({weaponId='artefato',tier=1,power=1,from,target}){
  const w=WEAPONS[weaponId];if(!w)throw new Error('Arma desconhecida');
  const dx=target.x-from.x,dy=target.y-from.y;
  const base=Math.atan2(dy,dx);
  const angles=weaponId==='duplo'?[-0.105,0.105]:weaponId==='leque'?[-.24,0,.24]:[0];
  const damage=1+Math.floor((Math.max(1,power)-1)/3); // Até o primeiro aprimoramento de potência: 3 acertos por criatura.
  return angles.map((offset,i)=>{
    const angle=base+offset;
    const speed=w.speed*(1+(tier-1)*.07);
    const range=w.range*(1+(tier-1)*.12);
    return {
      type:weaponId,color:w.color,angle,
      x:from.x+Math.cos(angle)*19,y:from.y+Math.sin(angle)*19,
      vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      range,life:range/speed*1000+100,
      damage,hitRadius:weaponId==='lanca'?20:weaponId==='orbe'?19:15,
      maxHits:weaponId==='lanca'?2+tier:1,
      splashRadius:weaponId==='orbe'?42+(tier-1)*14:0,
      visualIndex:i
    };
  });
}

export function attackCooldown(weaponId,tier=1,cadence=0){
  const w=WEAPONS[weaponId];if(!w)throw new Error('Arma desconhecida');
  return Math.max(230,Math.round(w.cooldown*(1-.09*(tier-1))*(1-.12*Math.min(cadence,4))));
}
