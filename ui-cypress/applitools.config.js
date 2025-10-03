module.exports = {
  testConcurrency: 1,
  apiKey: process.env.APPLITOOLS_API_KEY,
  batch: {
    name: 'Cypress Visual AI',
  },
  browser: [
    { width: 1280, height: 720, name: 'chrome' },
    { width: 1280, height: 720, name: 'firefox' },
    { width: 1280, height: 720, name: 'edgechromium' },
  ],
};
