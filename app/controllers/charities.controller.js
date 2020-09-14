var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Posts = require('../models/post.model')
var Charity = require('../models/charity.model');
var CharityPay = require('../models/charityPayments.model');
var User = require('../models/user.model')
var config = require('../../config/app.config.js');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
const constants = require('../helpers/constants');


var charityConfig = config.charity;
exports.delete = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    let params = req.body;
    var charityId = req.params.id;

    var findCriteria = {
        _id: charityId,
        churchId,
        status: 1
    }
    let charityData = await Charity.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity',
                error: err
            }
        })
    if (charityData && (charityData.success !== undefined) && (charityData.success === 0)) {
        return res.send(charityData);
    }
    if (charityData) {
        var update = {};
        update.status = 0;
        update.tsModifiedAt = Date.now();
        let data = await Charity.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while deleting charities',
                    error: err
                }
            })
        if (data && (data.success !== undefined) && (data.success === 0)) {
            return res.send(userDatas);
        }

        return res.send({
            success: 1,
            message: "Charity deleted successfully"
        })
    } else {
        return res.send({
            success: 0,
            message: "Charity not exist"
        })
    }
}
exports.update = async (req, res) => {

    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    let params = req.body;
    var charityId = req.params.id;
    if (!params.address && !params.caption && !params.title && !params.trustName && !params.fund && !params.phone && !params.about && !req.file) {
        return res.send({
            success: 0,
            message: "Nothing to update"
        })
    }
    var findCriteria = {
        _id: charityId,
        churchId,
        status: 1
    }
    let charityData = await Charity.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity',
                error: err
            }
        })
    if (charityData && (charityData.success !== undefined) && (charityData.success === 0)) {
        return res.send(charityData);
    }
    if (charityData) {
        var update = {};
        if (req.file) {
            var images = [];
            images.push(req.file.filename);
            update.images = images;
        }
        if (params.title) {
            update.title = params.title;
        }
        if (params.trustName) {
            update.trustName = params.trustName;
        }
        if (params.fund) {
            update.fund = params.fund;
        }
        if (params.phone) {
            update.phone = params.phone;
        }
        if (params.about) {
            update.about = params.about;
        }
        if (params.caption) {
            update.caption = params.caption;
        }
        if (params.address) {
            update.address = params.address;
        }
        update.tsModifiedAt = Date.now();
        let data = await Charity.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting users',
                    error: err
                }
            })
        if (data && (data.success !== undefined) && (data.success === 0)) {
            return res.send(userDatas);
        }

        return res.send({
            success: 1,
            message: "Charity successfully updated"
        })
    } else {
        return res.send({
            success: 0,
            message: "Charity not exist"
        })
    }
}
exports.add = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    var errorArray = [];
    var flag = false;
    // var files = req.files;
    var file = req.file;
    var images = [];

    // if (files) {
    // var len = files.image.length;
    // var i = 0;
    // while (i < len) {
    //     images.push(files.image[i].filename);
    //     i++;
    // }
    // }
    if (file) {
        images.push(file.filename)
    }
    var errors = [];
    if (!params.title) {
        errors.push({
            'field': 'title',
            'message': 'title required',
        })
    }
    if (!params.trustName) {
        errors.push({
            'field': 'trustName',
            'message': 'trustName required',
        })
    }
    if (!params.fund) {
        errors.push({
            'field': 'fund',
            'message': 'fund required',
        })
    }
    if (!params.phone) {
        errors.push({
            'field': 'phone',
            'message': 'phone required',
        })
    }
    if (!params.caption) {
        errors.push({
            'field': 'caption',
            'message': 'caption required',
        })
    }
    if (!params.address) {
        errors.push({
            'field': 'address',
            'message': 'address required',
        })
    }
    if (!params.about) {
        errors.push({
            'field': 'about',
            'message': 'about required',
        })
    }
    if (errors.length > 0) {
        return res.send({
            success: 0,
            errors
        })
    }
    var charity = new Charity({
        churchId,
        title: params.title,
        images,
        trustName: params.trustName,
        address: params.address,
        caption: params.caption,
        fund: params.fund,
        phone: params.phone,
        about: params.about,
        // paidOn: params.paidOn,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
    });

    var newCharity = await charity.save();

    var filtersJsonArr = [{ "field": "tag", "key": "church_id", "relation": "=", "value": churchId }]
    // var metaInfo = {"type":"event","reference_id":eventData.id}
    var notificationObj = {
        title: constants.ADD_CHARITY_NOTIFICATION_TITLE,
        message: constants.ADD_CHARITY_NOTIFICATION_MESSAGE,
        type: constants.CHARITY_NOTIFICATION,
        referenceId: newCharity.id,
        filtersJsonArr,
        // metaInfo,
        churchId
    }
    let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
    console.log("notificationData")
    console.log(notificationData)
    console.log("notificationData")
    if (!newCharity) {
        return res.send({
            success: 0,
            message: "something wrong"
        })
    }

    return res.send({
        success: 1,
        id: newCharity.id,
        message: 'New charity added successfully',

    })
}


