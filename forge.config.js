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
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
