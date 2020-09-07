
var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');

var bloodDonation = require('../models/bloodDonation.model');

var User = require('../models/user.model')
var config = require('../../config/app.config.js');
var pushNotificationHelper = require('../helpers/pushNotificationHelper');
const constants = require('../helpers/constants');

var charityConfig = config.charity;
exports.create = async (req, res) => {
   // const identity = req.identity.data;
    // var adminUserId = identity.id;
    // var churchId = identity.church;
    var params = req.body;
    var errorArray = [];
    
    
    var errors = [];
    if (!params.date) {
        errors.push({
            'field': 'date',
            'message': 'date required',
        })
    }
    if (!params.hospital) {
        errors.push({
            'field': 'hospital',
            'message': 'hospital name required',
        })
    }
    if (!params.address) {
        errors.push({
            'field': 'address',
            'message': 'address required',
        })
    }
    if (!params.phone) {
        errors.push({
            'field': 'phone',
            'message': 'phone required',
        })
    }
    if (!params.description) {
        errors.push({
            'field': 'description',
            'message': 'description required',
        })
    }
    if (!params.bloodgroup) {
        errors.push({
            'field': 'bloodgroup',
            'message': 'blood group required',
        })
    }
   
    if (errors.length > 0) {
        return res.send({
            success: 0,
            errors
        })
    }
    var bloodRequirement = new bloodDonation({
       
        address: params.address,
        description: params.description,
        bloodGroup:params.bloodgroup,
        phone: params.phone,
        neededDate: params.date,
        hospitalName:params.hospital,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
    });

    var newbloodDonation = await bloodRequirement.save();

   
   
    if (!newbloodDonation) {
        return res.send({
            success: 0,
            message: "something wrong"
        })
    }

    return res.send({
        success: 1,
        id: newbloodDonation.id,
        message: 'New requirement  added successfully',

    })
}

exports.list = async (req, res) => {

    
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    
    var findCriteria = {
        status:1
    };
    var projection = {
        address:1,
        description:1,
        bloodGroup:1,
        neededDate:1,
        phone:1,
        hospitalName:1,
        hospital:1,
        bloodgroup:1
    };
   
    let data = await bloodDonation.find(findCriteria,projection)
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




    var total = await bloodDonation.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding blood donation requirements count',
                error: err
            }
        })
    if (total && (total.success !== undefined) && (total.success === 0)) {
        return res.send(totalCharityCount);
    }

    totalPages = total / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: total,
        totalPages
    }

    if (total > 0){
        return res.status(200).send({
            success: 1,
            pagination,
        
            items: data,
            message: 'blood donation requirements '
        })
    }
    else {
        return res.status(200).send({
            success: 1,
           
            message: 'no blood donation requirements now'
        })
    }
}

exports.delete = async (req, res) => {
    //const identity = req.identity.data;
    //var adminUserId = identity.id;
    //var churchId = identity.church;
    let params = req.body;
    var id = params.id;

    

    var findCriteria = {
        _id: id,
       
        status: 1
    }
    let data = await bloodDonation.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(charityData);
    }
    if (data) {
        var update = {};
        update.status = 0;
        update.tsModifiedAt = Date.now();
        let data = await bloodDonation.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while deleting requirement for blood donation',
                    error: err
                }
            })
        if (data && (data.success !== undefined) && (data.success === 0)) {
            return res.send(userDatas);
        }

        return res.send({
            success: 1,
            message: "Requirement for blood deleted successfully"
        })
    } else {
        return res.send({
            success: 0,
            message: "requirements does not exist"
        })
    }
}

exports.detail = async (req,res) => {

    var id = req.params.id;
    var filter = {
        
        status: 1
    };
    var requirement = await bloodDonation.findOne(filter)
    .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting event detail',
                error: err
            }
        })
    if (requirement && (requirement.success !== undefined) && (requirement.success === 0)) {
        return res.send(eventDetail);
    }
    if (requirement) {
        return res.status(200).send({
            success: 1,
            
            item: requirement,
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

    // const identity = req.identity.data;
    // var adminUserId = identity.id;
    // var churchId = identity.church;
    let params = req.body;
    var id = req.params.id;
    if (!params.address &&!params.description && !params.bloodgroup && !params.date &&  !params.phone ) {
        return res.send({
            success: 0,
            message: "Nothing to update"
        })
    }
    var findCriteria = {
        _id: id,
      
        status: 1
    }
    let data = await bloodDonation.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(data);
    }
    if (data) {
        var update = {};
        
        if (params.description) {
            update.description = params.description;
        }
        if (params.address) {
            update.address = params.address;
        }
        if (params.neededDate) {
            update.neededDate = params.date;
        }
        if (params.phone) {
            update.phone = params.phone;
        }
        if (params.bloodGroup) {
            update.bloodGroup = params.bloodgroup;
        }
        if (params.hospital) {
            update.hospitalName = params.hospital;
        }
       
        update.tsModifiedAt = Date.now();
        let data = await bloodDonation.updateOne(findCriteria, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting users',
                    error: err
                }
            })
        if (data && (data.success !== undefined) && (data.success === 0)) {
            return res.send(data);
        }

        return res.send({
            success: 1,
            message: "blood requirement successfully updated"
        })
    } else {
        return res.send({
            success: 0,
            message: "blood requirement not exist"
        })
    }
}