var Matrimony = require('../models/matrimony.model');
var OutgoingRequest = require('../models/outgoingRequests.model');
var IncomingRequest = require('../models/incomingRequests.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var matrimonyConfig = config.matrimony;

exports.listMatrimonies = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var findCriteria = {
        status: 1
    }
    var matrimonysData = await Matrimony.find(findCriteria)
        .limit(perPage)
        .skip(offset)
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing matrimonys',
                error: err
            }
        })
    if (matrimonysData && matrimonysData.success && (matrimonysData.success === 0)) {
        return res.send(matrimonysData);
    }
    var totalMatrimonyCount = await Matrimony.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding matrimony count',
                error: err
            }
        })
    if (totalMatrimonyCount && totalMatrimonyCount.success && (totalMatrimonyCount.success === 0)) {
        return res.send(totalMatrimonyCount);
    }
    totalPages = totalMatrimonyCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalMatrimonyCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination,
        imageBase: matrimonyConfig.imageBase,
        items: matrimonysData,
        message: 'List matrimonys'
    })
}


exports.getProfile = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var id = req.params.id;

    var filter = {
        _id: id,
        status: 1
    };
    // var projection = {
    //     name: 1,
    //     gender: 1,
    //     age: 1,
    //     height: 1,
    //     weight: 1,
    //     education: 1,
    //     profession: 1,
    //     address: 1,
    //     nativePlace: 1,
    //     workPlace: 1,
    //     image: 1
    // };
    var profileData = await Matrimony.findOne(filter)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting matrimony profile',
                error: err
            }
        })
    if (profileData && profileData.success && (profileData.success === 0)) {
        return res.send(profileData);
    }
    return res.status(200).send({
        success: 1,
        item: profileData,
        imageBase: matrimonyConfig.imageBase,
        message : 'Matrimony profile'
    })

}



// exports.create = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var params = req.body;
//     var name = params.name;
//     var gender = params.gender;
//     var age = params.age;
//     var height = params.height;
//     var weight = params.weight;
//     var education = params.education;
//     var profession = params.profession;
//     var address = params.address;
//     var nativePlace = params.nativePlace;
//     var workPlace = params.workPlace;
//     var preferredgroomOrBrideAge = params.preferredgroomOrBrideAge;
//     var preferredgroomOrBrideHeight = params.preferredgroomOrBrideHeight;
//         var checkAccount = await Matrimony.findOne({
//             createdBy: userId,
//             status: 1
//         })
//         .catch(err => {
//             return {
//                 success: 0,
//                 message: 'Something went wrong while finding matrimony profile',
//                 error: err
//             }
//         })
//     if (checkAccount && checkAccount.success && (checkAccount.success === 0)) {
//         return res.send(checkAccount);
//     }
//         if (checkAccount) {
//             return res.status(400).send({
//                 success: 0,
//                 message: 'You have already an account'
//             })
//         }
//         const newMatrimony = new Matrimony({
//             name: name,
//             gender: gender,
//             age: age,
//             image: '',
//             height: height,
//             weight: weight,
//             education: education,
//             profession: profession,
//             address: address,
//             nativePlace: nativePlace,
//             workPlace: workPlace,
//             preferredgroomOrBrideAge: preferredgroomOrBrideAge,
//             preferredgroomOrBrideHeight: preferredgroomOrBrideHeight,
//             createdBy: userId,
//             status: 1,
//             tsCreatedAt: Date.now(),
//             tsModifiedAt: null
//         });
//         var saveMatrimony = await newMatrimony.save()
//         .catch(err => {
//             return {
//                 success: 0,
//                 message: 'Something went wrong while saving matrimony profile',
//                 error: err
//             }
//         })
//         if (saveMatrimony && saveMatrimony.success && (saveMatrimony.success === 0)) {
//             return res.send(saveMatrimony);
//         }

//         return res.status(200).send({
//             success: 1,
//             id: newMatrimony._id,
//             message: 'Data saved successfully'
//         })

// }

