var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Users = require('../models/user.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var constants = require('../helpers/constants');
const { users } = require('../../config/app.config.js');
var userConfig = config.users;
exports.userList = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var churchId = identity.church;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || userConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : userConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    
    var usersList = await Users.find({
        userType: { $nin: [constants.ADMIN_USER, constants.SUB_ADMIN_USER] },
        church : churchId,
        status: 1
    }, {
        parish: 0,
        parishWard: 0,
        familyMembers: 0,
        userType: 0,
        address: 0,
        tsModifiedAt: 0,

    })
    .limit(perPage)
    .skip(offset)
        .populate('church')
        .sort({
            'tsCreatedAt': -1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while listing users',
                error: err
            }
        })

    if (usersList && (usersList.success !== undefined) && (usersList.success === 0)) {
        return res.send(usersList);
    }
    var itemsCount = await Users.countDocuments({
        userType: { $nin: [constants.ADMIN_USER, constants.SUB_ADMIN_USER] },
        church : churchId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while find total users count',
                error: err
            }
        })

    if (itemsCount && (itemsCount.success !== undefined) && (itemsCount.success === 0)) {
        return res.send(itemsCount);
    }
    totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination: pagination,
        imageBase: users.imageBase,
        items: usersList
    })
}

exports.getUser = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var userId = req.params.id;
    var churchId = identity.church;


    let userData = await Users.findOne({
        _id: userId,
        church : churchId,
        status : 1,
    })
        .populate('church')
        .populate('parish')
        .populate('parishWard')

        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user',
                error: err
            }
        })

    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    return res.status(200).send({
        success: 1,
        imageBase: users.imageBase,
        item: userData,
        message: 'User details'
    })
}

exports.updateUser = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var userId = req.params.id;
    var churchId = identity.church;


    let userData = await Users.findOne({
        _id: userId,
        church : churchId,
        status : 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user',
                error: err
            }
        })

    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        var params = req.body;
        if (!params.name && !params.email && !params.phone
            && !params.address && !params.church
            && !params.parish && !params.parishWard
            && !params.bloodGroup) {
            return res.send({
                success: 0,
                message: 'Nothing to update'
            });
        }
        var update = {};
        if (params.name) {
            update.name = params.name;
        }
        if (params.email) {
            var findCriteria = {
                email: params.email,
                status: 1
            }
            var emailCheck = await checkUser(findCriteria, "email")
            if (emailCheck && emailCheck.success && emailCheck.success === 0) {
                return res.send(emailCheck);
            }
            if (emailCheck && (JSON.stringify(emailCheck.id) !== JSON.stringify(userId)) || emailCheck.userType === constants.ADMIN_USER || emailCheck.userType === constants.SUB_ADMIN_USER) {
                return res.send({
                    success: 0,
                    message: 'Email ID already exists'
                });
            }
            update.email = params.email;
        }
        if (params.phone) {
            var findCriteria = {
                phone: params.phone,
                status: 1
            }
            var phoneCheck = await checkUser(findCriteria, "phone")
            if (phoneCheck && phoneCheck.success && phoneCheck.success === 0) {
                return res.send(phoneCheck);
            }
            if (phoneCheck && (JSON.stringify(phoneCheck.id) !== JSON.stringify(userId)) || phoneCheck.userType === constants.ADMIN_USER || phoneCheck.userType === constants.SUB_ADMIN_USER) {
                return res.send({
                    success: 0,
                    message: 'Phone already exists'
                });
            }
            update.phone = params.phone;
        }
        if (params.address) {
            update.address = params.address;
        }
        if (params.church) {
            update.church = params.church;
        }
        if (params.parish) {
            update.parish = params.parish;
        }
        if (params.parishWard) {
            update.parishWard = params.parishWard;
        }
        if (params.bloodGroup) {
            update.bloodGroup = params.bloodGroup;
        }
        update.tsModifiedAt = Date.now();
        let updateUserData = await Users.updateOne({
            _id: userId
        }, update)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while update user',
                    error: err
                }
            })

        if (updateUserData && (updateUserData.success !== undefined) && (updateUserData.success === 0)) {
            return res.send(updateUserData);
        }
        return res.status(200).send({
            success: 1,
            message: 'User updated successfully'
        })

    } else {
        return res.status(200).send({
            success: 0,
            message: 'User not exists'
        });
    }
}

exports.deleteUser = async (req, res) => {
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var userId = req.params.id;
    var churchId = identity.church;


    let userData = await Users.findOne({
        _id: userId,
        church : churchId,
        status : 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user',
                error: err
            }
        })

    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        let removeUser = await Users.updateOne({
            _id: userId,
        }, {
            status: 0,
            tsModifiedAt: Date.now()
        })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while remove user',
                    error: err
                }
            })

        if (removeUser && (removeUser.success !== undefined) && (removeUser.success === 0)) {
            return res.send(removeUser);
        }
        return res.status(200).send({
            success: 1,
            message: 'User deleted successfully'
        })

    } else {
        return res.status(200).send({
            success: 0,
            message: 'User not exists'
        });
    }
}

exports.setBlockOrUnBlockUser = async(req,res) =>{
    var identity = req.identity.data;
    var adminUserId = identity.id;
    var userId = req.params.id;
    var churchId = identity.church;


    var params = req.body;

    let userData = await Users.findOne({
        _id: userId,
        church : churchId,
        status : 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })

    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if(userData){

        let blockStatus = await Users.updateOne({
            _id : userId,
        },{
            isBlocked : params.isBlocked,
            tsModifiedAt : Date.now()
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while update block status',
                error: err
            }
        })

    if (blockStatus && (blockStatus.success !== undefined) && (blockStatus.success === 0)) {
        return res.send(blockStatus);
    }
    if(params.isBlocked){
        return res.status(200).send({
            success: 1,
            message: 'User blocked'
        })
    }else{
        return res.status(200).send({
            success: 1,
            message: 'User unblocked'
        })
    }

    } else {
        return res.status(200).send({
            success: 0,
            message: 'User not exists'
        });
    }
  
}
async function checkUser(findCriteria, type) {
    let check = await Users.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking ' + type,
                error: err
            }
        })

    if (check && (check.success !== undefined) && (check.success === 0)) {
        return check;
    }
    return check;
}