exports.list = async (req, res) => {

    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var projection = {};
    projection.status = 0;
    projection.__v = 0;
    projection.tsModifiedAt = 0;
    projection.images = 0;
    projection.phone = 0;
    let findCriteria = {
        churchId,
        status: 1
    }

    let data = await Charity.find(
        findCriteria
        , projection)
        .populate([{
            path: 'charityPayments',
            select: {
                transactionId : 1,
                orderId : 1,
                userId: 1,
                amount : 1,
                paidOn : 1
            }
          }])
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        }).catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(userDatas);
    }
  
    data = JSON.parse(JSON.stringify(data));
    data = await calculateReceivedAmount(data);

    var totalCharityCount = await Charity.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding post count',
                error: err
            }
        })
    if (totalCharityCount && (totalCharityCount.success !== undefined) && (totalCharityCount.success === 0)) {
        return res.send(totalCharityCount);
    }

    totalPages = totalCharityCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalCharityCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination,
        imageBase: charityConfig.imageBase,
        items: data,
        message: 'List charities'
    })
}

exports.donations = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var charityId = req.params.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
    var offset = (page - 1) * perPage;

    var findCriteria = {};
    if (params.startDate && params.endDate) {

        var startDate = getDate(params.startDate);
        var endDate = getDate(params.endDate)
        // let currentDate = new Date(year, month, day);

        findCriteria = {
            "paidOn": {
                "$lte": endDate,
                "$gte": startDate,
            }
        }
    }
    findCriteria.charityId = charityId,
        findCriteria.paidStatus = true,
        findCriteria.status = 1

    let charityPaymentData = await CharityPay.find(findCriteria)
        .populate([{
            path: 'charityId',
        }, {
            path: 'userId',

        }])
        .limit(perPage)
        .skip(offset)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity payments',
                error: err
            }
        })
    if (charityPaymentData && (charityPaymentData.success !== undefined) && (charityPaymentData.success === 0)) {
        return res.send(charityData);
    }
    charityPaymentData = JSON.parse(JSON.stringify(charityPaymentData));
    for (let i = 0; i < charityPaymentData.length; i++) {
        if (charityPaymentData[i].userId) {
            charityPaymentData[i].name = charityPaymentData[i].userId.name
        }
        if (charityPaymentData[i].charityId) {
            charityPaymentData[i].charityTitle = charityPaymentData[i].charityId.title
        }
    }
    var charityPayCount = await CharityPay.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding charity pay transaction count',
                error: err
            }
        })
    if (charityPayCount && (charityPayCount.success !== undefined) && (charityPayCount.success === 0)) {
        return res.send(charityPayCount);
    }

    totalPages = charityPayCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: charityPayCount,
        totalPages
    }

    charityPaymentData = JSON.parse(JSON.stringify(charityPaymentData));
    for (let i = 0; i < charityPaymentData.length; i++) {
        charityPaymentData[i].name = charityPaymentData[i].userId.name;
        charityPaymentData[i].charityId = charityPaymentData[i].charityId.id;
        charityPaymentData[i].charityName = charityPaymentData[i].charityId.name;
    }
    return res.status(200).send({
        success: 1,
        pagination,
        items: charityPaymentData,
        message: 'List charities payment transactions'
    })

}

exports.details = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var charityId = req.params.id;

    let charityData = await Charity.findOne({
        _id: charityId,
        churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting details of charity',
                error: err
            }
        })
    if (charityData && (charityData.success !== undefined) && (charityData.success === 0)) {
        return res.send(charityData);
    }
    if (charityData) {
        return res.status(200).send({
            success: 1,
            imageBase: charityConfig.imageBase,
            item: charityData,
            message: 'Charity details'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Charity not exists'
        });
    }
}
function getDate(date) {
    const [day, month, year] = date.split("/")
    return new Date(year, month - 1, day);
    // return new Date(year, month - 1, day).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
}

async function calculateReceivedAmount(data){
    console.log(data)
    for(let i = 0; i < data.length; i++){
       let charityData = data[i];
       var receivedAmount = 0;
       if(charityData.charityPayments && charityData.charityPayments.length > 0){
           var charityPaymentData = charityData.charityPayments;
           for(let j = 0; j < charityPaymentData.length; j++){
                var amount = charityPaymentData[j].amount;
                receivedAmount = receivedAmount + amount;
           }
       }
       data[i].receivedAmount = receivedAmount;
       delete data[i].charityPayments;
    }
    return data
}