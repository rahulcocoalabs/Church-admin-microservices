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
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    let userDatas = await Users.find({
        userType: { $nin: [constants.ADMIN_USER, constants.SUB_ADMIN_USER] },
        church: churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })
    if (userDatas && userDatas.success && (userDatas.success === 0)) {
        return res.send(userDatas);
    }
    var userIdArray = [];
    for (let i = 0; i < userDatas.length; i++) {
        userIdArray.push(userDatas[i].id);
    }
    console.log("userIdArray")
    console.log(userIdArray)
    console.log("userIdArray")

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var findCriteria = {
        feedCreatedBy: { $in: userIdArray },
        contentType: feedType,
        status: 1
    }
    if (params.isApproved !== undefined) {
        findCriteria.isApproved = params.isApproved;
    }
  
    var postList = await Posts.find(findCriteria)
        .limit(perPage)
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
        items: postList
    })

}
