import Phaser from 'phaser';
export class MenuScene extends Phaser.Scene {
  constructor(){super('MenuScene');}
  create(){
    const {width:w,height:h}=this.scale;
    this.cameras.main.setBackgroundColor('#0b231d');
    const bg=this.add.graphics();
    // Arte do menu: camadas de floresta pré-histórica e vegetação tropical.
    bg.fillStyle(0x13352b);bg.fillRect(0,0,w,h);
    bg.fillStyle(0x2e5642,.75);bg.fillEllipse(w*.52,h*.67,w*1.1,h*.65);
    bg.fillStyle(0x426e4c);bg.fillEllipse(w*.51,h*.68,w*.82,h*.32);
    bg.fillStyle(0x69926a,.45);bg.fillEllipse(w*.51,h*.7,w*.67,h*.2);
    for(let i=0;i<16;i++){
      const px=w*(i/15),py=h*(.7+Math.sin(i*1.78)*.07);
      bg.fillStyle(i%2?0x194b39:0x24533b,.72);
      bg.fillEllipse(px,py-45,150,100);
      bg.fillStyle(0x486d48,.7);bg.fillEllipse(px-10,py-68,70,32);
      bg.fillStyle(0x604f34);bg.fillRoundedRect(px-4,py-18,9,45,3);
    }
    bg.fillStyle(0x0b1b1b,.68);bg.fillRoundedRect(w/2-Math.min(440,w*.46),h*.15,Math.min(880,w*.92),h*.66,18);
    const titleSize=Math.min(98,Math.max(49,w*.095));
    this.add.text(w/2,h*.27,'ERA',{fontFamily:'Georgia,serif',fontSize:`${titleSize}px`,fontStyle:'bold',color:'#f3e3b5',stroke:'#0b241c',strokeThickness:5}).setOrigin(.5);
    this.add.text(w/2,h*.39,'E V O L U T I O N',{fontFamily:'Arial',fontSize:`${Math.min(23,Math.max(13,w*.023))}px`,fontStyle:'bold',color:'#c8dabc'}).setOrigin(.5);
    this.add.text(w/2,h*.49,'CAPÍTULO I · O CRETÁCEO',{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#e9c17f',letterSpacing:3}).setOrigin(.5);
    this.add.text(w/2,h*.57,'Um sobrevivente perdido em um mundo que ainda não conhece a humanidade.',{fontFamily:'Arial',fontSize:'13px',color:'#b6c9b2',align:'center',wordWrap:{width:Math.min(520,w*.75)}}).setOrigin(.5);
    const start=this.add.text(w/2,h*.72,'COMEÇAR EXPEDIÇÃO',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#193329',backgroundColor:'#e6ce93',padding:{x:27,y:16}}).setOrigin(.5).setInteractive({useHandCursor:true});
    start.on('pointerover',()=>start.setStyle({backgroundColor:'#ffe1a4'}));
    start.on('pointerout',()=>start.setStyle({backgroundColor:'#e6ce93'}));
    start.on('pointerdown',()=>this.scene.start('GameScene'));
    this.add.text(w/2,h*.88,'WASD / SETAS  •  F3 ROTAS  •  ESC PAUSAR',{fontFamily:'Arial',fontSize:'12px',color:'#94b4a1'}).setOrigin(.5);
    this.scale.on('resize',()=>this.scene.restart());
  }
}
