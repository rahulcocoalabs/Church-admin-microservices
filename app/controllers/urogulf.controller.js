var Urogulf = require('../models/urogulf.model');
var User = require('../models/user.model');
var UserRole = require('../models/userRole.model');
var UrogulfLocation = require('../models/urogulfLocations.model');
var UrogulfNearbyLocation = require('../models/urogulfNearby.model');
var Location = require('../models/locations.model');
var Countries = require('../models/countries.model');
var State = require('../models/states.model');
var District = require('../models/districts.model');
var Place = require('../models/places.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const constants = require('../helpers/constants');
var urogulfConfig = config.urogulf;
var userConfig = config.users;

exports.listRequest = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;


    let userData = await User.findOne({
        _id: adminUserId,
    })
        .populate([{
            path: 'roles',
            select: { name: 1 }

        }])

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        if (userData.roles && userData.roles.length > 0) {
            let index = await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
            if (index > -1) {
                var params = req.query;
                var page = Number(params.page) || 1;
                page = page > 0 ? page : 1;
                var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
                perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
                var offset = (page - 1) * perPage;
                var findCriteria = {};
                findCriteria.status = 1;
                let urogulfRequestList = await Urogulf.find(findCriteria)
                    .populate([{
                        path: 'userId',
                        select: 'name email phone image'

                    }, {
                        path: 'nearbyLocation',
                        select: 'name address urogulfLocationId',
                        populate: {
                            path: 'urogulfLocationId',
                            select: "name"
                        }

                    }, , {
                        path: 'location',
                        select: 'name'

                    }])
                    .limit(perPage)
                    .skip(offset)
                    .sort({
                        'tsCreatedAt': -1
                    }).catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while listing urogulf requests',
                            error: err
                        }
                    })
                if (urogulfRequestList && (urogulfRequestList.success !== undefined) && (urogulfRequestList.success === 0)) {
                    return res.send(urogulfRequestList);
                }
                var urogulfRequestCount = await Urogulf.countDocuments(findCriteria)
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while finding urogulf request count',
                            error: err
                        }
                    })
                if (urogulfRequestCount && (urogulfRequestCount.success !== undefined) && (urogulfRequestCount.success === 0)) {
                    return res.send(urogulfRequestCount);
                }

                totalPages = urogulfRequestCount / perPage;
                totalPages = Math.ceil(totalPages);
                var hasNextPage = page < totalPages;
                var pagination = {
                    page,
                    perPage,
                    hasNextPage,
                    totalItems: urogulfRequestCount,
                    totalPages
                }
                return res.status(200).send({
                    success: 1,
                    imageBase: userConfig.imageBase,
                    pagination,
                    items: urogulfRequestList,
                    message: 'List urogulf request list'
                })

            } else {
                return res.send({
                    success: 0,
                    message: 'Unauthorized'
                })
            }
        }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}


exports.addBranch = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;


    let userData = await User.findOne({
        _id: adminUserId,
    })
        .populate([{
            path: 'roles',
            select: { name: 1 }

        }])

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        if (userData.roles && userData.roles.length > 0) {
            let index = await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
            if (index > -1) {
                var params = req.body;
                if (!params.countryId || !params.stateId ||
                    !params.districtId || !params.branchId ||
                    !params.address) {
                    var errors = [];
                    if (!params.countryId) {
                        errors.push({
                            'field': 'countryId',
                            'message': 'countryId required',
                        })
                    }
                    if (!params.stateId) {
                        errors.push({
                            'field': 'stateId',
                            'message': 'stateId required',
                        })
                    }
                    if (!params.districtId) {
                        errors.push({
                            'field': 'districtId',
                            'message': 'districtId required',
                        })
                    }
                    if (!params.branchId) {
                        errors.push({
                            'field': 'branchId',
                            'message': 'branchId required',
                        })
                    }
                    if (!params.address) {
                        errors.push({
                            'field': 'address',
                            'message': 'address required',
                        })
                    }
                    return res.send({
                        success: 0,
                        errors
                    })
                }
                var checkBranch = await Location.findOne({
                    countryId: params.countryId,
                    stateId: params.stateId,
                    branchId: params.branchId,
                    status: 1
                })
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while checking branch already exists or not',
                            error: err
                        }
                    })
                if (checkBranch && (checkBranch.success !== undefined) && (checkBranch.success === 0)) {
                    return res.send(checkBranch);
                }
                if (checkBranch) {
                    return res.send({
                        success: 0,
                        message: 'Branch already exists'
                    })
                } else {
                    var countryCheck = await Countries.findOne({
                        _id: params.countryId,
                        status: 1
                    })
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while checking country',
                                error: err
                            }
                        })
                    if (countryCheck && (countryCheck.success !== undefined) && (countryCheck.success === 0)) {
                        return res.send(countryCheck);
                    }
                    if (!countryCheck) {
                        return res.send({
                            success: 0,
                            message: 'Country not exists'
                        })
                    }
                    var stateCheck = await State.findOne({
                        _id: params.stateId,
                        countryId: params.countryId,
                        status: 1
                    })
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while checking state',
                                error: err
                            }
                        })
                    if (stateCheck && (stateCheck.success !== undefined) && (stateCheck.success === 0)) {
                        return res.send(stateCheck);
                    }
                    if (!stateCheck) {
                        return res.send({
                            success: 0,
                            message: 'State not exists'
                        })
                    }
                    var districtCheck = await District.findOne({
                        _id: params.districtId,
                        stateId: params.stateId,
                        status: 1
                    })
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while checking district',
                                error: err
                            }
                        })
                    if (districtCheck && (districtCheck.success !== undefined) && (districtCheck.success === 0)) {
                        return res.send(districtCheck);
                    }
                    if (!districtCheck) {
                        return res.send({
                            success: 0,
                            message: 'District not exists'
                        })
                    }
                    var placeCheck = await Place.findOne({
                        _id: params.branchId,
                        districtId: params.districtId,
                        status: 1
                    })
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while checking place',
                                error: err
                            }
                        })
                    if (placeCheck && (placeCheck.success !== undefined) && (placeCheck.success === 0)) {
                        return res.send(placeCheck);
                    }
                    if (!placeCheck) {
                        return res.send({
                            success: 0,
                            message: 'Place not exists'
                        })
                    }
                    var newBranchObj = {};
                    newBranchObj.countryId = params.countryId;
                    newBranchObj.stateId = params.stateId;
                    newBranchObj.districtId = params.districtId;
                    newBranchObj.branchId = params.branchId;
                    newBranchObj.address = params.address;
                    newBranchObj.status = 1;
                    newBranchObj.tsCreatedAt = Date.now();
                    newBranchObj.tsModifiedAt = null;
                    var newBranchData = new Location(newBranchObj);
                    var saveBranchData = await newBranchData.save()
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while getting user data',
                                error: err
                            }
                        })
                    if (saveBranchData && (saveBranchData.success !== undefined) && (saveBranchData.success === 0)) {
                        return res.send(saveBranchData);
                    }
                    return res.send({
                        success: 1,
                        id: saveBranchData.id,
                        message: 'New branch added successfully',

                    })
                }
            } else {
                return res.send({
                    success: 0,
                    message: 'Unauthorized'
                })
            }
        }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}

