var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Locations = require('../models/locations.model')
var Users = require('../models/user.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const feedType = constants.TYPE_FEEDPOST;
var feedsConfig = config.feeds;

exports.add = async (req, res) => {

    var identity = req.identity.data;
    var params = req.body;
    var errors = [];
    if (!params.countryId) {
        errors.push({
            field: "countryId",
            message: 'countryId required'
        })
    }

    if (!params.stateId) {
        errors.push({
            field: "stateId",
            message: "stateId is required"
        })
    }

    if (!params.districtId) {
        errors.push({
            field: "districtId",
            message: "districtId is required"
        })
    }

    if (!params.branchId) {
        errors.push({
            field: "branchId",
            message: "branchId is required"
        })
    }

    if (!params.address) {
        errors.push({
            field: "address",
            message: "address is required"
        })
    }

    if (errors.length > 0) {
        return res.status(400).send({
            success: 0,
            errors: errors
        });
    }

    var newLocation = new Locations({
        countryId: params.countryId,
        stateId: params.stateId,
        districtId: params.districtId,
        branchId: params.branchId,
        address: params.address,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
    });

    var saved = await newLocation.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving event',
                error: err
            }
        })
    if (saved && (saved.success !== undefined) && (saved.success === 0)) {
        return res.send(saved);
    }
    if (saved) {
        return res.send({
            success: 1,
            message: "added successfully"
        })
    }
    else {
        return res.send({
            success: 0,
            message: "something wrong"
        })
    }

}

exports.list = async (req, res) => {
    // return res.send(req.identity.data);
    var identity = req.identity.data;
    var params = req.query;
    // var page = Number(params.page) || 1;
    // page = page > 0 ? page : 1;
    // var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    // perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    // var offset = (page - 1) * perPage;

    var find = {
        status: 1
    };
    if (params.countryId) {
        find.countryId = params.countryId;
    }
    if (params.stateId) {
        find.stateId = params.stateId;
    }
    if (params.districtId) {
        find.districtId = params.districtId;
    }


    var list = await Locations.find(find)
        .populate([{
            path: 'countryId',
            select: { name: 1 }
        }, {
            path: 'stateId',
            select: { name: 1 }
        }, {
            path: 'districtId',
            select: { name: 1 }
        }, {
            path: 'branchId',
            select: { name: 1 }
        }])
        // .limit(perPage)
        // .skip(offset)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing locations',
                error: err
            }
        })

    if (list && (list.success !== undefined) && (list.success === 0)) {
        return res.send(list);
    }
    return res.send({
        success: 1,
        items: list
    })

}

exports.detail = async (req, res) => {
    var identity = req.identity.data;
    var params = req.body;
    var locationId = req.params.id;

    var filter = {
        _id: locationId,
        status: 1
    }
    let locationData = await Locations.findOne(filter)
        .populate([{
            path: 'countryId',
            select: { name: 1 }
        }, {
            path: 'stateId',
            select: { name: 1 }
        }, {
            path: 'districtId',
            select: { name: 1 }
        }, {
            path: 'branchId',
            select: { name: 1 },

        }])
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting location data',
                error: err
            }
        })
    if (locationData && (locationData.success !== undefined) && (locationData.success === 0)) {
        return res.send(locationData);
    }
    if (locationData) {
        return res.send({
            success: 1,
            item: locationData,
            message: "Location details"
        })
    } else {
        return res.send({
            success: 0,
            message: "Location id invalid"
        })
    }
}

exports.update = async (req, res) => {
    var identity = req.identity.data;
    var params = req.body;
    var locationId = req.params.id;
    if (!params.country && !params.state & !params.district && !params.branch && !params.address) {
        return res.send({
            success: 0,
            message: "Nothing to update"
        })
    }
    var filter = {
        _id: locationId,
        status: 1
    }
    let locationData = await Locations.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting location data',
                error: err
            }
        })
    if (locationData && (locationData.success !== undefined) && (locationData.success === 0)) {
        return res.send(locationData);
    }
    if (locationData) {
        var update = {};
        // if (params.countryId) {
        //     update.countryId = params.countryId;
        // }
        // if (params.stateId) {
        //     update.stateId = params.stateId;
        // }
        // if (params.districtId) {
        //     update.districtId = params.districtId;
        // }
        // if (params.branchId) {
        //     update.branchId = params.branchId;
        // }
        if (params.address) {
            update.address = params.address;
        }
        update.tsModifiedAt = Date.now()
        let updateLocationData = await Locations.updateOne(filter, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting location data',
                    error: err
                }
            })
        if (updateLocationData && (updateLocationData.success !== undefined) && (updateLocationData.success === 0)) {
            return res.send(updateLocationData);
        }
        return res.send({
            success: 1,
            message: "Location updated successfully"
        })

    } else {
        return res.send({
            success: 0,
            message: "Location id invalid"
        })
    }
}

exports.delete = async (req, res) => {
    var identity = req.identity.data;
    var params = req.body;
    var locationId = req.params.id;

    var filter = {
        _id: locationId,
        status: 1
    }
    let locationData = await Locations.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting location data',
                error: err
            }
        })
    if (locationData && (locationData.success !== undefined) && (locationData.success === 0)) {
        return res.send(locationData);
    }
    if (locationData) {
        var update = {
            status: 0,
            tsModifiedAt: Date.now()
        }
        var locationUpdateData = await Locations.updateOne(filter, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting location data',
                    error: err
                }
            })
        if (locationUpdateData && (locationUpdateData.success !== undefined) && (locationUpdateData.success === 0)) {
            return res.send(locationUpdateData);
        }
        return res.send({
            success: 1,
            message: "Location deleted successfully"
        })
    } else {
        return res.send({
            success: 0,
            message: "Location id invalid"
        })
    }
}
