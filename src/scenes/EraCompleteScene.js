import Phaser from 'phaser';
/** Vitória do primeiro capítulo, sem fingir que a segunda era já foi implementada. */
export class EraCompleteScene extends Phaser.Scene {
  constructor(){super('EraCompleteScene');}
  init(data){this.kills=data.kills||100;this.level=data.level||1;this.seconds=data.seconds||0;}
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#122b25');
    this.add.rectangle(w/2,h/2,w,h,0x0a1f18,.96);
    this.add.circle(w/2,h*.29,90,0xf0d39b,.12).setStrokeStyle(3,0xdcc289,.66);
    this.add.text(w/2,h*.29,'✦',{fontFamily:'Georgia',fontSize:'68px',color:'#e4c78f'}).setOrigin(.5);
    this.add.text(w/2,h*.44,'CRETÁCEO SUPERADO!',{
      fontFamily:'Georgia,serif',fontSize:`${Math.min(42,Math.max(24,w*.043))}px`,fontStyle:'bold',color:'#f2deb2'
    }).setOrigin(.5);
    this.add.text(w/2,h*.53,'O Tricerátops Ancestral foi derrotado.\nA Pré-História será o próximo capítulo.',{
      fontFamily:'Arial',fontSize:'15px',color:'#bfdbcb',align:'center',wordWrap:{width:Math.min(540,w*.9)}
    }).setOrigin(.5);
    const time=`${Math.floor(this.seconds/60)}:${String(this.seconds%60).padStart(2,'0')}`;
    this.add.text(w/2,h*.64,`${this.kills} ELIMINAÇÕES  •  NÍVEL ${this.level}  •  ${time}`,{
      fontFamily:'Arial',fontSize:'13px',color:'#e6d9a5',align:'center'
    }).setOrigin(.5);
    const replay=this.add.text(w/2,h*.75,'JOGAR NOVAMENTE',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#162b21',backgroundColor:'#efd49b',padding:{x:24,y:13}})
      .setOrigin(.5).setInteractive({useHandCursor:true});
    replay.on('pointerdown',()=>this.restart());
    this.add.text(w/2,h*.87,'VOLTAR AO MENU',{fontFamily:'Arial',fontSize:'13px',color:'#b9d3be'})
      .setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.menu());
    this.onRestart=()=>this.restart();this.input.keyboard.on('keydown-R',this.onRestart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.input.keyboard.off('keydown-R',this.onRestart));
  }
  restart(){this.scene.stop('GameScene');this.scene.start('GameScene');}
  menu(){this.scene.stop('GameScene');this.scene.start('MenuScene');}
}
