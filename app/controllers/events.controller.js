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
    var eventImages = req.files;
    console.log("req.files")
    console.log(req.files)
    console.log("req.files")
    var errors = [];

    // if (!eventImage) {
    //     errors.push({
    //         success: 0,
    //         message: 'Event image required'
    //     })
    // }
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
    if (!params.timings) {
        errors.push({
            field: "timings",
            message: "timings is required"
        })
    }
    if (errors.length > 0) {
        return res.status(400).send({
            success: 0,
            errors: errors
        });
    }

    var eventObj = {};
    var images = [];
    eventObj.contentType = eventType;
    eventObj.name = params.name;
    eventObj.detail = params.detail;
    eventObj.venue = params.venue;
    eventObj.churchId = churchId;
    console.log("req.file")
    console.log(req.file)
    console.log("req.file")
    // if(eventImage){
    // eventObj.image = eventImage.filename;
    // }else{
    // eventObj.image = "";
    // }
    if (eventImages.images) {
        //     return res.status(400).send({
        //         success: 0,
        //         message: 'Atleast one image is required'
        //     })
        // } else {
        var len = eventImages.images.length;
        var i = 0;
        while (i < len) {
            console.log("eventImages.images[i].filename")
            console.log(eventImages.images[i].filename)
            console.log("eventImages.images[i].filename")
            images.push(eventImages.images[i].filename);
            i++;
        }
        eventObj.images = images;
        eventObj.image = eventImages.images[0].filename;
        
    }

    eventObj.entryFees = params.entryFees;
    eventObj.timings = params.timings;
    eventObj.visitors = params.visitors;
    eventObj.exhibitors = params.exhibitors;
    // let obj = await setDisplayDetails(params);
    // eventObj.timing = obj.timing;
    // eventObj.participants = obj.participants;
    eventObj.categoryId = params.categoryId;
    eventObj.status = 1;
    eventObj.tsCreatedAt = Date.now();
    eventObj.tsModifiedAt = null;
    console.log("eventObj")
    console.log(eventObj)
    console.log("eventObj")
    let newEventObj = new Post(eventObj);
    let eventData = await newEventObj.save()
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while saving event',
                error: err
            }
        })
    if (eventData && (eventData.success !== undefined) && (eventData.success === 0)) {
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
    if (eventsList && (eventsList.success !== undefined) && (eventsList.success === 0)) {
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
    if (eventsCount && (eventsCount.success !== undefined) && (eventsCount.success === 0)) {
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
    if (eventDetail && (eventDetail.success !== undefined) && (eventDetail.success === 0)) {
        return res.send(eventDetail);
    }
    if (eventDetail) {
        return res.status(200).send({
            success: 1,
            imageBase: eventConfig.imageBase,
            item: eventDetail,
            message: 'Event details'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Event not exists'
        });
    }

}

exports.update = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    var eventId = req.params.id;
    if (!req.files && !params.name && !params.detail && !params.venue && !params.entryFees
        && !params.entryFees && !params.categoryId && !params.visitors && !params.exhibitors) {
        return res.status(400).send({
            success: 0,
            message: "Nothing to update"
        });
    }
    let findCriteria = {
        _id: eventId,
        contentType: eventType,
        churchId,
        status: 1
    }
    let eventData = await Post.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking event exists',
                error: err
            }
        })
    if (eventData && (eventData.success !== undefined) && (eventData.success === 0)) {
        return res.send(eventData);
    }
    if (eventData) {
        var update = {};
        if (eventImage) {
            update.image = eventImage.filename;
        }
        if (params.name) {
            update.name = params.name;
        }

        if (params.detail) {
            update.detail = params.detail;
        }
        if (params.venue) {
            update.venue = params.venue;
        }
        if (params.entryFees) {
            update.entryFees = params.entryFees;
        }
        if (params.categoryId) {
            update.categoryId = params.categoryId;
        }
        if (params.visitors) {
            update.visitors = params.visitors;
        }
        if (params.exhibitors) {
            update.exhibitors = params.exhibitors;
        }
        var eventImages = req.files;
        if (eventImages) {
            var images = [];
            console.log("eventImages")
            console.log(eventImages)
            console.log("eventImages")
                var len = eventImages.images.length;
                var i = 0;
                while (i < len) {
                    images.push(eventImages.images[i].filename);
                    i++;
                }
                update.images = images;
                update.image = eventImages.images[0].filename;
            }

        var obj = {};
        if (params.timings) {
            obj = await setDisplayDetails(params);
        }
        if (params.timings) {
            update.timings = params.timings;
            update.timing = obj.timing;

        }

        // update.participants = obj.participants;
        update.tsModifiedAt = Date.now();
        let updateEvent = await Post.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while updating event',
                    error: err
                }
            })
        if (updateEvent && (updateEvent.success !== undefined) && (updateEvent.success === 0)) {
            return res.send(updateEvent);
        }
        return res.send({
            success: 1,
            message: 'Event updated successfully'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Event not exists'
        });
    }

}

exports.delete = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var eventId = req.params.id;
    let findCriteria = {
        _id: eventId,
        contentType: eventType,
        churchId,
        status: 1
    }
    let eventData = await Post.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking event exists',
                error: err
            }
        })
    if (eventData && (eventData.success !== undefined) && (eventData.success === 0)) {
        return res.send(eventData);
    }
    if (eventData) {
        var update = {};
        update.status = 0;
        update.tsModifiedAt = Date.now();
        let updateEvent = await Post.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while deleting event',
                    error: err
                }
            })
        if (updateEvent && (updateEvent.success !== undefined) && (updateEvent.success === 0)) {
            return res.send(updateEvent);
        }
        return res.send({
            success: 1,
            message: 'Event deleted successfully'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Event not exists'
        });
    }
}


async function setDisplayDetails(params) {
    var obj = {};
    // var participantsArray = [];
    var timingArray = [];

    if (params.timings) {
        var timings = params.timings;
        for (let i = 0; i < timings.length; i++) {
            let timingObj = timings[i];
            let timingString = '';
            var startTime = new Date(timingObj.startTime);
            // console.log(startTime.toLocaleString() ); 
            // console.log(startTime.toLocaleString() ); 
            console.log(timingObj.startTime)
            var endTime = new Date(timingObj.endTime);
            // console.log(timingObj.startTime.split("T")[1].split("Z")[0]);
            console.log("startTime : " + startTime)
            // console.log("endTime : " + endTime)
            timingString = timingString + formatAMPM(addHours(startTime)) + ' - ' + formatAMPM(addHours(endTime)) + ' ( ' + timingObj.date + ' )';
            timingArray.push(timingString);
        }
        obj.timing = timingArray;
    }
    // if(params.visitors){
    //     participantsArray.push(params.visitors + " visitors")
    // }
    // if(params.exhibitors){
    //     participantsArray.push(params.exhibitors + " exhibitors")
    // }
    // obj.participants = participantsArray;
    return obj;
}

// function addHours(date){
//     date.setTime(date.getTime() - (5.5*60*60*1000));
//     return date;

// }

// function formatAMPM(date) {
//     var hours = date.getHours();
//     var minutes = date.getMinutes();
//     var ampm = hours >= 12 ? 'pm' : 'am';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     minutes = minutes < 10 ? '0'+minutes : minutes;
//     var strTime = hours + ':' + minutes + ' ' + ampm;
//     console.log("strTime : " + strTime)
//     return strTime;
//   }

// function getFormattedDate(date) {
//     var month = date.getMonth() + 1;
//     var day = format(date.getDate());
//     var year = format(date.getFullYear());
//     return dd + "/" + day + "/" + year;
// }