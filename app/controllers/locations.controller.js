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
    if (!params.country) {
        errors.push({
            field: "country",
            message: 'Country required'
        })
    }

    if (!params.state) {
        errors.push({
            field: "state",
            message: "state is required"
        })
    }

    if (!params.district) {
        errors.push({
            field: "district",
            message: "district is required"
        })
    }

    if (!params.branch) {
        errors.push({
            field: "branch",
            message: "branch is required"
        })
    }

    if (!params.address) {
        errors.push({
            field: "address",
            message: "address is required"
        })
    }

    if (errors.length > 0) {
        return res.status(400).send({
            success: 0,
            errors: errors
        });
    }

    var newLocation = new Locations({
        country: params.country,
        state: params.state,
        district:params.district,
        address: params.address,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
      });
      
      var saved = await newLocation.save()
          .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while saving event',
                    error: err
                }
            })
        if (saved && (saved.success !== undefined) && (saved.success === 0)) {
            return res.send(saved);
        }
      if (saved){
          return res.send({
              success:1,
              message:"added successfully"
          })
      }
      else {
        return res.send({
            success:0,
            message:"something wrong"
        })
      }

}

exports.list = async (req, res) => {
    // return res.send(req.identity.data);
    var identity = req.identity.data;
    var params = req.query;
    // var page = Number(params.page) || 1;
    // page = page > 0 ? page : 1;
    // var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    // perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    // var offset = (page - 1) * perPage;

    var find  = {};
    if (params.country){
        find.country = params.country;
    }
    if (params.state){
        find.state = params.state;
    }
    if (params.district){
        find.district = params.district;
    }
    
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
            message: 'Something went wrong while listing locations',
            error: err
        }
    })

    if (list && (list.success !== undefined) && (list.success === 0)) {
        return res.send(list);
    }
    return res.send({
        success:1,
        items:list
    })

}
