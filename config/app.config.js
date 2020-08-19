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
    imageUploadPath: '/var/www/html/church-app-images/charity/'
  },
  matrimony: {
    imageBase: commonStorePath + 'matrimony/',
    // imageUploadPath: 'uploads',
    imageUploadPath: '/var/www/html/church-app-images/matrimony/',
    resultsPerPage: 30,

  }


}