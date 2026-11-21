import Phaser from 'phaser';
export class UpgradeScene extends Phaser.Scene {
  constructor(){super('UpgradeScene');}
  init(data){this.level=data.level||1;this.power=data.power||1;}
  create(){
    const {width,height}=this.scale;this.add.rectangle(0,0,width,height,0x07100d,.86).setOrigin(0);
    this.add.text(width/2,height*.25,'EVOLUÇÃO DISPONÍVEL',{fontSize:Math.min(32,Math.max(22,width*.04)),fontStyle:'bold',color:'#ead9a5',letterSpacing:3}).setOrigin(.5);
    this.add.text(width/2,height*.34,'Escolha uma melhoria para continuar',{fontSize:'15px',color:'#c5d2b8'}).setOrigin(.5);
    const choices=[{name:'Alcance ampliado',desc:'Aumenta o alcance dos projéteis automáticos.',apply:()=>this.power++},{name:'Passos ligeiros',desc:'Aumenta a velocidade de exploração.',apply:()=>{const s=this.scene.get('GameScene');s.player.speed+=35;}},{name:'Recuperação',desc:'Afasta as criaturas por um breve instante.',apply:()=>{const s=this.scene.get('GameScene');s.creatures.forEach(c=>{const dx=c.x-s.player.x,dy=c.y-s.player.y,d=Math.hypot(dx,dy)||1;c.x+=dx/d*90;c.y+=dy/d*90;c.sprite.setPosition(c.x,c.y);c.shadow.setPosition(c.x,c.y+10);});}}];
    choices.forEach((c,i)=>{const x=width/2+(i-1)*Math.min(250,width*.29),y=height*.55;const card=this.add.rectangle(x,y,Math.min(220,width*.26),150,0x24372b,.98).setStrokeStyle(2,0x879b69).setInteractive({useHandCursor:true});this.add.text(x,y-35,c.name,{fontSize:'16px',fontStyle:'bold',color:'#ead9a5',align:'center',wordWrap:{width:180}}).setOrigin(.5);this.add.text(x,y+12,c.desc,{fontSize:'12px',color:'#d0d9c7',align:'center',wordWrap:{width:175}}).setOrigin(.5);card.on('pointerover',()=>card.setFillStyle(0x36523b));card.on('pointerout',()=>card.setFillStyle(0x24372b));card.on('pointerdown',()=>{c.apply();const game=this.scene.get('GameScene');game.level++;game.power=this.power;this.scene.stop();this.scene.resume('GameScene');game.showMessage(`Melhoria adquirida: ${c.name}`);});});
  }
}
