const Users = require('../models/user.model');
const Reset = require('../models/resetPassword.model');
const nodemailer = require('nodemailer');
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
const resetPasswordModel = require('../models/resetPassword.model');
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
  // console.log("findCriteria")
  // console.log(findCriteria)
  // console.log("findCriteria")
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

exports.resetPassword = async (req, res) => {
  // part of  url send to the email and new password
  let link = req.body.link;
  let newPass = req.body.password;
  // find the document with given link
  let data = await Reset.findOne({value:link});
  if (!data){
    return res.send({
      success:0,
      msg:"some thing went wrong"
    });
  }
  // find the user's id and time gap betweeen intervals
  let id = data.owner;
  let time1 = data.tsCreatedAt;
  let timeObj = Date.now();
  let time2 = timeObj.getTime;
  let gap = time2-time1;

  
  if (gap>(config.resetpassword.timeForExpiry)){
    return res.send({
      success:0,
      msg:"expired link"
    })
  }
  else {

    const hash = bcrypt.hashSync(newPass, salt);

    let data_1 = await Users.updateOne({_id:id},{passwordHash:hash})

    if (data_1){
      return res.send({
        success:1,
        msg:"successfully updated password"
      })
     
    }
    else {
      return res.send({
        success:0
      })
    }
  }
  


}

exports.reset = async (req, res) => {

  let mail = req.body.email;

  //return res.send(id);



  let str = randomStr('20','12345abcdef');

  console.log(randomStr('20','12345abcdef'))

  let link = config.resetpassword.root + str;
  
  var user = await Users.findOne({email:mail})
  //return res.send(mail)
  let id =  user._id;
 

  var newPasswordResetLink = new Reset({
    value: str,
    owner: id,
   
    status: 1,
    tsCreatedAt: new Date(),
    tsModifiedAt: null
  });
  
  var saveLink = await newPasswordResetLink.save();


  if (!saveLink) {
    return res.send({
      success:0,
      msg:"somethin wrong"
    })
  }
  const externalLink = appConfig.resetpassword.root+"/"+str;
  const mailmsg = "you can reset your password by clciking this link" + "   " + externalLink;

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mailrkponline@gmail.com',
      pass: 'alifbetgimel'
    }
  });
//   transporter.verify(function(error, success) {
//     if (error) {
//          console.log(error);
//     } else {
//          console.log('Server is ready to take our messages');
//     }
//  });


 var mailOptions = {
  from: 'mailrkponline@gmail.com',
  to: mail,
  subject: 'Sending Email using Node.js',
  text: mailmsg
       
  // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

 

  if (saveLink){
    return res.send({
      success:1,
      link:link,
      id:id
    })
  }
  else {
    return res.send({
      success:0,
      msg:"something went wrong"
    })
  }
  

}

//const SGmail = require('@sendgrid/mail');
//SGmail.setApiKey(config.email.sendgridApiKey); // Input Api key or add to environment config

async function newUserEmail(email, name,res){
  const content = { 
  to : email, //email variable
  from : { email : 'mailrkponline@gmail.com' , name: 'Rakesh'},
  message : `Hi there, ${name}`,
  subject : "This is a test Email",
  html: "<p>test</p>",
  templateId: "f091dbe6-146b-4670-bcd4-72a1770b2d7d"
  }
  
  try{
    const response = await SGmail.send(content)

    return res.json({message: 'message sent',item:response})

  } catch(error){
    const { message, code, response } = error

    return res.json({message, response})
  }
  
 }

 async function nodemailercall(req,res,msg){
console.log("1");
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
     
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport

  console.log("2");
  let transporter = nodemailer.createTransport({
    host: 'mail.google.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'mailrkponline@gmail.com', // generated ethereal user
        pass: 'alifbetgimel'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols

  console.log("3");
  let mailOptions = {
      from: '"Nodemailer Contact" <mailrkponline@gmail.com>', // sender address
      to: 'docsofrakesh@gmail.com', // list of receivers
      subject: 'Node Contact Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object

  console.log("4");
  const y = await transporter.sendMail(mailOptions, (error, info) => {
    console.log("5");
      if (error) {
        console.log("5");
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
      //res.render('contact', {msg:'Email has been sent'});
  });
 
  return y;
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