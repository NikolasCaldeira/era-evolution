/** Mamute Ancestral: sprite original em Canvas com pelagem, armadura de gelo e presas. */
export function createIceAgeBossArt(scene){
  const oval=(c,x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*Math.PI);c.fillStyle=color;c.fill();};
  const poly=(c,points,color,stroke=null)=>{c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}};
  for(const left of [false,true])for(let frame=0;frame<4;frame++){
    const key=iceAgeBossTexture(left,frame);
    if(scene.textures.exists(key))continue;
    const t=scene.textures.createCanvas(key,300,228),c=t.getContext();
    c.clearRect(0,0,300,228);c.save();
    c.translate(142,132+[0,-3,0,-2][frame]);c.scale(left?-1:1,1);
    const bounce=[0,4,0,-4][frame];
    // Cauda, patas e cascos enormes.
    c.strokeStyle='#4e413b';c.lineWidth=12;c.beginPath();c.moveTo(-90,-10);c.quadraticCurveTo(-123,-6,-118,17);c.stroke();
    for(const [x,dy] of [[-60,bounce],[-22,-bounce],[33,bounce],[67,-bounce]]){
      poly(c,[[x-17,-8],[x+13,-8],[x+17,69+dy],[x-15,69+dy]],'#614d45','#413b3a');
      oval(c,x,69+dy,20,9,'#352f31');
      for(let k=0;k<3;k++)oval(c,x-11+k*11,74+dy,4,3,'#a59d92');
    }
    // Volumosa pelagem lanosa, distinta do mamute jovem.
    oval(c,-11,-42,105,76,'#5c493f');
    oval(c,-15,-52,96,67,'#846858');
    oval(c,-18,-63,82,50,'#a08468');
    for(let i=0;i<27;i++){
      const x=-97+(i*29)%177,y=-90+(i*17)%105;
      oval(c,x,y,7,12,i%3===0?'#715548':i%3===1?'#97755f':'#ac8a6b');
    }
    // Placas glaciais nos ombros (fantasia estilizada).
    for(const [x,y,s] of [[-66,-119,1],[-28,-136,.75],[11,-123,.78]]){
      poly(c,[[x-18*s,y+30*s],[x,y-30*s],[x+22*s,y+25*s]],'#8fc2c9','#e1f4ef');
      poly(c,[[x-18*s,y+30*s],[x,y-30*s],[x+2*s,y+29*s]],'#4e8b9d');
    }
    // Cabeça larga, orelha e tromba curvada.
    oval(c,63,-53,50,53,'#735a4b');
    oval(c,75,-57,40,44,'#a08168');
    oval(c,33,-55,25,32,'#634e43');oval(c,37,-57,13,19,'#ae8874');
    c.lineCap='round';c.strokeStyle='#8e705b';c.lineWidth=27;
    c.beginPath();c.moveTo(99,-34);c.quadraticCurveTo(130,-3,114,41);c.quadraticCurveTo(110,56,121,57);c.stroke();
    c.strokeStyle='#c2a58a';c.lineWidth=7;c.beginPath();c.moveTo(105,4);c.lineTo(121,15);c.stroke();
    // Presas muito maiores que as dos mamutes comuns.
    c.strokeStyle='#f1e2c6';c.lineWidth=11;
    c.beginPath();c.moveTo(91,-22);c.quadraticCurveTo(131,54,167,7);c.stroke();
    c.beginPath();c.moveTo(60,-18);c.quadraticCurveTo(95,40,143,-8);c.stroke();
    oval(c,91,-61,9,9,'#eee4cd');oval(c,94,-61,3.8,5,'#2b3839');
    oval(c,106,-38,9,6,'#604c45');
    // Energia gélida no dorso.
    for(let k=0;k<5;k++){const x=-68+k*32;oval(c,x,-116-(k%2)*10,4,5,'#c9eff1');}
    c.restore();t.refresh();
  }
}
export function iceAgeBossTexture(left,frame){return `era2-mamute-ancestral-${left?'left':'right'}-${frame%4}`;}
