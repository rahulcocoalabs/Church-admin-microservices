const Users = require('../models/user.model');
const UserRoles = require('../models/userRole.model');
const Otp = require('../models/otp.model');
const Donation = require('../models/donation.model');
const Church = require('../models/church.model');
const config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
var otpConfig = config.otp;
var donationConfig = config.donations;
const paramsConfig = require('../../config/params.config');
const JWT_KEY = paramsConfig.development.jwt.secret;
var jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

var bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


//   **** Sign-up ****

exports.signUp = async (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  // var address = req.body.address;
  var church = req.body.church;
  var password = req.body.password;

  // var parish = req.body.parish;
  // var parishWard = req.body.parishWard;
  // var bloodGroup = req.body.bloodGroup;
  // var userType = req.body.userType;

  try {
    var filter = {
      phone: phone,
      // isVerified: true,
      status: 1
    }
    var checkPhone = await Users.findOne(filter);
    if (checkPhone) {
      return res.send({
        success: 0,
        message: 'Phone number already registered'
      })
    }
    var filter = {
      email,
      // isVerified: true,
      status: 1
    }
    var checkEmail = await Users.findOne(filter);
    if (checkEmail) {
      return res.send({
        success: 0,
        message: 'Email already registered'
      })
    }
    const hash = bcrypt.hashSync(password, salt);

    let userRoleData = await UserRoles.findOne({
      name: constants.SUB_ADMIN_USER,
      status: 1
    }, { name: 1 })

    var roles = [];
    roles.push(userRoleData.id);
    // var otpResponse = await otp(phone)
    var newUser = new Users({
      name: name,
      email: email,
      phone: phone,
      passwordHash: hash,
      // address: address,
      church: church,

      // parish: parish,
      // parishWard: parishWard,
      // bloodGroup: bloodGroup,
      // userType : constants.SUB_ADMIN_USER,
      roles,
      // isVerified: true,
      status: 1,
      tsCreatedAt: new Date(),
      tsModifiedAt: null
    });
    var roleData = [];
    roleData.push(userRoleData)
    var saveUser = await newUser.save();
    var payload = {
      id: saveUser._id,
      name,
      email,
      phone,
      church,
      roles: roleData
    };
    var token = jwt.sign({
      data: payload,
    }, JWT_KEY, {
      expiresIn: '30 days'
    });

    res.status(200).send({
      success: 1,
      message: 'Registration successfull',
      token,
      userDetails: payload
    });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
};

exports.login = async (req, res) => {
  var params = req.body;
  let findCriteria = {};
  findCriteria.email = params.email;
  findCriteria.status = 1;

  let userData = await Users.findOne(findCriteria)
    .populate([{
      path: 'roles',
      select: { name: 1 }

    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while checking email',
        error: err
      }
    })

  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return res.send(userData);
  }
  if (!userData || !userData.roles || userData.roles.length <= 0) {
    return res.status(200).send({
      success: 0,
      message: 'User not exists'
    });
  };
  let matched = await bcrypt.compare(params.password, userData.passwordHash);
  if (matched) {
    let payload = {};
    payload.id = userData.id;
    payload.email = userData.email;
    payload.phone = userData.phone;
    payload.name = userData.name;
    payload.church = userData.church;
    payload.userType = userData.userType;
    payload.roles = userData.roles;
    var token = jwt.sign({
      data: payload,
    }, JWT_KEY, {
      expiresIn: '30 days'
    });


    return res.send({
      success: 1,
      statusCode: 200,
      token,
      userDetails: payload,
      message: 'Successfully logged in'
    })

  } else {
    return res.send({
      success: 0,
      statusCode: 401,
      message: 'Incorrect password'
    })
  }
}

exports.donationList = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  var churchId = identity.church;


  var params = req.query;
  var findCriteria = {
    // churchId,
    status: 1
  }

  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || donationConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : donationConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  if(params.userId){
    findCriteria.userId = params.userId;
  }
  console.log("findCriteria")
  console.log(findCriteria)
  console.log("findCriteria")
  var donationList = await Donation.find(findCriteria)
    .populate([{
      path: 'userId',
      select: 'name image'
    }])
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while listing donations',
        error: err
      }
    })
  if (donationList && (donationList.success !== undefined) && (donationList.success === 0)) {
    return res.send(donationList);
  }
  var totalDonationCount = await Donation.countDocuments(findCriteria)
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while finding donation count',
        error: err
      }
    })
  if (totalDonationCount && (totalDonationCount.success !== undefined) && (totalDonationCount.success === 0)) {
    return res.send(totalDonationCount);
  }

  totalPages = totalDonationCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page,
    perPage,
    hasNextPage,
    totalItems: totalDonationCount,
    totalPages
  }
  return res.status(200).send({
    success: 1,
    pagination,
    items: donationList,
    message: 'List donations'
  })
}

