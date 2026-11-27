/**
 * Gera um único arquivo HTML publicável. Mantém a versão modular para Vite.
 * O HTML usa Phaser 3.90.0 via CDN; portanto, requer acesso à internet.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const source=filename=>readFileSync(resolve(root,filename),'utf8');
const modules=[
  'src/core/Settings.js',
  'src/core/SurvivalState.js',
  'src/core/ScreenAnchor.js',
  'src/systems/EraSystem.js',
  'src/systems/WeaponSystem.js',
  'src/systems/UpgradeSystem.js',
  'src/systems/DifficultySystem.js',
  'src/systems/MagnetSystem.js',
  'src/systems/BossSystem.js',
  'src/systems/IceAgeBossSystem.js',
  'src/systems/FrostTrailSystem.js',
  'src/systems/ActiveCombatSystem.js',
  'src/systems/CivilizationBossSystem.js',
  'src/systems/ModernBossSystem.js',
  'src/systems/RelicVisual.js',
  'src/world/IsoProjection.js',
  'src/world/NavigationGrid.js',
  'src/world/WorldGenerator.js',
  'src/world/PleistoceneWorld.js',
  'src/world/CivilizationWorld.js',
  'src/world/ModernWorld.js',
  'src/world/SpaceWorld.js',
  'src/world/ExtinctionWorld.js',
  'src/art/CharacterArt.js',
  'src/art/PleistoceneArt.js',
  'src/art/BossArt.js',
  'src/art/IceAgeBossArt.js',
  'src/art/CivilizationArt.js',
  'src/art/ModernArt.js',
  'src/entities/Player.js',
  'src/entities/Creature.js',
  'src/entities/CretaceousBoss.js',
  'src/entities/PleistoceneBoss.js',
  'src/entities/CivilizationBoss.js',
  'src/entities/ModernBoss.js',
  'src/scenes/BootScene.js',
  'src/scenes/MenuScene.js',
  'src/scenes/PauseScene.js',
  'src/scenes/UpgradeScene.js',
  'src/scenes/GameScene.js',
  'src/scenes/GameOverScene.js',
  'src/scenes/EraCompleteScene.js',
  'src/scenes/FinalVictoryScene.js',
  'src/main.js'
];
const combined=modules.map(filename=>{
  let content=source(filename);
  const exported=[...content.matchAll(/^\s*export\s+(?:class|const|function)\s+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);
  content=content.replace(/^\s*import\s+[^;]+;\s*$/gm,'');
  content=content.replace(/^export\s+(?=(?:class|const|function)\s)/gm,'');
  if (/^\s*(import|export)\b/m.test(content))throw new Error(`Import/export não removido em ${filename}`);
  // Cada módulo fica isolado: nomes auxiliares (oval, poly, FACINGS) não colidem.
  // Apenas exportações explícitas ficam disponíveis às cenas seguintes.
  const declarations=exported.length?`const {${exported.join(',')}} = `:'';
  const expression=`(() => {\n${content}\nreturn {${exported.join(',')}};\n})()`;
  return `\n// --- ${filename} ---\n${declarations}${expression};`;
}).join('\n');
if(combined.includes('</script>')) throw new Error('Sequência insegura no script inline.');
const css=source('src/style.css');
const html=`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#102820" />
  <title>ERA: Evolution | Dez Eras — Ciclo 16</title>
  <style>${css}</style>
</head>
<body>
  <main id="game-shell">
    <div id="game"></div>
    <div id="loading">ERA: EVOLUTION<span>Carregando a viagem entre eras…</span></div>
  </main>
  <!-- Dependência externa: jogo exige acesso à internet, sem npm ou terminal. -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
  <script>
  if (!window.Phaser) {
    document.getElementById('loading').innerHTML='Não foi possível carregar o Phaser.<span>Verifique a conexão com a internet e recarregue esta página.</span>';
  } else {
    ${combined}
  }
  </script>
</body>
</html>`;
const destination=resolve(root,'publicar','index.html');
mkdirSync(resolve(root,'publicar'),{recursive:true});
writeFileSync(destination,html,'utf8');
copyFileSync(destination,resolve(root,'JOGAR-ERA-Evolution-Ciclo16.html'));
console.log(`Exportado ${destination} (${html.length} caracteres)`);
