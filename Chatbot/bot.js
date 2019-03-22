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


    // Validates name input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateName(input) {
        const name = input && input.trim();
        return name != undefined
            ? { success: true, name: name }
            : { success: false, message: 'Please enter a name that contains at least one character.' };
    };

    // Validates age input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateAge(input) {

        // Try to recognize the input as a number. This works for responses such as "twelve" as well as "12".
        try {
            // Attempt to convert the Recognizer result to an integer. This works for "a dozen", "twelve", "12", and so on.
            // The recognizer returns a list of potential recognition results, if any.
            const results = Recognizers.recognizeNumber(input, Recognizers.Culture.English);
            let output;
            results.forEach(function (result) {
                // result.resolution is a dictionary, where the "value" entry contains the processed string.
                const value = result.resolution['value'];
                if (value) {
                    const age = parseInt(value);
                    if (!isNaN(age) && age >= 18 && age <= 120) {
                        output = { success: true, age: age };
                        return;
                    }
                }
            });
            return output || { success: false, message: 'Please enter an age between 18 and 120.' };
        } catch (error) {
            return {
                success: false,
                message: "I'm sorry, I could not interpret that as an age. Please enter an age between 18 and 120."
            };
        }
    }

    // Validates date input. Returns whether validation succeeded and either the parsed and normalized
    // value or a message the bot can use to ask the user again.
    static validateDate(input) {
        // Try to recognize the input as a date-time. This works for responses such as "11/14/2018", "today at 9pm", "tomorrow", "Sunday at 5pm", and so on.
        // The recognizer returns a list of potential recognition results, if any.
        try {
            const results = Recognizers.recognizeDateTime(input, Recognizers.Culture.English);
            const now = new Date();
            const earliest = now.getTime() + (60 * 60 * 1000);
            let output;
            results.forEach(function (result) {
                // result.resolution is a dictionary, where the "values" entry contains the processed input.
                result.resolution['values'].forEach(function (resolution) {
                    // The processed input contains a "value" entry if it is a date-time value, or "start" and
                    // "end" entries if it is a date-time range.
                    const datevalue = resolution['value'] || resolution['start'];
                    // If only time is given, assume it's for today.
                    const datetime = resolution['type'] === 'time'
                        ? new Date(`${now.toLocaleDateString()} ${datevalue}`)
                        : new Date(datevalue);
                    if (datetime && earliest < datetime.getTime()) {
                        output = { success: true, date: datetime.toLocaleDateString() };
                        return;
                    }
                });
            });
            return output || { success: false, message: "I'm sorry, please enter a date at least an hour out." };
        } catch (error) {
            return {
                success: false,
                message: "I'm sorry, I could not interpret that as an appropriate date. Please enter a date at least an hour out."
            };
        }
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

                results.entities.Name.forEach(name => { nombre = `${nombre} ${name}` });
                try {
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
                    flow.lastQuestionAsked = question.none;
                    break;
                }
        }
    }

    // Manages the conversation flow for filling out the user's profile.
    static async contactPath(flow, profile, turnContext) {
        const input = turnContext.activity.text;
        let result;
        switch (flow.lastQuestionAsked) {
            // If we're just starting off, we haven't asked the user for any information yet.
            // Ask the user for their name and update the conversation flag.
            case question.none:
                result = this.validateName(input);
                if (result.success) {
                    name = result.name;
                    lastname = result.lastname;
                    await turnContext.sendActivity(`Nombre: ${name} ${lastname}.`);
                    await turnContext.sendActivity(`Correo: ${correo}`);
                    await turnContext.sendActivity(`Telefono: ${telefono}`);
                }
                await turnContext.sendActivity("Claro, cual es tu nombre?");
                flow.lastQuestionAsked = question.name;
                break;

            // If we last asked for their name, record their response, confirm that we got it.
            // Ask them for their age and update the conversation flag.
            case question.name:
                result = this.validateName(input);
                if (result.success) {
                    this.getUsers();
                    profile.name = result.name;
                    await turnContext.sendActivity(`${profile.name} tiene 10 dias de vacaciones.`);
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    flow.lastQuestionAsked = question.none;
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity(
                        result.message || "I'm sorry, I didn't understand that.");
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

            if (topIntent.intent == 'Saldo Vacaciones' || topIntent.intent == "Nombre") {

                await LuisBot.fillOutUserProfile(flow, results, turnContext);


                // Update state and save changes.
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            } else if (topIntent.intent == 'contacto') {

                await LuisBot.contactPath(flow, profile, turnContext);

                // Update state and save changes.
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            }
        }
    }

}

module.exports.LuisBot = LuisBot;
