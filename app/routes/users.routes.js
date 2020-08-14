const auth = require('../middleware/auth')

module.exports = (app) => {
    const users = require('../controllers/users.controller');
    app.get('/users/list',auth, users.userList);

};