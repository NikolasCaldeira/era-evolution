import Phaser from 'phaser';
/** Portal de eras: troca do Cretáceo para o Pleistoceno preservando a jornada. */
export class EraCompleteScene extends Phaser.Scene {
  constructor(){super('EraCompleteScene');}
  init(data={}){
    this.eraIndex=data.eraIndex===1?1:0;
    this.kills=data.kills||100;
    this.level=data.level||1;
    this.seconds=data.seconds||0;
    this.progress=data.progress||null;
    this.changing=false;
  }
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#0e2530');
    const bg=this.add.graphics();
    bg.fillStyle(0x0b2823);bg.fillRect(0,0,w/2,h);
    bg.fillStyle(this.eraIndex===1?0x85715a:0x254653);bg.fillRect(w/2,0,w/2,h);
    bg.fillStyle(0x466c4a,.75);bg.fillEllipse(w*.21,h*.78,w*.66,h*.48);
    bg.fillStyle(0xa0bcc2,.65);bg.fillEllipse(w*.8,h*.8,w*.73,h*.5);
    for(let i=0;i<7;i++){
      const x=w*(i/6),y=h*.77+Math.sin(i*2.1)*30;
      bg.fillStyle(i<3?0x183e36:0x576f7a,.75);
      bg.fillTriangle(x-90,y+45,x,y-110,x+90,y+45);
      if(i>2){bg.fillStyle(0xe2e7e3,.78);bg.fillTriangle(x-36,y-50,x,y-110,x+35,y-51);}
    }
    const divider=this.add.rectangle(w/2,h/2,3,h,0xe9d5a5,.6);
    this.tweens.add({targets:divider,alpha:.12,scaleX:2,yoyo:true,repeat:-1,duration:1600});
    this.add.rectangle(w/2,h*.43,Math.min(w*.93,850),Math.min(h*.78,510),0x0b1e20,.87).setStrokeStyle(2,0xa5b7ac,.6);
    const small=Math.max(12,Math.min(16,w*.018));
    const title=this.add.text(w/2,h*.225,this.eraIndex===1?'ERA 02 CONCLUÍDA':'ERA 01 CONCLUÍDA',{fontFamily:'Arial',fontSize:`${small}px`,fontStyle:'bold',color:'#d4c18c',letterSpacing:3}).setOrigin(.5);
    const headline=this.add.text(w/2,h*.35,this.eraIndex===1?'O INVERNO FOI SUPERADO':'A HISTÓRIA AVANÇA',{fontFamily:'Georgia,serif',fontSize:`${Math.min(46,Math.max(25,w*.047))}px`,fontStyle:'bold',color:'#f5e0b2'}).setOrigin(.5);
    this.add.text(w/2,h*.465,this.eraIndex===1?'O Mamute Ancestral foi derrotado.\nPróximo capítulo: Civilizações Antigas.\nA Era 03 está em desenvolvimento.':'O Tricerátops Ancestral foi derrotado.\nMuito tempo depois, um novo desafio começa:\na Pré-História — o Pleistoceno, a era do gelo.',{
      fontFamily:'Arial',fontSize:`${Math.min(16,Math.max(12,w*.02))}px`,color:'#d0e2df',align:'center',lineSpacing:5,wordWrap:{width:Math.min(w*.83,650)}
    }).setOrigin(.5);
    const time=`${Math.floor(this.seconds/60)}:${String(this.seconds%60).padStart(2,'0')}`;
    this.add.text(w/2,h*.6,`${this.kills} ELIMINAÇÕES  •  NÍVEL ${this.level}  •  ${time}`,{
      fontFamily:'Arial',fontSize:`${Math.min(14,Math.max(10,w*.017))}px`,color:'#efdbb4'
    }).setOrigin(.5);
    const next=this.add.text(w/2,h*.705,this.eraIndex===1?'VOLTAR AO MENU  ▶':'AVANÇAR PARA A ERA DO GELO  ▶',{
      fontFamily:'Arial',fontSize:`${Math.min(17,Math.max(12,w*.019))}px`,fontStyle:'bold',color:'#173340',backgroundColor:'#b6dbe5',padding:{x:24,y:14}
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    next.on('pointerover',()=>next.setStyle({backgroundColor:'#dceef6'}));
    next.on('pointerout',()=>next.setStyle({backgroundColor:'#b6dbe5'}));
    next.on('pointerdown',()=>this.advance());
    this.add.text(w/2,h*.825,this.eraIndex===1?'ENTER: MENU    •    R: REINICIAR A EXPEDIÇÃO    •    ESC: MENU':'ENTER: CONTINUAR    •    R: REINICIAR    •    ESC: MENU',{fontFamily:'Arial',fontSize:`${Math.min(12,Math.max(9,w*.015))}px`,color:'#aac5c5'}).setOrigin(.5);
    title.setAlpha(0);headline.setAlpha(0);next.setAlpha(0);
    this.tweens.add({targets:[title,headline],alpha:1,duration:950});
    this.tweens.add({targets:next,alpha:1,delay:600,duration:900});
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
    if(this.eraIndex===1){this.menu();return;}
    if(this.changing)return;
    this.changing=true;
    this.cameras.main.fadeOut(450,16,33,44);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>{
      this.scene.stop('GameScene');
      this.scene.start('GameScene',{eraIndex:1,progress:this.progress});
    });
  }
  restart(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('GameScene',{eraIndex:0});}
  menu(){if(this.changing)return;this.changing=true;this.scene.stop('GameScene');this.scene.start('MenuScene');}
}
