/*
 * Windshaft-CartoDB
 * ===============
 *
 * ./app.js [environment]
 *
 * environments: [development, production]
 */


// sanity check
var ENV = process.argv[2]
if (ENV != 'development' && ENV != 'production'){
    console.error("\nnode app.js [environment]");
    console.error("environments: [development, production]\n");
    process.exit(1);
}

var _ = require('underscore')
    , Step       = require('step')
	, CartodbWindshaft = require('./lib/cartodb/cartodb_windshaft');

// set environment specific variables
global.settings     = require(__dirname + '/config/settings');
global.environment  = require(__dirname + '/config/environments/' + ENV);
_.extend(global.settings, global.environment);

// Include cart_data.js only _after_ the "global" variable is set
// See https://github.com/Vizzuality/Windshaft-cartodb/issues/28
var cartoData = require('./lib/cartodb/carto_data');

var Windshaft = require('windshaft');
var serverOptions = require('./lib/cartodb/server_options');

ws = CartodbWindshaft(serverOptions);

// Maximum number of connections for one process
// 128 is a good number if you have up to 1024 filedescriptors
// 4 is good if you have max 32 filedescriptors
// 1 is good if you have max 16 filedescriptors
ws.maxConnections = global.environment.maxConnections || 128;

ws.listen(global.environment.port, global.environment.host);

ws.on('listening', function() {
  console.log("Windshaft tileserver started on " + global.environment.host + ':' + global.environment.port);
});

process.on('SIGUSR1', function() {
  ws.dumpCacheStats();
});
