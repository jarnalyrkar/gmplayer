module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: './gmplayer.db',
    icon: "./logo"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
    }, {
      name: '@electron-forge/maker-wix',
      icon: './icon.ico'
    }, {
      name: '@electron-forge/maker-zip'
    }, {
      name: '@electron-forge/maker-dmg',
    }

  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
