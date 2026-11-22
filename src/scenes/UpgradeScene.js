import Phaser from 'phaser';
import { UPGRADES } from '../systems/UpgradeSystem.js';

/** Pausa o jogo e apresenta três melhorias únicas, também selecionáveis por 1/2/3. */
export class UpgradeScene extends Phaser.Scene {
  constructor(){super('UpgradeScene');}
  init(data){this.level=data.level||1;this.choices=data.choices||['alcance','cadencia','velocidade'];}
  create(){
    const {width:w,height:h}=this.scale;
    this.add.rectangle(0,0,w,h,0x07100d,.92).setOrigin(0);
    const stacked=w<690;
    this.add.text(w/2,h*(stacked?.12:.25),'EVOLUÇÃO DISPONÍVEL',{
      fontFamily:'Georgia,serif',fontSize:`${Math.min(31,Math.max(19,w*.04))}px`,fontStyle:'bold',color:'#ead9a5',align:'center'
    }).setOrigin(.5);
    this.add.text(w/2,h*(stacked?.20:.34),'Escolha uma melhoria para continuar',{fontFamily:'Arial',fontSize:'14px',color:'#c5d2b8'}).setOrigin(.5);
    this.choosing=false;
    this.choices.forEach((id,i)=>{
      const choice=UPGRADES[id];
      const x=stacked?w/2:w/2+(i-1)*Math.min(258,w*.29);
      const y=stacked?h*(.37+i*.22):h*.56;
      const cw=stacked?Math.min(w*.86,430):Math.min(226,w*.27);
      const ch=stacked?Math.min(105,h*.19):158;
      const card=this.add.rectangle(x,y,cw,ch,0x203b34,.98).setStrokeStyle(2,0x8fae90).setInteractive({useHandCursor:true});
      const title=this.add.text(x,y-(stacked?24:34),`${i+1} · ${choice.title}`,{
        fontFamily:'Arial',fontSize:`${stacked?15:16}px`,fontStyle:'bold',color:'#f3d8a0',align:'center',wordWrap:{width:cw-16}
      }).setOrigin(.5);
      const desc=this.add.text(x,y+(stacked?16:19),choice.description,{
        fontFamily:'Arial',fontSize:'12px',color:'#d0e1ce',align:'center',wordWrap:{width:cw-25}
      }).setOrigin(.5);
      card.on('pointerover',()=>card.setFillStyle(0x365544));
      card.on('pointerout',()=>card.setFillStyle(0x203b34));
      card.on('pointerdown',()=>this.choose(id));
    });
    this.onChoiceKey=(event)=>{
      if(event.repeat)return;
      const index=Number(event.key)-1;
      if(Number.isInteger(index)&&index>=0&&index<this.choices.length)this.choose(this.choices[index]);
    };
    this.input.keyboard.on('keydown',this.onChoiceKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.input.keyboard.off('keydown',this.onChoiceKey));
  }
  choose(id){
    if(this.choosing)return;
    const game=this.scene.get('GameScene');
    if(!game.applyUpgrade(id))return;
    this.choosing=true;
    game.upgrading=false;
    this.scene.stop();
    this.scene.resume('GameScene');
    game.showMessage(`Melhoria adquirida: ${UPGRADES[id].title}`);
  }
}
