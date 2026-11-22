/** Arte própria do Tricerátops Ancestral em Canvas, sem imagens externas. */
export function createBossArt(scene){
  for(const flip of [false,true])for(let frame=0;frame<4;frame++){
    const key=`era-boss-${flip?'left':'right'}-${frame}`;
    if(scene.textures.exists(key))continue;
    const tex=scene.textures.createCanvas(key,240,190);
    const c=tex.getContext();
    c.clearRect(0,0,240,190);c.save();
    c.translate(118,111+[0,-3,0,-1][frame]);c.scale(flip?-1:1,1);
    const bounce=[0,4,0,-4][frame];
    const oval=(x,y,rx,ry,col)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();};
    const poly=(pts,col,stroke)=>{c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}};
    // Cauda larga e patas distinguíveis, sem violência gráfica.
    poly([[-70,-16],[-105,-35],[-111,-26],[-85,2],[-56,5]],'#617f50','#33533d');
    for(const [x,n] of [[-47,1],[-7,-1],[33,1]]){
      poly([[x-12,5],[x+10,4],[x+15,47+n*bounce],[x-13,47+n*bounce]],'#4a6a43','#30473b');
      oval(x+1,49+n*bounce,19,8,'#354e39');
      for(let j=0;j<3;j++)oval(x-9+j*9,53+n*bounce,3,3,'#a6a47d');
    }
    oval(-21,-29,76,46,'#516f4b');
    oval(-25,-44,69,33,'#82a36a');
    for(let i=0;i<12;i++)oval(-79+i*11,-40+(i%3)*7,4,4,i%2?'#9ab779':'#b5b580');
    // Escudo ósseo e três chifres de tricerátops.
    poly([[17,-73],[58,-97],[93,-82],[98,-49],[65,-14],[27,-22]],'#b7a878','#65744e');
    for(let i=0;i<6;i++)poly([[27+i*11,-75-(i%2)*11],[31+i*11,-99-(i%2)*9],[36+i*11,-73]],'#ddc68e','#8f885c');
    oval(62,-42,43,34,'#75945c');
    oval(79,-24,30,21,'#98ae72');
    poly([[57,-57],[62,-102],[77,-65],[73,-53]],'#f3dfae','#a8a178');
    poly([[80,-53],[105,-97],[101,-46],[91,-39]],'#ead6a3','#9e9674');
    poly([[95,-22],[122,-32],[112,-8],[94,-6]],'#d5b887','#7b8259');
    oval(82,-42,7.5,7.5,'#f6e3b6');oval(84,-42,3,4,'#354639');
    c.strokeStyle='#3c573e';c.lineWidth=3;c.beginPath();c.moveTo(84,-17);c.lineTo(105,-15);c.stroke();
    c.restore();tex.refresh();
  }
}
export function bossTexture(left,frame){return `era-boss-${left?'left':'right'}-${frame%4}`;}
