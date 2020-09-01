var commonStorePath = 'http://172.105.33.226/church-app-images/'
module.exports = {
  gateway: {
    url: "http://localhost:5000"
  },
  otp: {
    expirySeconds: 2 * 60
  },
  users: {
    imageBase: commonStorePath + 'users/',
    resultsPerPage: 30
  },
  pasters: {
    imageBase: commonStorePath + 'pasters/',
     imageUploadPath: 'uploads',

    //imageUploadPath: '/var/www/html/church-app-images/pasters/',
    resultsPerPage: 30
  },
  groups: {
    imageBase: commonStorePath + 'groups/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/groups/'
  },
  feeds: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'feeds/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/feeds/'
  },
  events: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'events/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/events/'
  },
  buyorsell: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'buyorsell/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/buyorsell/'
  },
  charity: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'charity/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/charity/'
  },
  matrimony: {
    imageBase: commonStorePath + 'matrimony/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/matrimony/',
    resultsPerPage: 30,

  },
  ngos: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'ngo/',
    // imageUploadPath: 'uploads'
    imageUploadPath: '/var/www/html/church-app-images/ngo/'
  },
  urogulf: {
    resultsPerPage: 30
  },
  sermons: {
    resultsPerPage: 30,
    imageBase: commonStorePath + 'sermons/'
  },
  bloodDonation: {
    resultsPerPage: 30
  },
  livePrayers: {
    imageBase: commonStorePath + 'live-prayers/',
    resultsPerPage: 30
  },
  donations: {
    resultsPerPage: 30,
  },

  resetpassword: {
    timeForExpiry: 24 *60 * 60 * 1000,
    root:"http://localhost:4200/reset-password"
  },
  email: {
    sendgridApiKey: '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'
  },
  oneSignal: {
    appId : "9777ade8-faad-4cc1-96fa-8f3109efa482",
    apiKey: "AAAAGBV0me0:APA91bHhvNC6N0gvjLjcsuNDT1uDASIx25mt56gCGkf2VSnDkA6G1iSsW9etroTQIR_F7kqBEWM95jsVFM7U_RqtXlcAskw8JzvkE-CMZLQ6naZZ58zbNhXyJ8JRCRFexR1H9F54luxG",
  },

}