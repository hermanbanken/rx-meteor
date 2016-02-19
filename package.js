Package.describe({
  name: 'hermanbanken:rx-meteor',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "rx": "4.0.6",
});

var lib = [
  'meteor-scheduler',
  'meteor-async-scheduler',
]

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  lib.forEach(function (f) { api.addFiles('lib/' + f + '.js') });
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('hermanbanken:rx-meteor');
  lib.forEach(function (f) { api.addFiles('lib/' + f + '.js') });
  api.addFiles('tests/rx-meteor-tests.js');
});
