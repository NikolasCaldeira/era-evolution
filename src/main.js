import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { EraCompleteScene } from './scenes/EraCompleteScene.js';
import { FinalVictoryScene } from './scenes/FinalVictoryScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#172522',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
  render: { antialias: true, pixelArt: false },
  scene: [BootScene, MenuScene, GameScene, PauseScene, UpgradeScene, GameOverScene, EraCompleteScene, FinalVictoryScene]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  game.events.once('ready', () => {
    const loading = document.getElementById('loading');
    if (loading) { loading.style.opacity = '0'; setTimeout(() => loading.remove(), 400); }
  });
});
