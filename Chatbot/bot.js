// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const {Paths} = require('./paths.js');


// Identifies the last question asked.
const question = {
    name: "name",
    age: "age",
    date: "date",
    none: "none"
}



let vacaciones = false;
let contacto = false;

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
// The accessor names for the conversation flow and user profile state property accessors.
const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';


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
                
                await Paths.fillOutUserProfile(flow, results, turnContext);


                // Update state and save changes.
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            } else if (topIntent.intent == 'Contacto colaborador' || (topIntent.intent == "Nombre" && contacto)) {

                contacto = true;
                await Paths.contactPath(flow, results, turnContext);

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