exports.getPasterProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  var churchId = identity.church;
  var roles = await UserRoles.findOne({ name: constants.SUB_ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }

  let adminUserData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: { name: 1 }
    }, {
      path: 'church',
      select: { name: 1 }
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user data',
        error: err
      }
    })
  if (adminUserData && (adminUserData.success !== undefined) && (adminUserData.success === 0)) {
    return res.send(adminUserData);
  }
  if (adminUserData) {
    return res.send({
      success: 1,
      item: adminUserData,
      message: 'User profile'
    })
  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }
}

exports.updatePasterProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  var churchId = identity.church;

  var roles = await UserRoles.findOne({ name: constants.SUB_ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }
  let userData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  })
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
    let params = req.body;
    if(!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId){
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if(params.name){
      update.name = params.name;
    }
    if(params.email){
 
      var filter = {
        email : params.email,
         _id: { $ne: adminUserId },
        status: 1
      }
      var checkEmail = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting email already exists',
          error: err
        }
      })
    if (checkEmail && (checkEmail.success !== undefined) && (checkEmail.success === 0)) {
      return res.send(checkEmail);
    }
      if (checkEmail) {
        return res.send({
          success: 0,
          message: 'Email already registered'
        })
      }else{
        update.email = params.email;
      }
    }
    if(params.phone){
      var filter = {
        phone: params.phone,
        _id: { $ne: adminUserId },
        status: 1
      }
      var checkPhone = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting phone already exists',
          error: err
        }
      })
    if (checkPhone && (checkPhone.success !== undefined) && (checkPhone.success === 0)) {
      return res.send(checkPhone);
    }
      if (checkPhone) {
        return res.send({
          success: 0,
          message: 'Phone number already registered'
        })
      }else{
        update.phone = params.phone;
      }
    }
    if(!params.oldPassword && params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if(params.oldPassword && !params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if(params.oldPassword && params.newPassword){
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      }else{
        return res.send({
          success: 0,
          message: 'Incorrect current password'
        })
      }
    }
     // if(params.churchId){
    //   update.church = params.churchId
    // }
    update.tsModifiedAt = Date.now();

    var updateData = await Users.updateOne(
      {
        _id : adminUserId
      },update
    )
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating user data',
        error: err
      }
    })
  if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
    return res.send(updateData);
  }
   
  return res.send({
    success: 1,
    message: 'Profile updated successfully'
  })

  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }

}

exports.getAdminProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  var churchId = identity.church;
  var roles = await UserRoles.findOne({ name: constants.ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }

  let adminUserData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: { name: 1 }
    }, {
      path: 'church',
      select: { name: 1 }
    }])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user data',
        error: err
      }
    })
  if (adminUserData && (adminUserData.success !== undefined) && (adminUserData.success === 0)) {
    return res.send(adminUserData);
  }
  if (adminUserData) {
    return res.send({
      success: 1,
      item: adminUserData,
      message: 'User profile'
    })
  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }
}

