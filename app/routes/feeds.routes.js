const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.get('/feeds/list',auth, feeds.feedsList);
};