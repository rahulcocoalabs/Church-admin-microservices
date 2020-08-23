const auth = require('../middleware/auth.js');
const sermonsValidator = require('../validators/sermons-validator');

module.exports = (app) => {
    const sermons = require('../controllers/sermons.controller');
    app.post('/admin/sermons/create', auth,sermonsValidator.validator('create'), sermons.create);
    app.get('/admin/sermons/list', auth, sermons.list);
    app.get('/admin/sermons/:id/detail', auth, sermons.detail);
    app.patch('/admin/sermons/:id/update', auth, sermons.update);
    app.delete('/admin/sermons/:id/delete', auth, sermons.delete);
};