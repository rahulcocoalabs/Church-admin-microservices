var LivePrayer = require('../models/livePrayer.model');
var config = require('../../config/app.config.js');
const { param } = require('express-validator');
var livePrayerConfig = config.livePrayers;
exports.create = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    var livePrayerObj = {};
    livePrayerObj.title = params.title;
    // livePrayerObj.date = params.date;
    // livePrayerObj.time = params.time;
    // if(req.file){
    //     livePrayerObj.thumbnailImage = req.file.fileName;
    //     }else{
    //     livePrayerObj.thumbnailImage = "";
    //     }
    
    livePrayerObj.description = params.description;
 
    livePrayerObj.churchId = churchId;
    livePrayerObj.liveVideoLink = params.liveVideoLink;
    livePrayerObj.videoLink = params.videoLink;
    livePrayerObj.status = 1;
    livePrayerObj.tsCreatedAt = Date.now();
    livePrayerObj.tsModifiedAt = null;

    var newLivePrayerObj = new LivePrayer(livePrayerObj);
    var newLivePrayerData = newLivePrayerObj.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving live prayer',
                error: err
            }
        })
    if (newLivePrayerData && (newLivePrayerData.success !== undefined) && (newLivePrayerData.success === 0)) {
        return res.send(newLivePrayerData);
    }
    return res.status(200).send({
        success: 1,
        message: 'Live prayer added successfully'
    })
}
exports.list = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || livePrayerConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : livePrayerConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var filter = {
        churchId,
        status: 1
    };
    var projection = {

    };
    var listLivePrayers = await LivePrayer.find(filter)
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing live prayer',
                error: err
            }
        })
    if (listLivePrayers && (listLivePrayers.success !== undefined) && (listLivePrayers.success === 0)) {
        return res.send(listLivePrayers);
    }
    var itemsCount = await LivePrayer.countDocuments(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding total live prayers',
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
    };
    return res.status(200).send({
        success: 1,
        pagination: pagination,
        items: listLivePrayers
    });

}

exports.detail = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var livePrayerId = req.params.id;

    let livePrayerData = await LivePrayer.findOne({
        churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting live prayer detail',
                error: err
            }
        })
    if (livePrayerData && (livePrayerData.success !== undefined) && (livePrayerData.success === 0)) {
        return res.send(livePrayerData);
    }
    if (livePrayerData) {
        return res.status(200).send({
            success: 1,
            // imageBase: eventConfig.imageBase,
            item: livePrayerData,
            message: 'Live prayer details'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Live prayer not exists'
        });
    }
}

exports.update = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var livePrayerId = req.params.id;

    let findCriteria = {
        _id: livePrayerId,
        churchId,
        status: 1
    }
    let livePrayerData = await LivePrayer.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting live prayer detail',
                error: err
            }
        })
    if (livePrayerData && (livePrayerData.success !== undefined) && (livePrayerData.success === 0)) {
        return res.send(livePrayerData);
    }
    if (livePrayerData) {
        let params = req.body;
        if (!params.title && !params.description && !params.liveVideoLink && !params.videoLink) {
            return res.send({
                success: 0,
                message: 'Nothing to update'
            });
        }
        var update = {}
        if (params.title) {
            update.title = params.title;
        }
        if (params.description) {
            update.description = params.description;
        }
        if (params.liveVideoLink) {
            update.liveVideoLink = params.liveVideoLink;
        }
        if (params.videoLink) {
            update.videoLink = params.videoLink;
        }
        update.tsModifiedAt = Date.now();
        let updateData = await LivePrayer.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while updating liveprayer data',
                    error: err
                }
            })
        if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
            return res.send(updateData);
        }
        return res.status(200).send({
            success: 1,
            message: 'Live prayer updated successfully'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Live prayer not exists'
        });
    }
}

exports.delete = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var livePrayerId = req.params.id;

    let findCriteria = {
        _id: livePrayerId,
        churchId,
        status: 1
    }
    let livePrayerData = await LivePrayer.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting live prayer detail',
                error: err
            }
        })
    if (livePrayerData && (livePrayerData.success !== undefined) && (livePrayerData.success === 0)) {
        return res.send(livePrayerData);
    }
    if (livePrayerData) {
        let params = req.body;
        var update = {}
        update.status = 0;
        update.tsModifiedAt = Date.now();
        let updateData = await LivePrayer.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while deleting liveprayer data',
                    error: err
                }
            })
        if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
            return res.send(updateData);
        }
        return res.status(200).send({
            success: 1,
            message: 'Live prayer deleted successfully'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Live prayer not exists'
        });
    }
}