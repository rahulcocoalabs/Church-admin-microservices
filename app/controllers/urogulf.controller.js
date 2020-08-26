var Urogulf = require('../models/urogulf.model');
var User = require('../models/user.model');
var UserRole = require('../models/userRole.model');
var UrogulfLocation = require('../models/urogulfLocations.model');
var UrogulfNearbyLocation = require('../models/urogulfNearby.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const constants = require('../helpers/constants');
var urogulfConfig = config.urogulf;
var userConfig = config.users;

exports.listRequest = async (req, res) => {
    const identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
   

    let userData = await User.findOne({
        _id: adminUserId,
    })
    .populate([{
        path: 'roles',
        select: { name: 1 }
  
      }])
    
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
     if(userData.roles && userData.roles.length > 0 )   {
        let index =  await userData.roles.findIndex(x => x.name === constants.URO_GULF_ADMIN_USER)
        if(index > -1){
            var params = req.query;
            var page = Number(params.page) || 1;
            page = page > 0 ? page : 1;
            var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
            perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
            var offset = (page - 1) * perPage;
            var findCriteria = {};
            findCriteria.status  = 1;
            let urogulfRequestList = await Urogulf.find(findCriteria)
            .populate([{
                path: 'userId',
                select: 'name email phone image'

            }, {
                path: 'nearbyLocation',
                select: 'name address urogulfLocationId',
                populate :{
                    path: 'urogulfLocationId',
                    select : "name"
                }

            },, {
                path: 'location',
                select: 'name'

            }])
            .limit(perPage)
            .skip(offset)
            .sort({
                'tsCreatedAt': -1
            }).catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while listing urogulf requests',
                    error: err
                }
            })
        if (urogulfRequestList && (urogulfRequestList.success !== undefined) && (urogulfRequestList.success === 0)) {
            return res.send(urogulfRequestList);
        }
        var urogulfRequestCount = await Urogulf.countDocuments(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding urogulf request count',
                error: err
            }
        })
    if (urogulfRequestCount && (urogulfRequestCount.success !== undefined) && (urogulfRequestCount.success === 0)) {
        return res.send(urogulfRequestCount);
    }

    totalPages = urogulfRequestCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: urogulfRequestCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        imageBase : userConfig.imageBase,
        pagination,
        items: urogulfRequestList,
        message: 'List urofulf request list'
    })

        } else{
            return res.send({
                success: 0,
                message: 'Unauthorized'
            })
        }
    }

    } else {
        return res.send({
            success: 0,
            message: 'Unauthorized'
        })
    }

}


// // *** Urogulf location list ***
// exports.list = async (req, res) => {
//     var params = req.query;
//     var page = Number(params.page) || 1;
//     page = page > 0 ? page : 1;
//     var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
//     perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
//     var offset = (page - 1) * perPage;
//     var pageParams = {
//         skip: offset,
//         limit: perPage
//     };
//     try {
//         var filter = {
//             status: 1
//         };
//         var projection = {
//             name: 1
//         };
//         var locationList = await UrogulfLocation.find(filter, projection, pageParams).limit(perPage).sort({
//             'tsCreatedAt': -1
//         });
//         var itemsCount = await UrogulfLocation.countDocuments(filter);
//         totalPages = itemsCount / perPage;
//         totalPages = Math.ceil(totalPages);
//         var hasNextPage = page < totalPages;
//         var pagination = {
//             page: page,
//             perPage: perPage,
//             hasNextPage: hasNextPage,
//             totalItems: itemsCount,
//             totalPages: totalPages
//         };
//         res.status(200).send({
//             success: 1,
//             pagination: pagination,
//             items: locationList
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// // *** List nearby locations ***
// exports.nearByLocations = async (req, res) => {
//     var params = req.query;
//     var page = Number(params.page) || 1;
//     page = page > 0 ? page : 1;
//     var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
//     perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
//     var offset = (page - 1) * perPage;
//     var pageParams = {
//         skip: offset,
//         limit: perPage
//     };
//     var locationId = req.params.id;
//     var isValidId = ObjectId.isValid(locationId);
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
//             urogulfLocationId: locationId,
//             status: 1
//         };
//         var projection = {
//             name: 1,
//             address: 1
//         };
//         var nearbyList = await UrogulfNearbyLocation.find(filter, projection, pageParams).limit(perPage).sort({
//             'tsCreatedAt': -1
//         });
//         var itemsCount = await UrogulfNearbyLocation.countDocuments(filter);
//         totalPages = itemsCount / perPage;
//         totalPages = Math.ceil(totalPages);
//         var hasNextPage = page < totalPages;
//         var pagination = {
//             page: page,
//             perPage: perPage,
//             hasNextPage: hasNextPage,
//             totalItems: itemsCount,
//             totalPages: totalPages
//         };
//         res.status(200).send({
//             success: 1,
//             pagination: pagination,
//             items: nearbyList
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }

// // *** Urogulf create message ***
// exports.create = async (req, res) => {
//     var identity = req.identity.data;
//     var userId = identity.id;
//     var location = req.body.location;
//     var nearbyLocation = req.body.nearbyLocation;
//     var message = req.body.message;
//     try {
//         const newMessage = new Urogulf({
//             location: location,
//             nearbyLocation: nearbyLocation,
//             message: message,
//             userId: userId,
//             status: 1,
//             tsCreatedAt: Date.now(),
//             tsModifiedAt: null
//         });
//         var saveMessage = await newMessage.save();
//         res.status(200).send({
//             success: 1,
//             message: 'Message saved successfully'
//         })
//     } catch (err) {
//         res.status(500).send({
//             success: 0,
//             message: err.message
//         })
//     }
// }