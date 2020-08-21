var Matrimony = require('../models/matrimony.model');
var OutgoingRequest = require('../models/outgoingRequests.model');
var IncomingRequest = require('../models/incomingRequests.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
var matrimonyConfig = config.matrimony;

exports.listMatrimonies = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var findCriteria = {
        status: 1
    }
    if (params.profileStatus) {
        if (params.profileStatus !== constants.PENDING_PROFILE && params.profileStatus !== constants.APPROVED_PROFILE && params.profileStatus !== constants.REJECTED_PROFILE) {
            return res.send({
                success: 0,
                message: 'Matrimony profile status value invalid'
            })
        } else {
            findCriteria.profileStatus = params.profileStatus;
        }
    }
    var matrimonysData = await Matrimony.find(findCriteria)
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing matrimonys',
                error: err
            }
        })
    if (matrimonysData && matrimonysData.success && (matrimonysData.success === 0)) {
        return res.send(matrimonysData);
    }
    var totalMatrimonyCount = await Matrimony.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding matrimony count',
                error: err
            }
        })
    if (totalMatrimonyCount && totalMatrimonyCount.success && (totalMatrimonyCount.success === 0)) {
        return res.send(totalMatrimonyCount);
    }
    totalPages = totalMatrimonyCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalMatrimonyCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination,
        imageBase: matrimonyConfig.imageBase,
        items: matrimonysData,
        message: 'List matrimonys'
    })
}


exports.getProfile = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var id = req.params.id;

    var filter = {
        _id: id,
        status: 1
    };
    // var projection = {
    //     name: 1,
    //     gender: 1,
    //     age: 1,
    //     height: 1,
    //     weight: 1,
    //     education: 1,
    //     profession: 1,
    //     address: 1,
    //     nativePlace: 1,
    //     workPlace: 1,
    //     image: 1
    // };
    var profileData = await Matrimony.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting matrimony profile',
                error: err
            }
        })
    if (profileData && profileData.success && (profileData.success === 0)) {
        return res.send(profileData);
    }
    return res.status(200).send({
        success: 1,
        item: profileData,
        imageBase: matrimonyConfig.imageBase,
        message: 'Matrimony profile'
    })


}

exports.updateProfileStatus = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var id = req.params.id;
    var params = req.body;
    // var projection = {
    //     name: 1,
    //     gender: 1,
    //     age: 1,
    //     height: 1,
    //     weight: 1,
    //     education: 1,
    //     profession: 1,
    //     address: 1,
    //     nativePlace: 1,
    //     workPlace: 1,
    //     image: 1
    // };
    if (params.profileStatus !== constants.APPROVED_PROFILE && params.profileStatus !== constants.REJECTED_PROFILE) {
        return res.send({
            success: 0,
            message: 'Profile status value invalid'
        })
    }
    var filter = {
        _id: id,
        status: 1
    };
    var profileData = await Matrimony.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking matrimony profile',
                error: err
            }
        })
    if (profileData && profileData.success && (profileData.success === 0)) {
        return res.send(profileData);
    }
    if (profileData) {
        let update = {};
        update.profileStatus = params.profileStatus;
        update.tsModifiedAt = Date.now();
        var profileDataUpdate = await Matrimony.updateOne(filter, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while checking matrimony profile',
                    error: err
                }
            })
        if (profileDataUpdate && profileDataUpdate.success && (profprofileDataUpdateileData.success === 0)) {
            return res.send(profileDataUpdate);
        }
        return res.status(200).send({
            success: 1,
            message: 'Matrimony profile ' + params.profileStatus.toLowerCase() + ' successfully'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Matrimony profile not exists'
        })
    }
}
