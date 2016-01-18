Package.describe({
  name: 'daishi:planisphere-plugin-submit-page',
  version: '0.0.1',
  summary: 'Submit page plugin for Planisphere (used with MainLayout)',
  git: 'https://github.com/dai-shi/planisphere-plugin-submit-page',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'templating', 'reactive-dict']);
  api.use('aldeed:simple-schema@1.1.0');
  api.use('numtel:template-from-string@0.1.0');
  api.use('dburles:mongo-collection-instances@0.3.5');
  api.use('cfs:standard-packages@0.5.9');
  api.use('cfs:gridfs@0.0.33');
  api.use('daishi:planisphere-core@0.1.0');
  api.addFiles(['src/common.js']);
  api.addFiles(['src/client.js'], 'client');
  api.export('SubmitPage');
});

Package.onTest(function(api) {
  api.use(['ecmascript', 'templating', 'reactive-dict']);
  api.use('tinytest');
  api.use('daishi:planisphere-plugin-submit-page');
  api.addFiles(['tests/common-tests.js']);
});
