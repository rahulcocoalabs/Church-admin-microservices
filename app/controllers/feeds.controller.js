var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Posts = require('../models/post.model')
var Users = require('../models/user.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const feedType = constants.TYPE_FEEDPOST;
var feedsConfig = config.feeds;

exports.feedsList = async (req, res) => {
    // return res.send(req.identity.data);
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var userDatas;
    var userIdArray = [];
    var params = req.query;
    var findCriteria = {
        contentType: feedType,
        churchId,
        status: 1
    }
    if (params.userId) {
        findCriteria.feedCreatedBy = params.userId;
    }



    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    if (params.feedStatus) {
        if (params.feedStatus !== constants.PENDING_FEED && params.feedStatus !== constants.APPROVED_FEED && params.feedStatus !== constants.REJECTED_FEED) {
            return res.send({
                success: 0,
                message: 'Feed status value invalid'
            })
        } else {
            findCriteria.feedStatus = params.feedStatus;
        }
    }
    console.log("findCriteria")
    console.log(findCriteria)
    console.log("findCriteria")

    var postList = await Posts.find(findCriteria)
        .populate([{
            path: 'feedCreatedBy',
            select: 'name image'
        },{
            path: 'churchId',
            select:'name'
        }])
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing posts',
                error: err
            }
        })
    if (postList && postList.success && (postList.success === 0)) {
        return res.send(postList);
    }
    var totalPostCount = await Posts.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding post count',
                error: err
            }
        })
    if (totalPostCount && totalPostCount.success && (totalPostCount.success === 0)) {
        return res.send(totalPostCount);
    }

    totalPages = totalPostCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalPostCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination,
        imageBase: feedsConfig.imageBase,
        items: postList,
        message: 'List feeds'
    })

}

exports.updateFeedStatus = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    var feedId = req.params.id;
    if (params.feedStatus !== constants.APPROVED_FEED && params.feedStatus !== constants.REJECTED_FEED) {
        return res.send({
            success: 0,
            message: 'Feed status value invalid'
        })
    }
    var findCriteria = {
        _id: feedId,
        contentType: feedType,
        churchId,
        status: 1
    }
    if (params.userId) {
        findCriteria.feedCreatedBy = params.userId;
    }
    var feedData = await Posts.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding feed',
                error: err
            }
        })
    if (feedData && feedData.success && (feedData.success === 0)) {
        return res.send(feedData);
    }
    if (feedData) {
        var update = {
            feedStatus: params.feedStatus,
            tsModifiedAt: Date.now()
        }
        var feedUpdateData = await Posts.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while finding feed',
                    error: err
                }
            })
        if (feedData && feedData.success && (feedData.success === 0)) {
            return res.send(feedData);
        }
        return res.status(200).send({
            success: 1,
            message: 'Feed ' + params.feedStatus.toLowerCase() + ' successfully'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Feed not exists'
        })
    }



}