var server = require('./server.js'); 
var routes = ['locations'];
var serviceName = "locations";
server.start(serviceName, routes);
