var server = require('./server.js'); 
var routes = ['livePrayer'];
var serviceName = "livePrayer";
server.start(serviceName, routes);