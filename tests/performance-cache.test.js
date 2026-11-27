import test from 'node:test';
import assert from 'node:assert/strict';
import {setChangedText,setChangedColor,setChangedFontSize} from '../src/systems/HudCache.js';
import {cacheTerrainGraphics} from '../src/systems/StaticTerrainCache.js';
test('HUD não redesenha os mesmos textos, cores e tamanhos',()=>{
  const label={text:'abc',style:{color:'#ffffff',fontSize:'12px'},calls:0,
    setText(v){this.text=v;this.calls++},setColor(v){this.style.color=v;this.calls++},setFontSize(v){this.style.fontSize=`${v}px`;this.calls++}};
  setChangedText(label,'abc');setChangedColor(label,'#ffffff');setChangedFontSize(label,12);
  assert.equal(label.calls,0);
  setChangedText(label,'def');setChangedColor(label,'#bbbbbb');setChangedFontSize(label,10);
  assert.equal(label.calls,3);
});
test('cache de terreno retorna fallback seguro em ambiente sem renderizador',()=>{
  assert.equal(cacheTerrainGraphics({},'terrain',{}),null);
});
test('cache é usado para Graphics estático e terreno anterior é destruído',()=>{
  const tex=new Set(),graphics={type:'Graphics',depth:-1000,generated:false,destroyed:false,
    generateTexture(k,w,h){tex.add(k);this.generated=[w,h]},destroy(){this.destroyed=true}};
  let imageCalled=false;
  const scene={game:{renderer:{}},textures:{exists:k=>tex.has(k),remove:k=>tex.delete(k)},
    children:{list:[graphics]},add:{image(){imageCalled=true;return {setOrigin(){return this},setDepth(){return this}}}}};
  const key=cacheTerrainGraphics(scene,'terra',{mapColumns:34,mapRows:28,tileWidth:96,tileHeight:48});
  assert.equal(key,'terra');assert.deepEqual(graphics.generated,[2976,1488]);
  assert.equal(imageCalled,true);assert.equal(graphics.destroyed,true);
});
