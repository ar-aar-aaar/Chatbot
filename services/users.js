const Request = require("request");
const ENDPOINT = 'http://209c15cd.ngrok.io';

class userService {

    static getDaysOff(id) {
        var URL = '';
        return new Promise((resolve, reject) => {
            URL = `http://10.11.1.13:7012/chatbot/chatbotHoliday?id=${id}`
            console.log(URL);
            Request.get(URL, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                let user = JSON.parse(body);
                resolve(user);
            });
        })
    }

    static getUsers(name, lastname) {
        var ACCES_POINT = '';
        var URL = '';
        return new Promise((resolve, reject) => {
            if (lastname) {
                lastname = `&&lastName=${lastname}`;
                ACCES_POINT = '/contact/getContactNL'
            } else {
                lastname = '';
                ACCES_POINT = '/contact/getContact'
            }
            URL = `${ENDPOINT}${ACCES_POINT}?name=${name}${lastname}`
            console.log(URL);
            Request.get(URL, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                let user = JSON.parse(body);
                resolve(user);
            });
        })
    }

}

module.exports.userService = userService;