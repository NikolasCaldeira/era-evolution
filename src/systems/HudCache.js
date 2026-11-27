/** Evita redesenhar texturas de texto quando o conteúdo não mudou. */
export function setChangedText(label,value){if(label.text!==value)label.setText(value);}
export function setChangedColor(label,color){if(label.style?.color!==color)label.setColor(color);}
export function setChangedFontSize(label,size){
  if(label.style?.fontSize!==`${size}px`)label.setFontSize(size);
}
