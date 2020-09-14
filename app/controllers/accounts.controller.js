const Users = require('../models/user.model');
const Reset = require('../models/resetPassword.model');
const nodemailer = require('nodemailer');
const UserRoles = require('../models/userRole.model');
const Otp = require('../models/otp.model');
const Donation = require('../models/donation.model');
const Church = require('../models/church.model');
const Designation = require('../models/designation.model');
const Matrimony = require('../models/matrimony.model');
const config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const { v4: uuidv4 } = require('uuid');

var otpConfig = config.otp;
var donationConfig = config.donations;
var pastersConfig = config.pasters;
const paramsConfig = require('../../config/params.config');
const JWT_KEY = paramsConfig.development.jwt.secret;
var jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.email.sendgridApiKey);

var bcrypt = require('bcryptjs');
const appConfig = require('../../config/app.config.js');
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
    }, {
      name: 1
    })
   
    var roles = [];
    roles.push(userRoleData.id);
    // var otpResponse = await otp(phone)
    let pasterObj = await Designation.findOne({
      name: constants.PASTER_DESIGNATION,
      status: 1
    })
      .catch(err => {
        return {
          success: 0,
          message: 'Something went wrong while getting paster data',
          error: err
        }
      })

    if (pasterObj && (pasterObj.success !== undefined) && (pasterObj.success === 0)) {
      return res.send(pasterObj);
    }
    var newUser = new Users({
      name: name,
      email: email,
      phone: phone,
      passwordHash: hash,
      address: '',
      image: '',
      about: '',
      church: church,
      designation: pasterObj.id,
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
      select: {
        name: 1
      }

    }, {
      path: 'designation',
      select: {
        name: 1
      }
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
    payload.designation = userData.designation;
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
  }

  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || donationConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : donationConfig.resultsPerPage;
  var offset = (page - 1) * perPage;

  if (params.startDate && params.endDate) {

    var startDate = getDate(params.startDate);
    var endDate = getDate(params.endDate)
    // let currentDate = new Date(year, month, day);
 
    findCriteria = {
      "paidOn": {
          "$lte": endDate,
          "$gte":  startDate,
        }
      }
  }
  if (params.userId) {
    findCriteria.userId = params.userId;
  }
  findCriteria.paidStatus = true;
  findCriteria.status = 1;
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
  donationList = JSON.parse(JSON.stringify(donationList));
  for (let i = 0; i < donationList.length; i++) {
    if(donationList[i].userId){
    donationList[i].name = donationList[i].userId.name
    }
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
  var roles = await UserRoles.findOne({
    name: constants.SUB_ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: {
        name: 1
      }
    }, {
      path: 'church',
      select: {
        name: 1
      }
    }, {
      path: 'designation',
      select: {
        name: 1
      }
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
      imageBase: pastersConfig.imageBase,
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

  var roles = await UserRoles.findOne({
    name: constants.SUB_ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
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
    if (!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId) {
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if (params.name) {
      update.name = params.name;
    }
    if (params.email) {

      var filter = {
        email: params.email,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.email = params.email;
      }
    }
    if (params.phone) {
      var filter = {
        phone: params.phone,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.phone = params.phone;
      }
    }
    if (!params.oldPassword && params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if (params.oldPassword && !params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if (params.oldPassword && params.newPassword) {
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      } else {

        return res.send({
          success: 0,
          message: 'Incorrect current password'
        })
      }
    }
    if (params.address) {
      update.address = params.address
    }
    if (params.about) {
      update.about = params.about
    }
    if (req.file) {
      update.image = req.file.filename
    }
    // if(params.churchId){
    //   update.church = params.churchId
    // }
    update.tsModifiedAt = Date.now();

    var updateData = await Users.updateOne({
      _id: adminUserId
    }, update)
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
  var roles = await UserRoles.findOne({
    name: constants.ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: {
        name: 1
      }
    }, {
      path: 'church',
      select: {
        name: 1
      }
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

  var roles = await UserRoles.findOne({
    name: constants.ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
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
    if (!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId) {
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if (params.name) {
      update.name = params.name;
    }
    if (params.email) {

      var filter = {
        email: params.email,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.email = params.email;
      }
    }
    if (params.phone) {
      var filter = {
        phone: params.phone,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.phone = params.phone;
      }
    }
    if (!params.oldPassword && params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if (params.oldPassword && !params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if (params.oldPassword && params.newPassword) {
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      } else {
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

    var updateData = await Users.updateOne({
      _id: adminUserId
    }, update)
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
  var roles = await UserRoles.findOne({
    name: constants.URO_GULF_ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
    status: 1
  }, {
    passwordHash: 0
  })
    .populate([{
      path: 'roles',
      select: {
        name: 1
      }
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

exports.updateUrogulfProfile = async (req, res) => {
  const identity = req.identity.data;
  var adminUserId = identity.id;

  var roles = await UserRoles.findOne({
    name: constants.URO_GULF_ADMIN_USER
  })
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
    roles: {
      $in: [roles._id]
    },
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
    if (!params.name && !params.email && !params.phone && !params.newPassword && !params.churchId) {
      return res.send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    let update = {};
    if (params.name) {
      update.name = params.name;
    }
    if (params.email) {

      var filter = {
        email: params.email,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.email = params.email;
      }
    }
    if (params.phone) {
      var filter = {
        phone: params.phone,
        _id: {
          $ne: adminUserId
        },
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
      } else {
        update.phone = params.phone;
      }
    }
    if (!params.oldPassword && params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing old password'
      })
    }
    if (params.oldPassword && !params.newPassword) {
      return res.send({
        success: 0,
        message: 'Missing new password'
      })
    }
    if (params.oldPassword && params.newPassword) {
      let matched = await bcrypt.compare(params.oldPassword, userData.passwordHash);
      if (matched) {
        const hash = bcrypt.hashSync(params.newPassword, salt);
        update.passwordHash = hash;

      } else {
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

    var updateData = await Users.updateOne({
      _id: adminUserId
    }, update)
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

exports.resetPassword = async (req, res) => {
  // part of  url send to the email and new password
  let link = req.body.link;
  let newPass = req.body.password;
  if (!link) {
    return res.send({
      success: 0,
      msg: "Link required"
    })
  }
  if (!newPass) {
    return res.send({
      success: 0,
      msg: "Password required"
    })
  }
  // find the document with given link
  let data = await Reset.findOne({
    value: link,
    status : 1
  })
  .catch(err => {
    return {
      success: 0,
      message: 'Something went wrong while checking link',
      error: err
    }
  })
if (data && (data.success !== undefined) && (data.success === 0)) {
  return res.send(data);
}
  if (!data) {
    return res.send({
      success: 0,
      msg: "Invalid link"
    });
  }
  // find the user's id and time gap betweeen intervals
  let id = data.owner;
  let time1 = data.tsCreatedAt;
  let time2 = Date.now();
  //let time2 = timeObj.getTime;
  let gap = time2 - time1;



  if (gap > (config.resetpassword.timeForExpiry)) {
    return res.send({
      success: 0,
      msg: "Link expired"
    })
  } else {

    const hash = bcrypt.hashSync(newPass, salt);

    let passwordUpdate = await Users.updateOne({
      _id: id,
    }, {
      passwordHash: hash,
      tsModifiedAt : Date.now()
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while updating password',
        error: err
      }
    })
  if (passwordUpdate && (passwordUpdate.success !== undefined) && (passwordUpdate.success === 0)) {
    return res.send(passwordUpdate);
  }
      return res.send({
        success: 1,
        msg: "successfully updated password"
      })
  }



}

async function sendMail(message, target) {

  var ret = 0;
 
  const msg = {
    to: target,
    from: 'rahul@cocoalabs.in',
    subject: 'Password reset link from church app',
    text: message,

  };
  console.log(target, message);
  sgMail
    .send(msg)
    .then(() => console.log('send mail success'))
    .catch(err => {
      console.log(err);
      ret = 1;
    });
}

exports.forgotPassword = async (req, res) => {

  let mail = req.body.email;
  if (!mail) {
    return res.send({
      success: 0,
      message: "Email id required"
    })
  }

  var rolesData  = await UserRoles.find({
    status : 1
  })
  .catch(err => {
    return {
        success: 0,
        message: 'Something went wrong while listing roles',
        error: err
    }
})
if (rolesData && (rolesData.success !== undefined) && (rolesData.success === 0)) {
  return res.send(rolesData);
}
var rolesArray = [];
for(let i = 0; i < rolesData.length; i++){
  rolesArray.push(rolesData[i].id)
}
  //let str = randomStr('20','12345abcdef');
  
  var userData = await Users.findOne({
    roles: {
      $in: rolesArray
    },
    email: mail,
    status : 1
  })
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

  if (!userData) {

    return res.json({
      success: 0,
      message: "Email not registered"
    });
  }
  var str = uuidv4();
  let link = config.resetpassword.root + "/" + str;
  let id = userData.id;
  var newPasswordResetLink = new Reset({
    value: str,
    owner: id,
    status: 1,
    tsCreatedAt: new Date(),
    tsModifiedAt: null
  });

  var saveLink = await newPasswordResetLink.save()
  .catch(err => {
    return {
        success: 0,
        message: 'Something went wrong while saving forgot password info',
        error: err
    }
})
if (saveLink && (saveLink.success !== undefined) && (saveLink.success === 0)) {
  return res.send(saveLink);
}

  const externalLink = appConfig.resetpassword.root + "/" + str;
  const mailmsg = "You can reset your password by cliciking this link" + "   " + externalLink;




  const x = await sendMail(mailmsg, mail);

  if (x && ( x == 1 )) {
    return res.json({
      success: 0,
      message: "Mail could not be sent"
    })
  }

  if (saveLink) {
    return res.send({
      success: 1,
      message: "Mail sent",
      
    })
  } else {
    return res.send({
      success: 0,
      message: "something went wrong"
    })
  }


}

exports.getDashboardData = async (req, res) => {
  const identity = req.identity.data;
  const userId = identity.id;
  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || pastersConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : pastersConfig.resultsPerPage;
  try {
    var totalDonation = await Donation.aggregate([{
      $match: {
        status: 1
      }
    }, {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount"
        }
      }
    }]);
    totalDonation = totalDonation[0].amount;
    var totalChurch = await Church.countDocuments({
      status: 1
    });
    var totalMatrimony = await Matrimony.countDocuments({
      status: 1
    });
    var totalUsers = await Users.find({
      roles: {
        $size: 0
      },
      isVerified: true
    });
    totalUsers = totalUsers.length;
    var findChurchList = await Church.find({
      status: 1
    });
    var churchSummaryData = [];
    for (var i = 0; i < findChurchList.length; i++) {
      var churchId = findChurchList[i]._id;
      var name = findChurchList[i].name;
      var location = findChurchList[i].location;
      var address = findChurchList[i].address;
      var churchDonation = await Donation.aggregate([{
        $match: {
          churchId: churchId,
          status: 1
        }
      }, {
        $group: {
          _id: null,
          amount: {
            $sum: "$amount"
          }
        }
      }]);
      churchDonation = churchDonation[0] ? churchDonation[0].amount : 0;
      var totalUsersUnderChurch = await Users.find({
        church: churchId,
        roles: {
          $size: 0
        },
        isVerified: true
      });
      totalUsersUnderChurch = totalUsersUnderChurch.length;
      var totalMatrimonyUnderChurch = await Matrimony.countDocuments({
        churchId: churchId,
        status: 1
      });
      churchSummaryData.push({
        name: name,
        location: location,
        address: address,
        totaldonation: churchDonation,
        totalusers: totalUsersUnderChurch,
        totalMatrimony: totalMatrimonyUnderChurch
      });
    };
    var itemsCount = churchSummaryData.length;
    churchSummaryData = paginate(churchSummaryData, perPage, page)
    totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: itemsCount,
      totalPages: totalPages
    };
    res.status(200).send({
      success: 1,
      totalDonation: totalDonation,
      totalChurch: totalChurch,
      totalMatrimony: totalMatrimony,
      totalUsers: totalUsers,
      pagination: pagination,
      items: churchSummaryData
    });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: 'Something went wrong' || err.message
    })
  }
}

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
};

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//code for generating random string 
function randomStr(len, arr) {
  var ans = '';
  for (var i = len; i > 0; i--) {
    ans +=
      arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}
function getDate(date){
  const [day, month, year] = date.split("/")
  return new Date(year, month - 1, day);
  // return new Date(year, month - 1, day).toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
}