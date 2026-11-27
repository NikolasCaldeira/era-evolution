/** Converte o desenho estático do terreno numa imagem (sem alterar objetos, HUD ou colisões).
 * Phaser recomenda generateTexture para Graphics que não mudam. Em hardware
 * com limite inferior a 3.000 px, mantém o desenho original por segurança. */
export function cacheTerrainGraphics(scene,key,settings){
  if(!scene?.children?.list||!scene?.textures||!scene?.game?.renderer)return null;
  const width=Math.ceil((settings.mapColumns+settings.mapRows)*settings.tileWidth/2);
  const height=Math.ceil((settings.mapColumns+settings.mapRows)*settings.tileHeight/2);
  const gl=scene.game.renderer.gl;
  if(gl&&width>gl.getParameter(gl.MAX_TEXTURE_SIZE))return null;
  const terrain=scene.children.list.find(o=>o.type==='Graphics'&&o.depth===-1000);
  if(!terrain||typeof terrain.generateTexture!=='function')return null;
  try{
    if(scene.textures.exists(key))scene.textures.remove(key);
    terrain.generateTexture(key,width,height);
    if(!scene.textures.exists(key))return null;
    const image=scene.add.image(0,0,key).setOrigin(0).setDepth(-1000);
    if(!image){scene.textures.remove(key);return null;}
    terrain.destroy();
    scene.terrainCacheImage=image;
    return key;
  }catch(error){
    if(scene.textures.exists(key))scene.textures.remove(key);
    return null; // Em caso de falha, terreno em Graphics continua disponível.
  }
}
