var Church = require('../models/church.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');
var Posts = require('../models/post.model')
var Charity = require('../models/charity.model');
var CharityPay = require('../models/charityPayments.model');
var User = require('../models/user.model')
var config = require('../../config/app.config.js');
const constants = require('../helpers/constants');
const feedType = constants.TYPE_FEEDPOST;


var charityConfig = config.charity;
exports.delete = async (req,res) => {

    const identity = req.identity.data;

    let params = req.body;

    if (!params.id){
        return res.send({
            success:0,
            msg:"no values found"
        })
    }

    let data = await Charity.updateOne({
        _id:params.id,
        status: 1
    },{status:0}).catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(userDatas);
    }

    if(!data){
        return res.send({
            success:0,
            msg:"something wrong"
        })
    }
    return res.send({
        success:1,
        msg:"successfully updated"
    })
}
exports.update = async (req,res) => {

    const identity = req.identity.data;

    let params = req.body;

    if (!params.object){
        return res.send({
            success:0,
            msg:"no values found"
        })
    }

    let data = await Charity.updateOne({
        _id:params.id,
        status: 1
    },params.object).catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(userDatas);
    }

    if(!data){
        return res.send({
            success:0,
            msg:"something wrong"
        })
    }
    return res.send({
        success:1,
        msg:"successfully updated"
    })

}
exports.add = async (req,res) => {

   // return res.send("ok")
    const identity = req.identity.data;
     var adminUserId = identity.id;
     var churchId = identity.church;
    var params = req.body;
    var errorArray = [];
    var flag = false ;

    if (!params.title){
       errorArray.push('no value found for title')
    }
    if (!params.amount){
        errorArray.push("no value found for amount")
    }

    if (!params.about){
        errorArray.push("no value found for about informaion")
    }
    if (!params.organisation){
        errorArray.push("no value found for organisation")
    }
    if (!params.phone){
        errorArray.push("no value found for phone")
    }

    if ( errorArray.length > 0){
        return res.send({
            success:0,
            msg: errorArray
        })
    }

     var charity = new Charity({
        title:params.title,
        charityId: params.charityId,
        trustname: params.organisation,
        fund: params.amount,
        phone: params.phone,
        paidOn: params.paidOn,
        status: 1,
        tsCreatedAt: Date.now(),
        tsModifiedAt: null
      });
      var new_charity = await charity.save();


      
      if (!new_charity){
          return res.send({
              success:0,
              msg:"something wrong"
          })
      }

      return res.send({
          success:1,
          id:new_charity._id
      })
}


exports.list = async (req,res) => {

    const identity = req.identity.data;
     var adminUserId = identity.id;
     var churchId = identity.church;
    var params = req.query;

    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var filter = {};
    filter.status =0;
    filter.__v = 0;
    filter.tsModifiedAt = 0;
    filter.images = 0;
    filter.phone = 0;
    
    let data = await Charity.find({
        status: 1
    },filter).limit(perPage).skip(offset)
    .sort({
        'tsCreatedAt': -1
    }).catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting users',
                error: err
            }
        })
    if (data && (data.success !== undefined) && (data.success === 0)) {
        return res.send(userDatas);
    }
   

    
   
    var totalPostCount = await Charity.countDocuments({status:1})
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while finding post count',
                error: err
            }
        })
    if (totalPostCount && (totalPostCount.success !== undefined) && (totalPostCount.success === 0)) {
        return res.send(totalPostCount);
    }

    totalPages = totalPostCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page,
        perPage,
        hasNextPage,
        totalItems: totalPostCount,
        totalPages
    }
    return res.status(200).send({
        success: 1,
        pagination,
        
        items:data,
        message: 'List feeds'
    })
}

exports.details = async (req,res) => {

    const identity = req.identity.data;
    
    var params = req.body;

    
    
    let data = await CharityPay.find({},{userId:1,amount:1});

    var array = [];

    for (x in data){

        let user = await User.findOne({_id:data[x].userId},{name:1})
        let object = {
            user:user.name,
            amt:data[x].amount
        }

        array.push(object)
    }
   
    return res.send({
        success:1,
        items:array
    })

}