// exports.getProfile = async (req, res) => {
//     var id = req.params.id;
//     var isValidId = ObjectId.isValid(id);
//     if (!isValidId) {
//         var responseObj = {
//             success: 0,
//             status: 401,
//             errors: {
//                 field: "id",
//                 message: "id is invalid"
//             }
//         }
//         res.send(responseObj);
//         return;
//     }
//     try {
//         var filter = {
//             _id: id,
//             status: 1
//         };
//         var projection = {
//             name: 1,
//             gender: 1,
//             age: 1,
//             height: 1,
//             weight: 1,
//             education: 1,
//             profession: 1,
//             address: 1,
//             nativePlace: 1,
//             workPlace: 1,
//             image: 1
//         };
//         var profileData = await Matrimony.findOne(filter, projection);
//         res.status(200).send({
//             success: 1,
//             item: profileData
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.editProfile = async (req, res) => {
//     var id = req.params.id;
//     var isValidId = ObjectId.isValid(id);
//     if (!isValidId) {
//         var responseObj = {
//             success: 0,
//             status: 401,
//             errors: {
//                 field: "id",
//                 message: "id is invalid"
//             }
//         }
//         res.send(responseObj);
//         return;
//     }
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var params = req.body;
//     var name = params.name;
//     var gender = params.gender;
//     var age = params.age;
//     var height = params.height;
//     var weight = params.weight;
//     var education = params.education;
//     var profession = params.profession;
//     var address = params.address;
//     var nativePlace = params.nativePlace;
//     var workPlace = params.workPlace;
//     var preferredgroomOrBrideAge = params.preferredgroomOrBrideAge;
//     var preferredgroomOrBrideHeight = params.preferredgroomOrBrideHeight;
//     var file = req.file;
//     try {
//         if (Object.keys(req.body).length === 0) {
//             return res.status(400).send({
//                 success: 0,
//                 message: 'Nothing to update'
//             })
//         }
//         var update = {};
//         if (file) {
//             update.image = file.filename;
//         }
//         if (name) {
//             update.name = name;
//         }
//         if (gender) {
//             update.gender = gender;
//         }
//         if (age) {
//             update.age = age;
//         }
//         if (height) {
//             update.height = height;
//         }
//         if (weight) {
//             update.weight = weight;
//         }
//         if (education) {
//             update.education = education;
//         }
//         if (profession) {
//             update.profession = profession;
//         }
//         if (address) {
//             update.address = address;
//         }
//         if (nativePlace) {
//             update.nativePlace = nativePlace;
//         }
//         if (workPlace) {
//             update.workPlace = workPlace;
//         }
//         if (preferredgroomOrBrideAge) {
//             update.preferredgroomOrBrideAge = preferredgroomOrBrideAge;
//         }
//         if (preferredgroomOrBrideHeight) {
//             update.preferredgroomOrBrideHeight = preferredgroomOrBrideHeight;
//         }
//         update.tsModifiedAt = Date.now();
//         var filter = {
//             _id: id,
//             createdBy: userId,
//             status: 1
//         };
//         var updateProfile = await Matrimony.update(filter, update, {
//             new: true,
//             useFindAndModify: false
//         });
//         res.status(200).send({
//             success: 1,
//             message: 'Profile data updated successfully'
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.getMatches = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var params = req.query;
//     var page = Number(params.page) || 1;
//     page = page > 0 ? page : 1;
//     var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
//     perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
//     var offset = (page - 1) * perPage;
//     var pageParams = {
//         skip: offset,
//         limit: perPage
//     };
//     var matrimonyId = req.body.matrimonyId;
//     var gender = req.body.gender;
//     if (gender == 'female') {
//         gender = 'male'
//     } else {
//         gender = 'female'
//     }
//     try {
//         var filter = {
//             gender: gender,
//             status: 1
//         };
//         var projection = {
//             name: 1,
//             image: 1,
//             profession: 1,
//             workPlace: 1,
//             age: 1,
//             height: 1,
//             nativePlace: 1
//         };
//         var matchesList = await Matrimony.find(filter, projection, pageParams).limit(perPage).sort({
//             'tsCreatedAt': -1
//         });
//         var itemsCount = await Matrimony.countDocuments(filter);
//         totalPages = itemsCount / perPage;
//         totalPages = Math.ceil(totalPages);
//         var hasNextPage = page < totalPages;
//         var pagination = {
//             page: page,
//             perPage: perPage,
//             hasNextPage: hasNextPage,
//             totalItems: itemsCount,
//             totalPages: totalPages
//         }
//         res.status(200).send({
//             success: 1,
//             imageBase: matrimonyConfig.imageBase,
//             pagination: pagination,
//             items: matchesList
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.sendRequest = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var userMatrimonyId = req.body.userMatrimonyId;
//     var senderMatrimonyId = req.body.senderMatrimonyId;
//     try {
//         const newRequestSent = new OutgoingRequest({
//             userId: userId,
//             userMatrimonyId: userMatrimonyId,
//             senderMatrimonyId: senderMatrimonyId,
//             isAccepted: false,
//             isRejected: false,
//             status: 1,
//             tsCreatedAt: Date.now(),
//             tsModifiedAt: null
//         });
//         const newIncomingRequest = new IncomingRequest({
//             userId: userId,
//             userMatrimonyId: senderMatrimonyId,
//             senderMatrimonyId: userMatrimonyId,
//             isAccepted: false,
//             isRejected: false,
//             status: 1,
//             tsCreatedAt: Date.now(),
//             tsModifiedAt: null
//         });
//         var saveNewRequestSent = newRequestSent.save();
//         var saveNewIncomingRequest = newIncomingRequest.save();
//         res.status(200).send({
//             success: 1,
//             message: 'Your interest has been sent successfully'
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.myRequests = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     try {
//         var filter = {
//             userId: userId,
//             status: 1
//         };
//         var projection = {
//             matrimonyId: 1
//         };
//         var myRequestsList = await IncomingRequest.find(filter, projection).populate({
//             path: 'matrimonyId',
//             select: 'name profession age height nativePlace workingPlace'
//         });
//         res.status(200).send({
//             success: 1,
//             items: myRequestsList
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.acceptRequest = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var userMatrimonyId = req.body.userMatrimonyId;
//     var senderMatrimonyId = req.body.senderMatrimonyId;
//     try {
//         var updateSendRequest = await OutgoingRequest.update({
//             userId: userId,
//             userMatrimonyId: userMatrimonyId,
//             senderMatrimonyId: senderMatrimonyId,
//             status: 1
//         }, {
//             isAccepted: true
//         }, {
//             new: true,
//             useFindAndModify: false
//         });
//         var updateIncomingRequest = await IncomingRequest.update({
//             userMatrimonyId: senderMatrimonyId,
//             senderMatrimonyId: userMatrimonyId,
//             status: 1
//         }, {
//             isAccepted: true
//         }, {
//             new: true,
//             useFindAndModify: false
//         });
//         res.status(200).send({
//             success: 1,
//             message: 'Request accepted successfully'
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// exports.ignoreRequest = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var userMatrimonyId = req.body.userMatrimonyId;
//     var senderMatrimonyId = req.body.senderMatrimonyId;
//     try {
//         var updateSendRequest = await OutgoingRequest.update({
//             userId: userId,
//             userMatrimonyId: userMatrimonyId,
//             senderMatrimonyId: senderMatrimonyId,
//             status: 1
//         }, {
//             isRejected: true
//         }, {
//             new: true,
//             useFindAndModify: false
//         });
//         var updateIncomingRequest = await IncomingRequest.update({
//             userMatrimonyId: senderMatrimonyId,
//             senderMatrimonyId: userMatrimonyId,
//             status: 1
//         }, {
//             isRejected: true
//         }, {
//             new: true,
//             useFindAndModify: false
//         });
//         res.status(200).send({
//             success: 1,
//             message: 'Request ignored successfully'
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }