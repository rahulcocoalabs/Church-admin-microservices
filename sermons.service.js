var server = require('./server.js'); 
var routes = ['sermons'];
var serviceName = "sermons";
server.start(serviceName, routes);