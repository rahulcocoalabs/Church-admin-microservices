const auth = require('../middleware/auth')
const usersValidator = require('../validators/users-validator');

module.exports = (app) => {
    const users = require('../controllers/users.controller');
    app.get('/admin/users/list',auth, users.userList);
    app.get('/admin/users/priests',auth, users.getPriests);
    app.get('/admin/users/:id/profile',auth, users.getUser);
    app.patch('/admin/users/:id/profile',auth, users.updateUser);
    app.delete('/admin/users/:id',auth, users.deleteUser);
    app.patch('/admin/users/:id/block',auth,usersValidator.validator('block'), users.setBlockOrUnBlockUser);
    app.get('/admin/users/:id/charity',auth, users.charityTransactionsList);

};