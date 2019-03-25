
// Identifies the last question asked.
const question = {
    name: "name",
    age: "age",
    date: "date",
    none: "none"
}


let vacaciones = false;
let contacto = false;


const {LuisBot}= require ('./bot.js');
const ENDPOINT = 'http://10.11.1.191:9090';
const Request = require("request");

class Paths{

    static getDaysOff(id) {
        var URL = '';
        return new Promise((resolve, reject) => {
            URL = `http://10.11.1.13:7012/chatbot/chatbotHoliday?id=${id}`
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
    // Manages the conversation flow for filling out the user's profile.
    static async fillOutUserProfile(flow, results, turnContext) {
        switch (flow.lastQuestionAsked) {
            case question.none:
                await turnContext.sendActivity("Claro, cual es tu nombre?");
                flow.lastQuestionAsked = question.name;
                break;
            case question.name:
                var nombre = '';
                var apellido = '';
                try {
                    results.entities.Name.forEach(name => { nombre = `${nombre} ${name}` });
                    results.entities.LastName.forEach(lastname => { apellido = `${apellido} ${lastname}` })
                } catch (error) {
                    console.log(error);
                }

                console.log("-------------------------------");
                console.log(turnContext.activity.text);
                console.log(turnContext.activity.from.name);
                console.log(results.entities);
                console.log(nombre.trim());
                console.log(apellido.trim());
                console.log("-------------------------------");

                var usuarios = await this.getUsers(nombre.trim(), apellido.trim());
                var numeroDeUuarios = usuarios.length;

                if (numeroDeUuarios > 0) {
                    if (numeroDeUuarios < 2) {
                        var daysOff = await this.getDaysOff(usuarios[0].id_myaxity);
                        await turnContext.sendActivity(`${usuarios[0].name} ${usuarios[0].lastName} tiene ${daysOff.totalDays} dias de vacaciones.`);
                        await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                        vacaciones = false;
                        flow.lastQuestionAsked = question.none;
                    } else {
                        await turnContext.sendActivity('Hay muchos usuarios con ese nombre, a cual te refieres?');
                        usuarios.forEach((usuario) => {
                            turnContext.sendActivity(`${usuario.name} ${usuario.lastName}`);
                        })
                        flow.lastQuestionAsked = question.name;
                    }
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity("No hay usuarios con ese nombre, lo lamento");
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    vacaciones = false;
                    flow.lastQuestionAsked = question.none;
                    break;
                }
        }
    }

    // Manages the conversation flow for filling out the user's profile.
    static async contactPath(flow, results, turnContext) {
        switch (flow.lastQuestionAsked) {
            case question.none:
                var nombre = '';
                var apellido = '';
                try {
                    results.entities.Name.forEach(name => { nombre = `${nombre} ${name}` });
                    results.entities.LastName.forEach(lastname => { apellido = `${apellido} ${lastname}` })
                } catch (error) {
                    console.log(error);
                }

                var usuarios = await LuisBot.getUsers(nombre.trim(), apellido.trim());
                var numeroDeUuarios = usuarios.length;

                if (numeroDeUuarios > 0) {
                    if (numeroDeUuarios < 2) {
                        var daysOff = await this.getDaysOff(usuarios[0].id_myaxity);
                        await turnContext.sendActivity(`Nombre: ${usuarios[0].name} ${usuarios[0].lastName}`);
                        await turnContext.sendActivity(`Telefono: ${usuarios[0].phone}`);
                        await turnContext.sendActivity(`E-mail: ${usuarios[0].email}`);
                        await turnContext.sendActivity('\nTe puedo ayudar en otra cosa?');
                        contacto = false;
                        flow.lastQuestionAsked = question.none;
                    } else {
                        await turnContext.sendActivity('Hay muchos usuarios con ese nombre, a cual te refieres?');
                        usuarios.forEach((usuario) => {
                            turnContext.sendActivity(`${usuario.name} ${usuario.lastName}`);
                        })
                        flow.lastQuestionAsked = question.none;
                    }
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    contacto = false;
                    await turnContext.sendActivity("No hay usuarios con ese nombre, lo lamento");
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    flow.lastQuestionAsked = question.none;
                    break;
                }
        }
    }

}

module.exports.Paths = Paths;