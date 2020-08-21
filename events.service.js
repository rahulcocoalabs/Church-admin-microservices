var server = require('./server.js'); 
var routes = ['events'];
var serviceName = "events";
server.start(serviceName, routes);