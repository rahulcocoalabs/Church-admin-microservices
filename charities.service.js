var server = require('./server.js'); 
var routes = ['charities'];
var serviceName = "charities";
server.start(serviceName, routes);