const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');

module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.get('/admin/feeds/list',auth, feeds.feedsList);
    app.patch('/admin/feeds/:id/status',auth,feedsValidator.validator('updateFeedStatus'), feeds.updateFeedStatus);
};