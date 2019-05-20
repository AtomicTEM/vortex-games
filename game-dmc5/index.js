const Promise = require('bluebird');
const path = require('path');
const { fs, util } = require('vortex-api');

const NATIVES_DIR = 'natives' + path.sep;
const GAME_ID = 'devilmaycry5';
const STEAM_ID = 601150;

function findGame() {
  return util.steam.findByAppId(STEAM_ID.toString())
    .then(game => game.gamePath);
}

function prepareForModding(discovery) {
  return fs.ensureDirWritableAsync(path.join(discovery.path, 'natives'), () => Promise.resolve());
}

function installContent(files,
                        destinationPath,
                        gameId,
                        progressDelegate) {
  const rootPath = files.find(file => file.endsWith(NATIVES_DIR));
  const idx = rootPath.length - NATIVES_DIR.length;

  // Remove directories and anything that isn't in the rootPath.
  const filtered = files.filter(file =>
    ((file.indexOf(rootPath) !== -1)
      && (!file.endsWith(path.sep))));

  const instructions = filtered.map(file => {
    return {
      type: 'copy',
      source: file,
      destination: file.substr(idx),
    };
  });
  
  return Promise.resolve({ instructions });
}

function testSupportedContent(files, gameId) {
  // Make sure we're able to support this mod.
  const supported = (gameId === GAME_ID) &&
    (files.find(file => file.indexOf(NATIVES_DIR) !== -1) !== undefined);
  return Promise.resolve({
    supported,
    requiredFiles: [],
  });
}

function main(context) {
  _API = context.api;
  context.registerGame({
    id: GAME_ID,
    name: 'Devil May Cry 5',
    logo: 'gameart.png',
    mergeMods: true,
    queryPath: findGame,
    queryModPath: () => '.',
    executable: () => 'DevilMayCry5.exe',
    requiredFiles: ['DevilMayCry5.exe'],
    details: {
      steamAppId: STEAM_ID,
    },
    setup: prepareForModding,
  });

  context.registerInstaller('dmc5-mod', 25, testSupportedContent, installContent);
}

module.exports = {
  default: main
};