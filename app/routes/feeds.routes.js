const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');

module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.get('/feeds',auth, feeds.feedsList);
    app.patch('/feeds/:id/status',feedsValidator.validator('updateFeedStatus'),auth, feeds.updateFeedStatus);
};