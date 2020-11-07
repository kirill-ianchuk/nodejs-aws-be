const jestOpenAPI = require('jest-openapi');
const path = require('path');

jestOpenAPI(path.join(__dirname, './doc/spec/api.yaml'));
