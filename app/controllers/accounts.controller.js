  const Users = require('../models/user.model');
  const Otp = require('../models/otp.model');
  const config = require('../../config/app.config.js');
  const constants = require('../helpers/constants');
  var otpConfig = config.otp;
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

      // var otpResponse = await otp(phone)
      var newUser = new Users({
        name: name,
        email: email,
        phone: phone,
        passwordHash : hash,
        // address: address,
        church: church,

        // parish: parish,
        // parishWard: parishWard,
        // bloodGroup: bloodGroup,
        userType : constants.SUB_ADMIN_USER,
        // isVerified: true,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
      });
      var saveUser = await newUser.save();
      var payload = {
        id: saveUser._id,
        name,
        email,
        phone,
        church
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
        userDetails : payload
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
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking email',
                error: err
            }
        })

    if (userData && userData.success && (userData.success === 0)) {
        return res.send(userData);
    }
    if (!userData) {
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
