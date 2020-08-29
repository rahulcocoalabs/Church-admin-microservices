var Church = require('../models/church.model');
var User = require('../models/user.model')
var Ngo = require('../models/ngo.model')
var config = require('../../config/app.config.js');
// var pushNotificationHelper = require('../helpers/pushNotificationHelper');
const constants = require('../helpers/constants');


var ngoConfig = config.ngos;


exports.add = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
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
    let ngoDetails = await Ngo.findOne({
        churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting ngo details',
                error: err
            }
        })
    if (ngoDetails && (ngoDetails.success !== undefined) && (ngoDetails.success === 0)) {
        return res.send(ngoDetails);
    }
    if (ngoDetails) {
        return res.send({
            success: 0,
            message: 'Ngo already exist for this church'
        });
    } else {
        if (file) {
            images.push(file.filename)
        }
        var errors = [];
        if (!params.ngoName) {
            errors.push({
                'field': 'ngoName',
                'message': 'Ngo Name required',
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
        var ngo = new Ngo({
            churchId,
            images,
            ngoName: params.ngoName,
            address: params.address,
            caption: params.caption,
            phone: params.phone,
            about: params.about,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });

        var newNgo = await ngo.save()
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while creating ngo',
                    error: err
                }
            })
        if (newNgo && (newNgo.success !== undefined) && (newNgo.success === 0)) {
            return res.send(newNgo);
        }

        // var filtersJsonArr = [{"field":"tag","key":"church_id","relation":"=","value":churchId}]
        // // var metaInfo = {"type":"event","reference_id":eventData.id}
        // var notificationObj = {
        //     title : constants.ADD_CHARITY_NOTIFICATION_TITLE,
        //     message : constants.ADD_CHARITY_NOTIFICATION_MESSAGE,
        //     type : constants.CHARITY_NOTIFICATION,
        //     referenceId : newCharity.id,
        //     filtersJsonArr,
        //     // metaInfo,
        //     churchId
        // }
        // let notificationData = await pushNotificationHelper.sendNotification(notificationObj)
        // console.log("notificationData")
        // console.log(notificationData)
        // console.log("notificationData")
        return res.send({
            success: 1,
            id: newNgo.id,
            message: 'Ngo added successfully',

        })
    }
}

exports.details = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;

    let ngoDetails = await Ngo.findOne({
        churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting ngo details',
                error: err
            }
        })
    if (ngoDetails && (ngoDetails.success !== undefined) && (ngoDetails.success === 0)) {
        return res.send(ngoDetails);
    }
    if (ngoDetails) {
        return res.send({
            success: 1,
            imageBase: ngoConfig.imageBase,
            item: ngoDetails,
            message: 'Ngo details'
        });
    } else {
        return res.send({
            success: 0,
            message: 'Ngo not found'
        });
    }
}

exports.update = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    let ngoDetails = await Ngo.findOne({
        churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting ngo details',
                error: err
            }
        })
    if (ngoDetails && (ngoDetails.success !== undefined) && (ngoDetails.success === 0)) {
        return res.send(ngoDetails);
    }
    if (ngoDetails) {
        let params = req.body;
        if (!req.file && !params.ngoName && !params.caption && !params.phone && !params.address && !params.about) {
            return res.send({
                success: 0,
                message: 'Nothing to update'
            });
        }
        var images = [];
        var update = {};
        if (req.file) {
            images.push(req.file.filename);
            update.images = images;
        }
        if (params.ngoName) {
            update.ngoName = params.ngoName
        }
        if (params.caption) {
            update.caption = params.caption
        }
        if (params.phone) {
            update.phone = params.phone
        }
        if (params.address) {
            update.address = params.address
        }
        if (params.about) {
            update.about = params.about
        }
        let updateNgo = await Ngo.updateOne({
            _id: ngoDetails.id,
            churchId,
            status: 1
        }, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting ngo details',
                    error: err
                }
            })
        if (updateNgo && (updateNgo.success !== undefined) && (updateNgo.success === 0)) {
            return res.send(updateNgo);
        }
        return res.send({
            success: 1,
            message: 'Ngo updated successfully',
        })

    } else {
        return res.send({
            success: 0,
            message: 'Ngo not found'
        });
    }

}