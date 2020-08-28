const OneSignal = require('onesignal-node');
var config = require('../../config/app.config.js');
var PushNotification = require('../models/pushNotification.model');
var Church = require('../models/church.model');
var constants = require('../helpers/constants');
var oneSignalConfig = config.oneSignal;

module.exports = {
    sendNotification: async function (notificationObj) {
var oneSignalClient = new OneSignal.Client(oneSignalConfig.appId, oneSignalConfig.apiKey);

        var notificationData = {
            // contents: message,
            contents: {
                "tr": notificationObj.message,
                "en": notificationObj.message,
            },
            headings: {
                "en": notificationObj.title
            },
            subtitle: {
                "en": notificationObj.message,
            },
            data: {
                "type": notificationObj.type,
                "reference_id": notificationObj.referenceId,
            }
            ,
            included_segments: null,
            filters: notificationObj.filtersJsonArr
        };
        console.log("notificationData");
        console.log(notificationData);
        console.log("notificationData");
        // using async/await
        try {
            const response = await oneSignalClient.createNotification(notificationData);
            console.log("response");
            console.log(response);
            console.log("response");
            console.log(response.body.id);
            var notificationLogObj = {};
            notificationLogObj.type = notificationObj.type;
            notificationLogObj.churchId = notificationObj.churchId;
            notificationLogObj.title = notificationObj.title;
            notificationLogObj.messageText = notificationObj.message;
            notificationLogObj.filtersJsonArr = notificationObj.filtersJsonArr;
            if(notificationObj.userId){
                notificationLogObj.userId = notificationObj.userId;
            }
            if (notificationObj.type === constants.EVENT_NOTIFICATION) {
                notificationLogObj.eventId = notificationObj.referenceId;
            }
            if (notificationObj.type === constants.CHARITY_NOTIFICATION) {
                notificationLogObj.charityId = notificationObj.referenceId;
            }
            if (notificationObj.type === constants.SERMON_NOTIFICATION) {
                notificationLogObj.sermonsId = notificationObj.referenceId;
            }
           
            notificationLogObj.referenceId = notificationObj.referenceId;
            notificationLogObj.sentAt = Date.now();
            notificationLogObj.status = 1;
            notificationLogObj.tsCreatedAt = Date.now();
            notificationLogObj.tsModifiedAt = null;
            var logObj = new PushNotification(notificationLogObj);
            var notificationData = await logObj.save()
                .catch(err => {
                    return {
                        success: 0,
                        message: 'Something went wrong while saving push notifocation log',
                        error: err
                    }
                })
            if (notificationData && (notificationData.success !== undefined) && (notificationData.success === 0)) {
                return eventData;
            }

            return response;

        } catch (e) {
            console.log("e")
            console.log(e)
            console.log("e")
            if (e instanceof OneSignal.HTTPError) {
                // When status code of HTTP response is not 2xx, HTTPError is thrown.
                console.log(e.statusCode);
                console.log(e.body);
            }
            return e;

        }

    },

}