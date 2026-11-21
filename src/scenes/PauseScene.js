import Phaser from 'phaser';
export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }
  create() {
    this.scene.pause('GameScene');
    const {width,height}=this.scale;
    this.add.rectangle(width/2,height/2,width,height,0x07100f,.78);
    this.add.text(width/2,height*.38,'JORNADA PAUSADA',{fontSize:'30px',fontStyle:'bold',color:'#e8d8a8',letterSpacing:3}).setOrigin(.5);
    const resume=this.add.text(width/2,height*.53,'CONTINUAR',{fontSize:'17px',fontStyle:'bold',color:'#17231d',backgroundColor:'#d8c58f',padding:{x:26,y:13},letterSpacing:2}).setOrigin(.5).setInteractive({useHandCursor:true});
    resume.on('pointerdown',()=>{this.scene.stop();this.scene.resume('GameScene');});
    const menu=this.add.text(width/2,height*.65,'VOLTAR AO MENU',{fontSize:'14px',color:'#d1dbc9',letterSpacing:2}).setOrigin(.5).setInteractive({useHandCursor:true});
    menu.on('pointerdown',()=>{this.scene.stop('GameScene');this.scene.start('MenuScene');});
    this.input.keyboard.once('keydown-ESC',()=>{this.scene.stop();this.scene.resume('GameScene');});
  }
}
