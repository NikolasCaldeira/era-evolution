/**
 * Converte coordenadas desejadas da tela em coordenadas de um objeto Phaser
 * com scrollFactor(0), compensando o zoom centralizado da câmera.
 * Também informa a escala inversa para manter a interface com tamanho fixo.
 */
export function screenAnchor(width,height,zoom,screenX,screenY){
  if(!Number.isFinite(zoom)||zoom<=0)throw new Error('Zoom inválido');
  const inverse=1/zoom;
  return {
    x:width/2+(screenX-width/2)*inverse,
    y:height/2+(screenY-height/2)*inverse,
    scale:inverse
  };
}
