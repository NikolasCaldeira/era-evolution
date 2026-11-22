/** Melhorias por fragmentos. Três cartas distintas por rodada. */
export const UPGRADES=Object.freeze({
  alcance:{title:'Visão de Caçador',description:'+17% de alcance para todas as armas.'},
  cadencia:{title:'Ritmo Ancestral',description:'Projéteis disparados mais frequentemente.'},
  velocidade:{title:'Passos Ligeiros',description:'+26 de velocidade de movimento.'},
  potencia:{title:'Energia Concentrada',description:'Fortalece os ataques (a cada 3 cargas, +1 dano).'},
  ima:{title:'Chamar Fragmentos',description:'Aumenta o alcance magnético: fragmentos voam até você de mais longe.'},
  cura:{title:'Recuperação',description:'Restaura até 2 de vida e afasta criaturas.'}
});
export const UPGRADE_CAPS=Object.freeze({alcance:Infinity,cadencia:4,velocidade:Infinity,potencia:Infinity,ima:Infinity,cura:Infinity});

export class UpgradeState {
  constructor(){this.reset();}
  reset(){this.levels={alcance:0,cadencia:0,velocidade:0,potencia:0,ima:0,cura:0};}
  choices({health,maxHealth,random=Math.random}={}){
    const available=Object.keys(UPGRADES).filter(id=>{
      if(id==='cura'&&health>=maxHealth)return false;
      return this.levels[id]<UPGRADE_CAPS[id];
    });
    // Em caso de todas as melhorias maximizadas, permitir recuperação como recurso de emergência.
    if(available.length<3)for(const id of Object.keys(UPGRADES))if(!available.includes(id))available.push(id);
    for(let i=available.length-1;i>0;i--){
      const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));
      [available[i],available[j]]=[available[j],available[i]];
    }
    return available.slice(0,3);
  }
  apply(id){
    if(!UPGRADES[id])return false;
    if(this.levels[id]>=UPGRADE_CAPS[id])return false;
    this.levels[id]++;
    return true;
  }
  get rangeMultiplier(){return 1+this.levels.alcance*.17;}
  get pickupRadius(){return 35+this.levels.ima*22;}
  get damagePower(){return 1+this.levels.potencia;}
}
