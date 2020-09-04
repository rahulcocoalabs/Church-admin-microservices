const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const urogulf = require('../controllers/urogulf.controller');
    app.get('/admin/urogulf/request/list',auth, urogulf.listRequest);
    app.get('/admin/urogulf/branch/list',auth, urogulf.listBranch);
    app.post('/admin/urogulf/branch',auth, urogulf.addBranch);
    app.get('/admin/urogulf/branch/:id/detail',auth, urogulf.getBranchDetails);
    app.patch('/admin/urogulf/branch/:id/update',auth, urogulf.updateBranchDetails);
    app.delete('/admin/urogulf/branch/:id/delete',auth, urogulf.deleteBranch);
};