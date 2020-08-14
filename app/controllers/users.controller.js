var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Users = require('../models/user.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
const { users } = require('../../config/app.config.js');
var userConfig = config.users;
exports.userList = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || userConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : userConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var usersList = await Users.find({
        userType: { $nin: [constants.ADMIN_USER, constants.SUB_ADMIN_USER] },
        status: 1
    }, {
        parish : 0,
        parishWard : 0,
        familyMembers : 0,
        userType : 0,
        address : 0,
        tsModifiedAt : 0,

    }, pageParams)
        .limit(perPage)
        .populate('church')
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing users',
                error: err
            }
        })

    if (usersList && usersList.success && (usersList.success === 0)) {
        return res.send(usersList);
    }
    var itemsCount = await Users.countDocuments({
        userType: { $nin: [constants.ADMIN_USER, constants.SUB_ADMIN_USER] },
        status: 1
    });
    totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }
   return res.status(200).send({
        success: 1,
        pagination: pagination,
        imageBase: users.imageBase,
        items: usersList
    })
    // try {
    //     var filter = {
    //         status: 1
    //     };
    //     var projection = {
    //         name: 1
    //     };
    //     var listChurch = await Church.find(filter,projection).sort({
    //         'tsCreatedAt': -1
    //     });
    //     res.status(200).send({
    //         success: 1,
    //         items: listChurch
    //     })
    // } catch (err) {
    //     res.status(500).send({
    //         success: 0,
    //         message: err.message
    //     })
    // }
}

exports.parishList = async (req, res) => {
    var churchId = req.params.id;
    try {
        var filter = {
            churchId: churchId,
            status: 1
        };
        var projection = {
            name: 1
        };
        var listParish = await Parish.find(filter, projection).sort({
            "tsCreatedAt": -1
        });
        res.status(200).send({
            success: 1,
            items: listParish
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.parishWardList = async (req, res) => {
    var parishId = req.params.id;
    try {
        var filter = {
            parishId: parishId,
            status: 1
        };
        var projection = {
            name: 1
        };
        var listParishWards = await ParishWard.find(filter, projection).sort({
            'tsCreatedAt': -1
        })
        res.status(200).send({
            success: 1,
            items: listParishWards
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}