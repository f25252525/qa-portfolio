const { defineConfig } = require('cypress');
const createBundler = require('@cypress/browserify-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const {
  preprendTransformerToOptions,
} = require('@badeball/cypress-cucumber-preprocessor/browserify');

const config = defineConfig({
  e2e: {
    baseUrl: process.env.APP_BASE_URL || 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.{cy.js,feature}',
    video: true,
    async setupNodeEvents(on, config) {
      const stepDefinitionsGlob = 'cypress/support/step-definitions/**/*.{js,ts}';

      config.env = {
        ...config.env,
        stepDefinitions: stepDefinitionsGlob,
        APPLITOOLS_API_KEY:
          process.env.CYPRESS_APPLITOOLS_API_KEY || process.env.APPLITOOLS_API_KEY,
      };

      await addCucumberPreprocessorPlugin(on, config);

      const options = preprendTransformerToOptions(config, createBundler.defaultOptions);

      options.typescript = require.resolve('typescript');

      on('file:preprocessor', createBundler(options));

      return config;
    },
  },
});

module.exports = config;

require('@applitools/eyes-cypress')(module);
