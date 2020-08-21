var Post = require('../models/post.model');
var EventCategory = require('../models/eventCategory.model');
var constants = require('../helpers/constants');
var eventType = constants.TYPE_EVENT;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var eventConfig = config.events;

exports.create = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    var eventImage = req.file;
    var errors = [];
    if (!eventImage) {
        errors.push({
            success: 0,
            message: 'Event image required'
        })
    }
    if (!params.name) {
        errors.push({
            field: "name",
            message: 'Event title required'
        })
    }

    if (!params.detail) {
        errors.push({
            field: "detail",
            message: "Event description is required"
        })
    }
    if (!params.venue) {
        errors.push({
            field: "venue",
            message: "Event venue is required"
        })
    }
    if (!params.entryFees) {
        errors.push({
            field: "entryFees",
            message: "Entry fees is required"
        })
    }
    if (!params.categoryId) {
        errors.push({
            field: "categoryId",
            message: "CategoryId is required"
        })
    }
    if (!params.visitors) {
        errors.push({
            field: "visitors",
            message: "visitors is required"
        })
    }
    if (!params.exhibitors) {
        errors.push({
            field: "exhibitors",
            message: "exhibitors is required"
        })
    }
    // if (!params.exhibitors) {
    //     errors.push({
    //         field: "exhibitors",
    //         message: "exhibitors is required"
    //     })
    // }
    if (errors.length > 0) {
        return res.status(400).send({
            success: 0,
            errors: errors
        });
    }

    var eventObj = {};
    eventObj.contentType = eventType;
    eventObj.name = params.name;
    eventObj.detail = params.detail;
    eventObj.venue = params.venue;
    eventObj.churchId = churchId;
    eventObj.entryFees = params.entryFees;
    eventObj.visitors = params.visitors;
    eventObj.exhibitors = params.exhibitors;
    eventObj.categoryId = params.categoryId;
    eventObj.status = 1;
    eventObj.tsCreatedAt = Date.now();
    eventObj.tsModifiedAt = null;

    let newEventObj = new Post(eventObj);
    let eventData = await newEventObj.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving event',
                error: err
            }
        })
    if (eventData && eventData.success && (eventData.success === 0)) {
        return res.send(eventData);
    }
    return res.status(200).send({
        success: 1,
        message: 'Event added successfully'
    })

}

exports.list = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || eventConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : eventConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var findCriteria = {
        contentType: eventType,
        churchId,
        status: 1
    }
    var projection = {
        name: 1,
        image: 1,
        timing: 1,
        venue: 1
    };
    var eventsList = await Post.find(findCriteria)
        .populate([{
            path: 'categoryId',
            select: 'name'
        }])
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing events',
                error: err
            }
        })
    if (eventsList && eventsList.success && (eventsList.success === 0)) {
        return res.send(eventsList);
    }
    var eventsCount = await Post.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting events total count',
                error: err
            }
        })
    if (eventsCount && eventsCount.success && (eventsCount.success === 0)) {
        return res.send(eventsCount);
    }
    totalPages = eventsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: eventsCount,
        totalPages: totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination: pagination,
        imageBase: eventConfig.imageBase,
        items: eventsList
    });

}

exports.detail = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var churchId = identity.church;
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    }
    var filter = {
        _id: id,
        contentType: eventType,
        churchId,
        status: 1
    };
    // var projection = {
    //     name: 1,
    //     detail: 1,
    //     image: 1,
    //     timing: 1,
    //     venue: 1,
    //     entryFees: 1,
    //     participants: 1,
    //     categoryAndType: 1,
    // };
    var eventDetail = await Post.findOne(filter)
        .populate([{
            path: 'categoryId',
            select: 'name'
        }])
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting event detail',
                error: err
            }
        })
    if (eventDetail && eventDetail.success && (eventDetail.success === 0)) {
        return res.send(eventDetail);
    }
    return res.status(200).send({
        success: 1,
        imageBase: eventConfig.imageBase,
        item: eventDetail
    });

}