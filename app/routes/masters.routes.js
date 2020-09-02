const auth = require('../middleware/auth.js');
module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/admin/masters/church/list', masters.churchList);
    app.get('/admin/masters/:id/parish/list', masters.parishList);
    app.get('/admin/masters/:id/parish-ward/list', masters.parishWardList);
    app.get('/admin/masters/event-category/list', masters.eventCategoryList);
    app.get('/admin/masters/payment/settings',auth, masters.getPayementGatewaySettings);
    app.patch('/admin/masters/payment/settings',auth, masters.updatePayementGatewaySettings);

    app.get('/admin/masters/country/list', masters.countryList);
    app.get('/admin/masters/state/:id/list', masters.stateList);
    app.get('/admin/masters/district/:id/list', masters.districtList);
    app.get('/admin/masters/place/:id/list', masters.placeList);

};