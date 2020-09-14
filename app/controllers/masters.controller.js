var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var EventCategory = require('../models/eventCategory.model');
var Countries = require('../models/countries.model');
var States = require('../models/states.model');
var Districts = require('../models/districts.model');
var Places = require('../models/places.model');
var Designation = require('../models/designation.model');

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
    if (listEventCategoryList && (listEventCategoryList.success !== undefined) && (listEventCategoryList.success === 0)) {
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
    if (churchData && (churchData.success !== undefined) && (churchData.success === 0)) {
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
    if (churchData && (churchData.success !== undefined) && (churchData.success === 0)) {
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
        if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
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


exports.countryList = async (req, res) => {
    var findCriteria = {
        status: 1
    }
    var projection = {
        name: 1
    }
    var countriesData = await Countries.find(findCriteria, projection)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing countries',
                error: err
            }
        })
    if (countriesData && (countriesData.success !== undefined) && (countriesData.success === 0)) {
        return res.send(countriesData);
    }
    return res.send({
        success: 1,
        items: countriesData,
        message: 'List countries'
    })
}

exports.stateList = async (req, res) => {
    var countryId = req.params.id;

    var countryData = await Countries.findOne({
        _id: countryId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking country',
                error: err
            }
        })
    if (countryData && (countryData.success !== undefined) && (countryData.success === 0)) {
        return res.send(countryData);
    }
    if (countryData) {
        var statesData = await States.find({
            countryId,
            status: 1
        })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while listing states',
                    error: err
                }
            })
        if (statesData && (statesData.success !== undefined) && (statesData.success === 0)) {
            return res.send(statesData);
        }
        return res.send({
            success: 1,
            items: statesData,
            message: 'List states'
        })
    } else {
        return res.send({
            success: 0,
            message: 'Invalid country id'
        })
    }
}

exports.districtList = async (req, res) => {
    var stateId = req.params.id;

    var stateData = await States.findOne({
        _id: stateId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking state',
                error: err
            }
        })
    if (stateData && (stateData.success !== undefined) && (stateData.success === 0)) {
        return res.send(stateData);
    }
    if (stateData) {
        var districtData = await Districts.find({
            stateId,
            status: 1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing districts',
                error: err
            }
        })
    if (districtData && (districtData.success !== undefined) && (districtData.success === 0)) {
        return res.send(districtData);
    }
    return res.send({
        success: 1,
        items: districtData,
        message: 'List districts'
    })

    } else {
        return res.send({
            success: 0,
            message: 'Invalid state id'
        })
    }



}

exports.placeList = async(req,res) =>{
    var districtId = req.params.id;

    var districtData = await Districts.findOne({
        _id: districtId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking district',
                error: err
            }
        })
    if (districtData && (districtData.success !== undefined) && (districtData.success === 0)) {
        return res.send(districtData);
    }
    if (districtData) {
        var placeData = await Places.find({
            districtId,
            status: 1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing places',
                error: err
            }
        })
    if (placeData && (placeData.success !== undefined) && (placeData.success === 0)) {
        return res.send(placeData);
    }
    return res.send({
        success: 1,
        items: placeData,
        message: 'List places'
    })

    } else {
        return res.send({
            success: 0,
            message: 'Invalid state id'
        })
    }

}

exports.designationList = async(req,res) =>{
    var designationList = await Designation.find({
        status : 1
    })
    .catch(err => {
        return {
            success: 0,
            message: 'Something went wrong while listing designations',
            error: err
        }
    })
if (designationList && (designationList.success !== undefined) && (designationList.success === 0)) {
    return res.send(designationList);
}
return res.send({
    success: 1,
    items: designationList,
    message: 'List designations'
})
}

exports.updateDesignation = async(req,res) =>{
    var designationId = req.params.id;
    var findCriteria = {
        _id : designationId,
        status : 1
    }
    var designationData = await Designation.findOne(findCriteria)
    .catch(err => {
        return {
            success: 0,
            message: 'Something went wrong while getting designation',
            error: err
        }
    })
if (designationData && (designationData.success !== undefined) && (designationData.success === 0)) {
    return res.send(designationData);
}
if(designationData){
    var update = {};
    var params = req.body;
    if(!params.name){
        return res.send({
            success: 0,
            message: 'Nothing to update'
        })
    }

        update.name = params.name;


    var updateDesignation = await Designation.updateOne(findCriteria,update)
    .catch(err => {
        return {
            success: 0,
            message: 'Something went wrong while updating designation',
            error: err
        }
    })
if (updateDesignation && (updateDesignation.success !== undefined) && (updateDesignation.success === 0)) {
    return res.send(updateDesignation);
}

return res.send({
    success: 1,
    message: 'Designation updated successfully'
})


    
}else{
    return res.send({
        success: 0,
        message: 'Designation not exists'
    })
}
}