exports.updateAdminProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  var churchId = identity.church;

  var roles = await UserRoles.findOne({ name: constants.ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }
  let userData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  })
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
    let params = req.body;
    if(!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId){
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if(params.name){
      update.name = params.name;
    }
    if(params.email){
 
      var filter = {
        email : params.email,
         _id: { $ne: adminUserId },
        status: 1
      }
      var checkEmail = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting email already exists',
          error: err
        }
      })
    if (checkEmail && (checkEmail.success !== undefined) && (checkEmail.success === 0)) {
      return res.send(checkEmail);
    }
      if (checkEmail) {
        return res.send({
          success: 0,
          message: 'Email already registered'
        })
      }else{
        update.email = params.email;
      }
    }
    if(params.phone){
      var filter = {
        phone: params.phone,
        _id: { $ne: adminUserId },
        status: 1
      }
      var checkPhone = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting phone already exists',
          error: err
        }
      })
    if (checkPhone && (checkPhone.success !== undefined) && (checkPhone.success === 0)) {
      return res.send(checkPhone);
    }
      if (checkPhone) {
        return res.send({
          success: 0,
          message: 'Phone number already registered'
        })
      }else{
        update.phone = params.phone;
      }
    }
    if(!params.oldPassword && params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if(params.oldPassword && !params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if(params.oldPassword && params.newPassword){
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      }else{
        return res.send({
          success: 0,
          message: 'Incorrect current password'
        })
      }
    }
     // if(params.churchId){
    //   update.church = params.churchId
    // }
    update.tsModifiedAt = Date.now();

    var updateData = await Users.updateOne(
      {
        _id : adminUserId
      },update
    )
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating user data',
        error: err
      }
    })
  if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
    return res.send(updateData);
  }
   
  return res.send({
    success: 1,
    message: 'Profile updated successfully'
  })

  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }

}
exports.getUrogulfProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;
  // var churchId = identity.church;
  var roles = await UserRoles.findOne({ name: constants.URO_GULF_ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }

  let adminUserData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: { name: 1 }
    }
  ])
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting user data',
        error: err
      }
    })
  if (adminUserData && (adminUserData.success !== undefined) && (adminUserData.success === 0)) {
    return res.send(adminUserData);
  }
  if (adminUserData) {
    return res.send({
      success: 1,
      item: adminUserData,
      message: 'User profile'
    })
  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }
}

exports.updateUrogulfProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;

  var roles = await UserRoles.findOne({ name: constants.URO_GULF_ADMIN_USER })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while getting role data',
        error: err
      }
    })
  if (roles && (roles.success !== undefined) && (roles.success === 0)) {
    return res.send(roles);
  }
  let userData = await Users.findOne({
    _id: adminUserId,
    roles: { $in: [roles._id] },
    status: 1
  })
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
    let params = req.body;
    if(!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId){
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if(params.name){
      update.name = params.name;
    }
    if(params.email){
 
      var filter = {
        email : params.email,
         _id: { $ne: adminUserId },
        status: 1
      }
      var checkEmail = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting email already exists',
          error: err
        }
      })
    if (checkEmail && (checkEmail.success !== undefined) && (checkEmail.success === 0)) {
      return res.send(checkEmail);
    }
      if (checkEmail) {
        return res.send({
          success: 0,
          message: 'Email already registered'
        })
      }else{
        update.email = params.email;
      }
    }
    if(params.phone){
      var filter = {
        phone: params.phone,
        _id: { $ne: adminUserId },
        status: 1
      }
      var checkPhone = await Users.findOne(filter)
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting phone already exists',
          error: err
        }
      })
    if (checkPhone && (checkPhone.success !== undefined) && (checkPhone.success === 0)) {
      return res.send(checkPhone);
    }
      if (checkPhone) {
        return res.send({
          success: 0,
          message: 'Phone number already registered'
        })
      }else{
        update.phone = params.phone;
      }
    }
    if(!params.oldPassword && params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if(params.oldPassword && !params.newPassword){
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if(params.oldPassword && params.newPassword){
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      }else{
        return res.send({
          success: 0,
          message: 'Incorrect current password'
        })
      }
    }
     // if(params.churchId){
    //   update.church = params.churchId
    // }
    update.tsModifiedAt = Date.now();

    var updateData = await Users.updateOne(
      {
        _id : adminUserId
      },update
    )
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating user data',
        error: err
      }
    })
  if (updateData && (updateData.success !== undefined) && (updateData.success === 0)) {
    return res.send(updateData);
  }
   
  return res.send({
    success: 1,
    message: 'Profile updated successfully'
  })

  } else {
    return res.send({
      success: 0,
      message: 'User not exist'
    })
  }

}

async function otp(phone) {
  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);

  const newOtp = new Otp({
    phone: phone,
    isUsed: false,
    otp: otp,
    apiToken: apiToken,
    expiry: expiry,
    status: 1,
    tsCreatedAt: new Date(),
    tsModifiedAt: null
  });

  var saveOtp = await newOtp.save();
  var otpResponse = {
    phone: saveOtp.phone,
    otp: saveOtp.otp,
    apiToken: saveOtp.apiToken,
  };

  return otpResponse
}
