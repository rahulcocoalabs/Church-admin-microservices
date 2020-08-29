var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Locations = require('../models/locations.model')
var Users = require('../models/user.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const feedType = constants.TYPE_FEEDPOST;
var feedsConfig = config.feeds;

exports.add = async (req, res) => {

    var identity = req.identity.data;
    var params = req.body;
    var errors = [];
    if (!params.state){
        errors.push("state");
    }
    if (!params.country){
        errors.push("country");
    }
    if (!params.district){
        errors.push("district");
    }
    if (!params.address){
        errors.push("address");
    }
    if (!params.branch){
        
        errors.push("branch name");
    }

    if (errors.length > 0){
        return res.json({
            success:0,
            fields_missing:errors
        })
    }
    return res.send(errors)
    var newLocation = new Locations({
        country: params.country,
        state: params.state,
        district:params.district,
        address: params.address,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
      });
      
      var saved = await newLocation.save();
      if (saved){
          return res.send({
              success:1,
              msg:"added successfully"
          })
      }
      else {
        return res.send({
            success:0,
            msg:"something wrong"
        })
      }

}

exports.list = async (req, res) => {
    // return res.send(req.identity.data);
    var identity = req.identity.data;
    var params = req.body;
    // var page = Number(params.page) || 1;
    // page = page > 0 ? page : 1;
    // var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    // perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    // var offset = (page - 1) * perPage;

    var find  = {};

    find.country = params.country;
    find.state = params.state;
    find.district = params.district;
    var proj = {
        branch:1,
        address:1
    };
    var list = await Locations.find(find,proj)
    // .limit(perPage)
    // .skip(offset)
    .catch(err => {
        return {
            success: 0,
            message: 'Something went wrong while listing posts',
            error: err
        }
    })


    return res.send({
        success:1,
        items:list
    })

}
