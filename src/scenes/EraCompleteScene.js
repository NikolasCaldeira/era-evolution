import Phaser from 'phaser';
import {ERAS,eraAt} from '../systems/EraSystem.js';
/** Portal entre capítulos: mantém a expedição enquanto a linha do tempo avança. */
export class EraCompleteScene extends Phaser.Scene {
  constructor(){super('EraCompleteScene');}
  init(data={}){
    this.eraIndex=Number.isInteger(data.eraIndex)?data.eraIndex:0;
    this.era=eraAt(this.eraIndex);
    this.nextEra=ERAS[this.eraIndex+1]||null;
    this.kills=data.kills||100;this.level=data.level||1;this.seconds=data.seconds||0;
    this.progress=data.progress||null;this.changing=false;
  }
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#0c2428');
    const bg=this.add.graphics();
    bg.fillStyle(this.era.theme);bg.fillRect(0,0,w/2,h);
    bg.fillStyle(this.nextEra?.theme||0x30444d);bg.fillRect(w/2,0,w/2,h);
    for(let i=0;i<12;i++){
      const x=w*i/11,y=h*(.72+Math.sin(i*2.1)*.07);
      bg.fillStyle(i<6?this.era.accent:this.nextEra?.accent||0xa6baaa,.12);
      bg.fillEllipse(x,y,240,135);
      bg.fillStyle(i%2?0x122d2c:0x29433a,.57);
      bg.fillTriangle(x-80,y+55,x,y-80,x+80,y+55);
    }
    const middle=this.add.rectangle(w/2,h/2,3,h,0xe9d5a5,.5);
    this.tweens.add({targets:middle,alpha:.1,scaleX:1.8,yoyo:true,repeat:-1,duration:1550});
    this.add.rectangle(w/2,h*.5,Math.min(w*.94,850),Math.min(h*.81,515),0x0a1b23,.9).setStrokeStyle(2,0xb8c6bc,.67);
    const fs=Math.min(48,Math.max(24,w*.052));
    const panelTop=h/2-Math.min(h*.81,515)/2;
    const title=this.add.text(w/2,panelTop+Math.min(52,Math.min(h*.81,515)*.11),`ERA ${String(this.era.number).padStart(2,'0')} CONCLUÍDA`,{
      fontFamily:'Arial',fontSize:`${Math.min(16,Math.max(12,w*.021))}px`,fontStyle:'bold',color:'#f0d69d',letterSpacing:3
    }).setOrigin(.5);
    const headline=this.add.text(w/2,h*.35,this.nextEra?'A HISTÓRIA AVANÇA':'DEZ ERAS SUPERADAS!',{
      fontFamily:'Georgia,serif',fontSize:`${fs}px`,fontStyle:'bold',color:'#f7e0b5'
    }).setOrigin(.5);
    const desc=this.nextEra?
      `O guardião da ${this.era.name} foi derrotado.\nPróximo capítulo: ${this.nextEra.name}.\nArmas, melhorias e experiência acompanham a jornada.`:
      `Concluíste os dez capítulos da expedição!`;
    this.add.text(w/2,h*.48,desc,{fontFamily:'Arial',fontSize:`${Math.min(16,Math.max(12,w*.02))}px`,color:'#d4e2dd',align:'center',lineSpacing:6,wordWrap:{width:Math.min(w*.83,660)}}).setOrigin(.5);
    const time=`${Math.floor(this.seconds/60)}:${String(this.seconds%60).padStart(2,'0')}`;
    this.add.text(w/2,h*.62,`${this.kills} ELIMINAÇÕES  •  NÍVEL ${this.level}  •  ${time}`,{
      fontFamily:'Arial',fontSize:`${Math.min(14,Math.max(10,w*.017))}px`,color:'#f1d7aa'
    }).setOrigin(.5);
    const button=this.add.text(w/2,h*.724,this.nextEra?`AVANÇAR PARA ${this.nextEra.name}  ▶`:'VOLTAR AO MENU  ▶',{
      fontFamily:'Arial',fontSize:`${Math.min(16,Math.max(11,w*.018))}px`,fontStyle:'bold',color:'#18313d',backgroundColor:'#c0dfe9',padding:{x:Math.min(26,w*.02),y:15}
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    button.on('pointerover',()=>button.setStyle({backgroundColor:'#e4f3f5'}));
    button.on('pointerout',()=>button.setStyle({backgroundColor:'#c0dfe9'}));
    button.on('pointerdown',()=>this.advance());
    this.add.text(w/2,h*.844,'ENTER: CONTINUAR  •  R: REINICIAR EXPEDIÇÃO  •  ESC: MENU',{fontFamily:'Arial',fontSize:`${Math.min(12,Math.max(9,w*.015))}px`,color:'#acc5c4'}).setOrigin(.5);
    title.setAlpha(0);headline.setAlpha(0);button.setAlpha(0);
    this.tweens.add({targets:[title,headline],alpha:1,duration:900});this.tweens.add({targets:button,alpha:1,delay:550,duration:850});
    this.onContinue=()=>this.advance();this.onRestart=()=>this.restart();this.onMenu=()=>this.menu();
    this.input.keyboard.on('keydown-ENTER',this.onContinue);
    this.input.keyboard.on('keydown-R',this.onRestart);
    this.input.keyboard.on('keydown-ESC',this.onMenu);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard.off('keydown-ENTER',this.onContinue);
      this.input.keyboard.off('keydown-R',this.onRestart);
      this.input.keyboard.off('keydown-ESC',this.onMenu);
    });
  }
  advance(){
    if(this.changing)return;
    if(!this.nextEra){this.menu();return;}
    this.changing=true;
    this.cameras.main.fadeOut(440,16,33,44);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>{
      this.scene.stop('GameScene');this.scene.start('GameScene',{eraIndex:this.eraIndex+1,progress:this.progress});
    });
  }
  restart(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('GameScene',{eraIndex:0});}
  menu(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('MenuScene');}
}
