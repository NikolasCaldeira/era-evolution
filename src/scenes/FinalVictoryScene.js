import Phaser from 'phaser';
import {ERAS} from '../systems/EraSystem.js';

/** Vitória definitiva depois do décimo chefe: nunca inicia uma era inexistente. */
export class FinalVictoryScene extends Phaser.Scene {
  constructor(){super('FinalVictoryScene');}
  init(data={}){
    this.totalKills=Math.max(0,data.totalKills||1000);
    this.level=Math.max(1,data.level||1);
    this.seconds=Math.max(0,data.seconds||0);
    this.changing=false;
  }
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#101623');
    const g=this.add.graphics();
    g.fillStyle(0x222439);g.fillRect(0,0,w,h);
    // O céu da Terra devastada clareia quando o último guardião é derrotado.
    g.fillStyle(0x67505e,.7);g.fillRect(w/2,0,w/2,h);
    g.fillStyle(0xcea58f,.15);g.fillEllipse(w*.5,h*.75,w*.8,h*.65);
    for(let i=0;i<20;i++){
      const x=w*(i+.5)/20, y=h*(.68+Math.sin(i*1.8)*.08);
      g.fillStyle(i%3?0x403944:0x78616b,.65);
      g.fillTriangle(x-65,y+30,x,y-78,x+65,y+30);
      g.fillStyle(0xf0b3a3,.45);g.fillCircle(x+Math.sin(i*6)*13,h*.22+(i*31)%(h*.45),2);
    }
    const panelWidth=Math.min(w*.9,910),panelHeight=Math.min(h*.82,575);
    const top=h/2-panelHeight/2;
    this.add.rectangle(w/2,h/2,panelWidth,panelHeight,0x111e28,.92)
      .setStrokeStyle(2,0xd4b99e,.82);
    const captionY=top+Math.min(54,panelHeight*.11);
    this.add.text(w/2,captionY,'ERA 10 CONCLUÍDA  ·  LINHA DO TEMPO RESTAURADA',{
      fontFamily:'Arial',fontSize:`${Math.max(11,Math.min(16,w*.016))}px`,
      fontStyle:'bold',letterSpacing:1.6,color:'#f4c9ad'
    }).setOrigin(.5);
    const titleSize=Math.max(27,Math.min(53,w*.051));
    this.add.text(w/2,top+panelHeight*.32,'DEZ ERAS SUPERADAS!',{
      fontFamily:'Georgia,serif',fontSize:`${titleSize}px`,fontStyle:'bold',color:'#ffe8c4',
      align:'center',wordWrap:{width:panelWidth-40}
    }).setOrigin(.5);
    this.add.text(w/2,top+panelHeight*.49,
      'O Coração da Extinção foi derrotado.\nA expedição atravessou todas as dez eras.\nO tempo pode recomeçar.',{
        fontFamily:'Arial',fontSize:`${Math.max(12,Math.min(17,w*.019))}px`,color:'#d4dfdb',
        align:'center',lineSpacing:6,wordWrap:{width:panelWidth-40}
      }).setOrigin(.5);
    const elapsed=`${Math.floor(this.seconds/60)}:${String(this.seconds%60).padStart(2,'0')}`;
    const stat=`${ERAS.length} ERAS  •  ${this.totalKills} ELIMINAÇÕES  •  NÍVEL ${this.level}  •  ${elapsed}`;
    this.add.text(w/2,top+panelHeight*.67,stat,{
      fontFamily:'Arial',fontSize:`${Math.max(10,Math.min(14,w*.016))}px`,
      color:'#f7d3ad',align:'center',wordWrap:{width:panelWidth-35}
    }).setOrigin(.5);
    const restart=this.add.text(w/2,top+panelHeight*.80,'REINICIAR A EXPEDIÇÃO  ↻',{
      fontFamily:'Arial',fontSize:`${Math.max(12,Math.min(18,w*.018))}px`,
      fontStyle:'bold',color:'#23303a',backgroundColor:'#e8c9ac',padding:{x:20,y:13}
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    restart.on('pointerover',()=>restart.setStyle({backgroundColor:'#ffebd1'}));
    restart.on('pointerout',()=>restart.setStyle({backgroundColor:'#e8c9ac'}));
    restart.on('pointerdown',()=>this.restart());
    this.add.text(w/2,top+panelHeight*.94,'R / ENTER: REINICIAR  •  ESC: MENU',{
      fontFamily:'Arial',fontSize:'11px',color:'#a9bdc2'
    }).setOrigin(.5);
    this.onRestart=()=>this.restart();this.onMenu=()=>this.menu();
    this.input.keyboard.on('keydown-R',this.onRestart);
    this.input.keyboard.on('keydown-ENTER',this.onRestart);
    this.input.keyboard.on('keydown-ESC',this.onMenu);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard.off('keydown-R',this.onRestart);
      this.input.keyboard.off('keydown-ENTER',this.onRestart);
      this.input.keyboard.off('keydown-ESC',this.onMenu);
    });
  }
  restart(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('GameScene',{eraIndex:0});}
  menu(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('MenuScene');}
}
