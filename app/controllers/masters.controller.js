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
        var listChurch = await Church.find(filter,projection).sort({
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

exports.eventCategoryList = async(req,res) =>{
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
            items: listEventCategoryList
        })

}