exports.getBranchDetails = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;


    let userData = await User.findOne({
        _id: adminUserId,
    })
        .populate([{
            path: 'roles',
            select: { name: 1 }

        }])

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        if (userData.roles && userData.roles.length > 0) {
            let index = await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
            if (index > -1) {
                var branchId = req.params.id;
                var branchDetailsData = await Location.findOne({
                    _id: branchId,
                    status: 1
                })
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
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while getting branch details',
                            error: err
                        }
                    })
                if (branchDetailsData && (branchDetailsData.success !== undefined) && (branchDetailsData.success === 0)) {
                    return res.send(branchDetailsData);
                }
                if (branchDetailsData) {
                    return res.status(200).send({
                        success: 1,
                        item: branchDetailsData,
                        message: 'Branch detail'
                    })
                }
            } else {
                return res.send({
                    success: 0,
                    message: 'Unauthorized'
                })
            }
        }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}

exports.updateBranchDetails = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;


    let userData = await User.findOne({
        _id: adminUserId,
    })
        .populate([{
            path: 'roles',
            select: { name: 1 }

        }])

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        if (userData.roles && userData.roles.length > 0) {
            let index = await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
            if (index > -1) {
                var branchId = req.params.id;
                var branchDetailsData = await Location.findOne({
                    _id: branchId,
                    status: 1
                })
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while getting branch details',
                            error: err
                        }
                    })
                if (branchDetailsData && (branchDetailsData.success !== undefined) && (branchDetailsData.success === 0)) {
                    return res.send(branchDetailsData);
                }
                if (branchDetailsData) {
                    var params = req.body;
                    if (!params.address) {
                        return res.send({
                            success: 0,
                            message: 'Nothing to update'
                        })
                    }
                    var update = {};
                    update.address = params.address;
                    update.tsModifiedAt = Date.now();
                    var updateBranch = await Location.updateOne({
                        _id: branchId,
                        status: 1
                    }, update)
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while updating branch details',
                                error: err
                            }
                        })
                    if (updateBranch && (updateBranch.success !== undefined) && (updateBranch.success === 0)) {
                        return res.send(updateBranch);
                    }
                    return res.status(200).send({
                        success: 1,
                        message: 'Branch updated successfully'
                    })
                }
            } else {
                return res.send({
                    success: 0,
                    message: 'Unauthorized'
                })
            }
        }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}

exports.deleteBranch = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;


    let userData = await User.findOne({
        _id: adminUserId,
    })
        .populate([{
            path: 'roles',
            select: { name: 1 }

        }])

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        if (userData.roles && userData.roles.length > 0) {
            let index = await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
            if (index > -1) {
                var branchId = req.params.id;
                var branchDetailsData = await Location.findOne({
                    _id: branchId,
                    status: 1
                })
                    .catch(err => {
                        return {
                            success: 0,
                            message: 'Something went wrong while getting branch details',
                            error: err
                        }
                    })
                if (branchDetailsData && (branchDetailsData.success !== undefined) && (branchDetailsData.success === 0)) {
                    return res.send(branchDetailsData);
                }
                if (branchDetailsData) {
                    var update = {};
                    update.status = 0;
                    update.tsModifiedAt = Date.now();
                    var deleteBranch = await Location.updateOne({
                        _id: branchId,
                        status: 1
                    }, update)
                        .catch(err => {
                            return {
                                success: 0,
                                message: 'Something went wrong while deleting branch details',
                                error: err
                            }
                        })
                    if (deleteBranch && (deleteBranch.success !== undefined) && (deleteBranch.success === 0)) {
                        return res.send(deleteBranch);
                    }
                    return res.status(200).send({
                        success: 1,
                        message: 'Branch deleted successfully'
                    })
                }
            } else {
                return res.send({
                    success: 0,
                    message: 'Unauthorized'
                })
            }
        }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}

