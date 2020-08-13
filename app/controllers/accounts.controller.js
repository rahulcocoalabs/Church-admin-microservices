  const Users = require('../models/user.model');
  const Otp = require('../models/otp.model');
  const config = require('../../config/app.config.js');
  var otpConfig = config.otp;
  const paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var jwt = require('jsonwebtoken');
  const uuidv4 = require('uuid/v4');


  //   **** Sign-up ****

  exports.signUp = async (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var church = req.body.church;
    var parish = req.body.parish;
    var parishWard = req.body.parishWard;
    var bloodGroup = req.body.bloodGroup;
    try {
      var filter = {
        phone: phone,
        isVerified: true,
        status: 1
      }
      var checkPhone = await Users.findOne(filter);
      if (checkPhone) {
        return res.status(400).send({
          success: 0,
          message: 'Phone number already registered'
        })
      }
      var otpResponse = await otp(phone)
      var newUser = new Users({
        name: name,
        email: email,
        phone: phone,
        address: address,
        church: church,
        parish: parish,
        parishWard: parishWard,
        bloodGroup: bloodGroup,
        isVerified: false,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
      });
      var saveUser = await newUser.save();
      res.status(200).send({
        success: 1,
        message: 'OTP is sent to your registered phone number for verification',
        item: otpResponse
      });
    } catch (err) {
      res.status(500).send({
        success: 0,
        message: err.message
      })
    }
  };

  //   **** Verify OTP ****  

  exports.verifyOtp = async (req, res) => {
    var params = req.body;
    var otp = params.otp;
    var phone = params.phone;
    var apiToken = params.apiToken;
    try {
      var filter = {
        otp: otp,
        phone: phone,
        apiToken: apiToken,
        isUsed: false
      };
      var otpData = await Otp.findOne(filter);

      if (otpData) {
        var currentTime = Date.now();

        var otpData1 = await Otp.findOne({
          phone: phone,
          otp: otp,
          apiToken: apiToken,
          isUsed: false,
          expiry: {
            $gt: currentTime
          }
        });
        if (otpData1 === null) {
          return res.send({
            success: 0,
            message: 'otp expired,please resend otp to get a new one'
          })
        } else {
          var result = await Users.findOne({
            phone: phone
          })
          userId = result._id;
          var payload = {
            id: result._id,
            name: result.name,
            email: result.email,
            phone: result.phone
          };
          var token = jwt.sign({
            data: payload,
          }, JWT_KEY, {
            expiresIn: '30 days'
          });
          var filter = {
            phone: phone,
            otp: otp,
            apiToken: apiToken
          };
          var update = {
            isUsed: true
          };
          var updateOtpData = await Otp.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: false
          });

          var updateUserData = await Users.findOneAndUpdate({
            _id: userId
          }, {
            isVerified: true
          }, {
            new: true,
            useFindAndModify: false
          });
          return res.status(200).send({
            success: 1,
            message: 'Otp verified successfully',
            userDetails: payload,
            token: token
          })
        }
      } else {
        return res.send({
          success: 0,
          message: 'Otp does not matching'
        })
      }
    } catch (err) {
      res.status(500).send({
        success: 0,
        message: err.message
      })
    }
  };

  //  *** Send OTP for already registered user ***
  exports.sendOtp = async (req, res) => {
    var phone = req.body.phone;
    try {
      var checkPhone = await Users.findOne({
        phone: phone,
        isVerified: true,
        status: 1
      });
      if (!checkPhone) {
        return res.status(400).send({
          success: 0,
          message: 'Phone number is not registered with us'
        })
      }
      var otpResponse = await otp(phone)
      res.status(200).send({
        success: 1,
        message: 'OTP is sent to your registered phone number for verification',
        item: otpResponse
      });
    } catch (err) {
      res.status(500).send({
        success: 0,
        message: err.message
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