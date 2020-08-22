var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var EventCategory = require('../models/eventCategory.model');

exports.churchList = async (req, res) => {
    try {
        var filter = {
            status: 1
        };
        var projection = {
            name: 1
        };
        var listChurch = await Church.find(filter, projection).sort({
            'tsCreatedAt': -1
        });
        res.status(200).send({
            success: 1,
            items: listChurch
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
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

exports.eventCategoryList = async (req, res) => {
    var filter = {
        status: 1,
        status: 1
    };
    var projection = {
        name: 1
    };
    var listEventCategoryList = await EventCategory.find(filter, projection)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing event categories',
                error: err
            }
        })
    if (listEventCategoryList && listEventCategoryList.success && (listEventCategoryList.success === 0)) {
        return res.send(listEventCategoryList);
    }

    return res.status(200).send({
        success: 1,
        items: listEventCategoryList,
        message: 'Event category list'
    })

}

exports.getPayementGatewaySettings = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    let churchData = await Church.findOne({
        _id: churchId,
        status: 1,
    }, {
        paymentGatewayKey: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting church data',
                error: err
            }
        })
    if (churchData && churchData.success && (churchData.success === 0)) {
        return res.send(churchData);
    }
    if (churchData) {
        return res.send({
            success: 1,
            paymentGatewayKey: churchData.paymentGatewayKey || "",
            message: 'Payment gateway details'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Church not found'
        })
    }
}

exports.updatePayementGatewaySettings = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.body;
    if (!params.paymentGatewayKey) {
        return res.send({
            success: 0,
            message: 'Nothing to update'
        })
    }
    let findCriteria = {
        _id: churchId,
        status: 1,
    }
    let churchData = await Church.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting church data',
                error: err
            }
        })
    if (churchData && churchData.success && (churchData.success === 0)) {
        return res.send(churchData);
    }
    if (churchData) {
        let update = {};
        update.paymentGatewayKey = params.paymentGatewayKey;
        update.tsModifiedAt = Date.now()
        let updateData = await Church.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while updating payment gateway settings',
                    error: err
                }
            })
        if (updateData && updateData.success && (updateData.success === 0)) {
            return res.send(updateData);
        }
        return res.send({
            success: 1,
            paymentGatewayKey: params.paymentGatewayKey,
            message: 'Payment gateway updated successfully'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Church not found'
        })
    }
}