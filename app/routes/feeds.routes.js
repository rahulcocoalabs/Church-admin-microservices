const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');

module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.get('/admin/feeds',auth, feeds.feedsList);
    app.patch('/admin/feeds/:id/status',feedsValidator.validator('updateFeedStatus'),auth, feeds.updateFeedStatus);
};