import Phaser from 'phaser';

/** Tela de fim de partida: reinicia a expedição sem progresso permanente. */
export class GameOverScene extends Phaser.Scene {
  constructor(){super('GameOverScene');}
  init(data){
    this.kills=data.kills||0;
    this.level=data.level||1;
    this.seconds=data.seconds||0;
  }
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#10241e');
    this.add.rectangle(w/2,h/2,w,h,0x071411,.91);
    this.add.circle(w/2,h*.26,62,0x855f4b,.13).setStrokeStyle(2,0xdfb487,.7);
    this.add.text(w/2,h*.25,'✦',{fontFamily:'Georgia,serif',fontSize:'45px',color:'#e6ba87'}).setOrigin(.5);
    this.add.text(w/2,h*.40,'FIM DA EXPEDIÇÃO',{
      fontFamily:'Georgia,serif',fontSize:`${Math.min(35,Math.max(21,w*.037))}px`,fontStyle:'bold',color:'#f2d9a8',align:'center'
    }).setOrigin(.5);
    this.add.text(w/2,h*.48,'O Cretáceo permanece à espera de outro sobrevivente.',{
      fontFamily:'Arial',fontSize:'14px',color:'#bdd4be',align:'center',wordWrap:{width:Math.min(560,w*.85)}
    }).setOrigin(.5);
    const minutes=Math.floor(this.seconds/60);
    const seconds=String(this.seconds%60).padStart(2,'0');
    this.add.text(w/2,h*.57,`CRIATURAS: ${this.kills}    •    NÍVEL: ${this.level}    •    TEMPO: ${minutes}:${seconds}`,{
      fontFamily:'Arial',fontSize:`${Math.min(15,Math.max(11,w*.023))}px`,color:'#e3ddb9',align:'center'
    }).setOrigin(.5);

    const replay=this.add.text(w/2,h*.69,'RECOMEÇAR EXPEDIÇÃO',{
      fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#173227',
      backgroundColor:'#f1d39b',padding:{x:24,y:14}
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    replay.on('pointerover',()=>replay.setStyle({backgroundColor:'#ffe6b7'}));
    replay.on('pointerout',()=>replay.setStyle({backgroundColor:'#f1d39b'}));
    replay.on('pointerdown',()=>this.restart());
    const menu=this.add.text(w/2,h*.81,'VOLTAR AO MENU',{
      fontFamily:'Arial',fontSize:'13px',color:'#c1d3c0',letterSpacing:2
    }).setOrigin(.5).setInteractive({useHandCursor:true});
    menu.on('pointerdown',()=>this.goToMenu());
    this.restartKey=()=>this.restart();
    this.input.keyboard.on('keydown-R',this.restartKey);
    this.input.keyboard.on('keydown-ENTER',this.restartKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard.off('keydown-R',this.restartKey);
      this.input.keyboard.off('keydown-ENTER',this.restartKey);
    });
  }
  restart(){
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }
  goToMenu(){
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
