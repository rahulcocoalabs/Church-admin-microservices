module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/masters/church/list', masters.churchList);
    app.get('/masters/:id/parish/list', masters.parishList);
    app.get('/masters/:id/parish-ward/list', masters.parishWardList);
};