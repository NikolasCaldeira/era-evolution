/** Chefes dos três capítulos em desenvolvimento. Mecânicas comuns, identidades distintas. */
export const CIVILIZATION_BOSSES=Object.freeze({
  antiga:Object.freeze({name:'GUARDIÃO DA ESFINGE',health:160,speed:81,color:0xf1c77e,charge:'AVANÇO DE ARENITO',stomp:'TERREMOTO DO TEMPLO',beam:'RAIO SOLAR',summon:'ESCARAVELHOS DESPERTAM'}),
  medieval:Object.freeze({name:'GÁRGULA COROADA',health:188,speed:95,color:0xb4d9ed,charge:'MERGULHO SOMBRIO',stomp:'ONDA DA FORTALEZA',beam:'OLHAR DE PEDRA',summon:'MATILHA DA NOITE'}),
  renascimento:Object.freeze({name:'AUTÔMATO MAGNO',health:220,speed:91,color:0xe9bd7b,charge:'ARRANCADA MECÂNICA',stomp:'ENGRENAGEM DE CHOQUE',beam:'FEIXE ALQUÍMICO',summon:'ENGENHOS DE APOIO'})
});
export class CivilizationBossState {
  constructor(era){this.config=CIVILIZATION_BOSSES[era];if(!this.config)throw new Error('Boss de era inválida');this.health=this.config.health;this.attackIndex=0;this.summons=0;}
  get alive(){return this.health>0;}
  get phase(){return this.health>this.config.health*.7?1:this.health>this.config.health*.35?2:3;}
  get healthRatio(){return Math.max(0,this.health/this.config.health);}
  takeDamage(damage){if(!this.alive)return false;this.health=Math.max(0,this.health-Math.max(1,Math.floor(damage)));return true;}
  chooseAttack(distance){
    const index=this.attackIndex++;
    if(this.phase===3&&this.summons<2&&index%5===0){this.summons++;return 'summon';}
    if(distance<130&&index%3===0)return 'stomp';
    if(distance>250&&index%3===0)return 'charge';
    return (this.phase===1?['charge','stomp','beam']:['beam','charge','stomp','beam'])[index%(this.phase===1?3:4)];
  }
  windupMs(){return Math.max(780,1250-(this.phase-1)*150);}
  cooldownMs(){return Math.max(1450,3550-(this.phase-1)*560);}
}
export function withinBossBeam(from,to,player,width=35){
  const dx=to.x-from.x,dy=to.y-from.y,len2=dx*dx+dy*dy;
  if(len2<1)return Math.hypot(player.x-from.x,player.y-from.y)<width;
  const t=Math.max(0,Math.min(1,((player.x-from.x)*dx+(player.y-from.y)*dy)/len2));
  return Math.hypot(player.x-(from.x+dx*t),player.y-(from.y+dy*t))<=width;
}
