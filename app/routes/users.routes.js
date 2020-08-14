const auth = require('../middleware/auth')
const usersValidator = require('../validators/users-validator');

module.exports = (app) => {
    const users = require('../controllers/users.controller');
    app.get('/users/list',auth, users.userList);
    app.get('/users/:id/profile',auth, users.getUser);
    app.patch('/users/:id/profile',auth, users.updateUser);
    app.delete('/users/:id',auth, users.deleteUser);
    app.patch('/users/:id/block',usersValidator.validator('block'),auth, users.setBlockOrUnBlockUser);

};