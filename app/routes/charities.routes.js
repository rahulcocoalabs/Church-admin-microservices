const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const charities = require('../controllers/charities.controller');
    app.get('/admin/charities/list',auth, charities.list);
    app.post('/admin/charities/add',auth, charities.add);
    app.post('/admin/charities/delete',auth, charities.delete);
    app.post('/admin/charities/update',auth, charities.update);
    app.post('/admin/charities/details',auth, charities.details);
};