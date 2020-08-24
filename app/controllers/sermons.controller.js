var Sermons = require('../models/post.model');
var Paster = require('../models/paster.model');
var config = require('../../config/app.config.js');
var constant = require('../helpers/constants');
const constants = require('../helpers/constants');
var sermonsType = constant.TYPE_SERMONS;
var sermonsConfig = config.sermons;
var feedsConfig = config.feeds;
var pastersConfig = config.pasters;

exports.create = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;

    var sermonsObj = {};
    sermonsObj.contentType = constants.TYPE_SERMONS;
    sermonsObj.churchId = churchId;
    sermonsObj.postContent = params.title;
    sermonsObj.textContent = params.description;
    sermonsObj.postType = constants.TEXT_POST_TYPE;
    sermonsObj.textStyle = {
        fontStyle: 1,
        textAlign: params.textAlign,
        bgColor: params.textColor,
    }
    sermonsObj.sermonsCreatedBy = adminUserId;
    sermonsObj.status = 1;
    sermonsObj.tsCreatedAt = Date.now();
    sermonsObj.tsModifiedAt = null;

    let newSermonsObj = new Sermons(sermonsObj);
    let newSermonsData = await newSermonsObj.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving sermon',
                error: err
            }
        })
    if (newSermonsData && (newSermonsData.success !== undefined) && (newSermonsData.success === 0)) {
        return res.send(newSermonsData);
    }
    return res.status(200).send({
        success: 1,
        message: 'Sermons added successfully'
    })
}

// *** Sermons List ***
exports.list = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || sermonsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : sermonsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var filter = {};
    filter.churchId = churchId;
    filter.contentType = constants.TYPE_SERMONS;
    filter.status = 1;
    // var projection = {
    //     postContent: 1,
    //     postType: 1,
    //     fileName: 1,
    //     textStyle: 1,
    //     textContent: 1,
    //     sermonsCreatedBy: 1,
    //     tsCreatedAt: 1
    // };
    var sermonsList = await Sermons.find(filter)

        // .populate({
        //     path: 'sermonsCreatedBy',
        //     select: 'name image'
        // })
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing sermons',
                error: err
            }
        })
    if (sermonsList && (sermonsList.success !== undefined) && (sermonsList.success === 0)) {
        return res.send(sermonsList);
    }
    var itemsCount = await Sermons.countDocuments(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while counting total sermons',
                error: err
            }
        })
    if (itemsCount && (itemsCount.success !== undefined) && (itemsCount.success === 0)) {
        return res.send(itemsCount);
    }
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
        // sermonsFileBase: feedsConfig.imageBase,
        // pasterImageBase: pastersConfig.imageBase,
        pagination: pagination,
        items: sermonsList
    })

}

exports.detail = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var sermonId = req.params.id;

    var filter = {};
    filter._id = sermonId;
    filter.churchId = churchId;
    filter.contentType = constants.TYPE_SERMONS;
    filter.status = 1;

    let sermonDetail = await Sermons.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting sermon detail',
                error: err
            }
        })
    if (sermonDetail && (sermonDetail.success !== undefined) && (sermonDetail.success === 0)) {
        return res.send(sermonDetail);
    }
    if (sermonDetail) {
        return res.status(200).send({
            success: 1,
            // sermonsFileBase: feedsConfig.imageBase,
            // pasterImageBase: pastersConfig.imageBase,
            // pagination: pagination,
            item: sermonDetail,
            message: 'Sermons detail'

        })
    } else {
        return res.send({
            success: 0,
            message: 'Sermons not exists'
        });
    }
}

exports.update = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var sermonId = req.params.id;

    var filter = {};
    filter._id = sermonId;
    filter.churchId = churchId;
    filter.contentType = constants.TYPE_SERMONS;
    filter.status = 1;

    let sermonDetail = await Sermons.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting sermon detail',
                error: err
            }
        })
    if (sermonDetail && (sermonDetail.success !== undefined) && (sermonDetail.success === 0)) {
        return res.send(sermonDetail);
    }
    if (sermonDetail) {
        var params = req.body;
        if (!params.title && !params.description && !params.textAlign && !params.textColor) {
            return res.send({
                success: 0,
                message: 'Nothing to update'
            });
        }
        var update = {};
        var textStyle = sermonDetail.textStyle;
        var textStyleCheck = false;
        if (params.title) {
            update.postContent = params.title
        }
        if (params.title) {
            update.textContent = params.description
        }
        var obj = {};

        // if(params.fontStyle){
        //     textStyleCheck = true;
        //     obj.fontStyle = params.fontStyle
        // }else{
            // obj.fontStyle = params.fontStyle
        // }
            obj.fontStyle = textStyle.fontStyle

        if (params.textAlign) {
            textStyleCheck = true;
            obj.textAlign = params.textAlign
        }else{
            obj.textAlign = textStyle.textAlign;
        }
        if (params.textColor) {
            textStyleCheck = true;
            obj.bgColor = params.textColor
        }else{
            obj.bgColor = textStyle.textColor;
        }
        console.log("params")
        console.log(params)
        console.log("params")
        console.log("textStyle")
        console.log(textStyle)
        console.log("textStyle")
        if (textStyleCheck) {
            update.textStyle = obj;
        }
        update.tsModifiedAt = Date.now();
        let updateSermonData = await Sermons.updateOne(filter, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while updating sermon detail',
                    error: err
                }
            })
        if (updateSermonData && (updateSermonData.success !== undefined) && (updateSermonData.success === 0)) {
            return res.send(updateSermonData);
        }
        return res.status(200).send({
            success: 1,
            message: 'Sermons updated successfully'

        })
    } else {
        return res.send({
            success: 0,
            message: 'Sermons not exists'
        });
    }
}

exports.delete = async(req,res) =>{
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var sermonId = req.params.id;

    var filter = {};
    filter._id = sermonId;
    filter.churchId = churchId;
    filter.contentType = constants.TYPE_SERMONS;
    filter.status = 1;

    let sermonDetail = await Sermons.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting sermon detail',
                error: err
            }
        })
    if (sermonDetail && (sermonDetail.success !== undefined) && (sermonDetail.success === 0)) {
        return res.send(sermonDetail);
    }
    if (sermonDetail) {
        var update = {};
        update.status  = 0;   
        update.tsModifiedAt = Date.now();
        let deleteSermonData = await Sermons.updateOne(filter, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while deleting sermon',
                    error: err
                }
            })
        if (deleteSermonData && (deleteSermonData.success !== undefined) && (deleteSermonData.success === 0)) {
            return res.send(deleteSermonData);
        }
        return res.status(200).send({
            success: 1,
            message: 'Sermons deleted successfully'

        })
    } else {
        return res.send({
            success: 0,
            message: 'Sermons not exists'
        });
    }
}