const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const urogulf = require('../controllers/urogulf.controller');
    app.get('/admin/urogulf/request/list',auth, urogulf.listRequest);
    // app.get('/urogulf/locations', urogulf.list);
    // app.get('/urogulf/locations/:id/near-by', urogulf.nearByLocations);
};