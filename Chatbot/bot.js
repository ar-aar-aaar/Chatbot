// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const Request = require("request");
const ENDPOINT = 'http://10.11.1.235:9090'

// The accessor names for the conversation flow and user profile state property accessors.
const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

// Identifies the last question asked.
const question = {
    name: "name",
    age: "age",
    date: "date",
    none: "none"
}

const meses = {
    "01": 31,
    "02": 28,
    "03": 31,
    "04": 30,
    "05": 31,
    "06": 30,
    "07": 31,
    "08": 31,
    "09": 30,
    "10": 31,
    "11": 30,
    "12": 31
}

let vacaciones = false;
let contacto = false;

/**
 * A simple bot that responds to utterances with answers from the Language Understanding (LUIS) service.
 * If an answer is not found for an utterance, the bot responds with help.
 */
class LuisBot {
    /**
     * The LuisBot constructor requires one argument (`application`) which is used to create an instance of `LuisRecognizer`.
     * @param {LuisApplication} luisApplication The basic configuration needed to call LUIS. In this sample the configuration is retrieved from the .bot file.
     * @param {LuisPredictionOptions} luisPredictionOptions (Optional) Contains additional settings for configuring calls to LUIS.
     */
    constructor(application, luisPredictionOptions, conversationState, userState) {
        this.luisRecognizer = new LuisRecognizer(application, luisPredictionOptions, true);
        this.conversationFlow = conversationState.createProperty(CONVERSATION_FLOW_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        // The state management objects for the conversation and user.
        this.conversationState = conversationState;
        this.userState = userState;
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

                var usuarios = await this.getUsers(nombre.trim(), apellido.trim());
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

    async onTurn(turnContext) {
        // This bot listens for message activities.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Get the state properties from the turn context.


            const results = await this.luisRecognizer.recognize(turnContext);

            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;

            const flow = await this.conversationFlow.get(turnContext, { lastQuestionAsked: question.none });
            const profile = await this.userProfile.get(turnContext, {});

            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            console.log(turnContext.activity.text);
            console.log(turnContext.activity.from.name);
            console.log(results.entities);
            console.log(topIntent.intent);
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

            if (topIntent.intent == 'Saldo Vacaciones' || (topIntent.intent == "Nombre" && vacaciones)) {

                vacaciones = true;
                await LuisBot.fillOutUserProfile(flow, results, turnContext);


                // Update state and save changes.
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            } else if (topIntent.intent == 'Contacto colaborador' || (topIntent.intent == "Nombre" && contacto)) {

                contacto = true;
                await LuisBot.contactPath(flow, results, turnContext);

                // Update state and save changes.
                console.log(results.entities);
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            } else if (topIntent.intent == 'Solicitar vacaciones'){
                var fechaActual = new Date();
                var mesActual = fechaActual.getMonth() + 1;
                var anioActual = fechaActual.getFullYear();
                var mesDeSolicitud = results.entities.meses;
                var anioDeSolicitud = results.entities.anio;
                var diaDeSolicitud = results.entities.number;
                if(!anioDeSolicitud){
                    anioDeSolicitud = anioActual;
                    if(mesActual > mesDeSolicitud){
                        anioDeSolicitud = anioActual +1;
                    }
                }
                var fechaDeSolicitud = new Date(`${mesDeSolicitud}-${diaDeSolicitud}-${anioDeSolicitud}`);
                console.log(fechaDeSolicitud);
                console.log(meses[mesDeSolicitud]);
            }
        }
    }

}

module.exports.LuisBot = LuisBot;
