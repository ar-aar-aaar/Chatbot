const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { Paths } = require('./paths/pathSaldoVacaciones.js');
const { ContactPath } = require('./paths/pathContact.js');
const { SolicitarVacacionesPath } = require("./paths/pathSolicitarVacaciones.js");

const question = {
    name: "name",
    vacaciones: "vacaciones",
    none: "none"
};

const saludos = {
    0: "Buenos dias",
    1: "Que tal, como estas :)",
    2: "Mucho gusto c:",
    3: "Hola",
    4: "Hola, te puedo ayudar en algo?",
    5: "Que onda",
    6: "Que hongo",
    7: "Como estas",
    8: "Que paso",
    9: "Mucho gusto"
};
// The accessor names for the conversation flow and user profile state property accessors.
const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

let vacaciones = false;
let contacto = false;
let solicitudVacaciones = false;
let datosSolicitante = {
    usuarioSolicitante: '',
    diasDisponibles: 0,
    fechaDeSolicitud: new Date()
};

class LuisBot {

    constructor(application, luisPredictionOptions, conversationState, userState) {
        this.luisRecognizer = new LuisRecognizer(application, luisPredictionOptions, true);
        this.conversationFlow = conversationState.createProperty(CONVERSATION_FLOW_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;
    }

    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {


            const results = await this.luisRecognizer.recognize(turnContext);
            const topIntent = results.luisResult.topScoringIntent;

            const flow = await this.conversationFlow.get(turnContext, { lastQuestionAsked: question.none });
            const profile = await this.userProfile.get(turnContext, {});

            if (topIntent.intent == 'exit') {
                await turnContext.sendActivity("Puedo ayudarte en algo mas?");

                await this.conversationFlow.set(turnContext, {lastQuestionAsked: question.none});
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, {});
                await this.userState.saveChanges(turnContext);

                vacaciones = false;
                contacto = false;
                solicitudVacaciones = false;
            } else if (topIntent.intent == 'Saldo Vacaciones' || (topIntent.intent == "Nombre" && vacaciones)) {
                console.log(topIntent);
                vacaciones = await Paths.pathSaldoVacaciones(flow, results, turnContext);
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);
                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            } else if (topIntent.intent == 'Contacto colaborador' || (topIntent.intent == "Nombre" && contacto)) {
                contacto = await ContactPath.contactPath(results, turnContext);
                console.log(results.entities);
            } else if (topIntent.intent == 'Solicitar vacaciones'
                || (topIntent.intent == 'Nombre' && solicitudVacaciones)
                || (topIntent.intent == 'numeros' && solicitudVacaciones)) {

                solicitudVacaciones = await SolicitarVacacionesPath.pathSolicitudVacaciones(flow, results, turnContext, datosSolicitante);

                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);

            } else if("Saludos"){
                var numeroDeSaludo = Math.floor(Math.random() * 10); 
                console.log(numeroDeSaludo);
                await turnContext.sendActivity(saludos[numeroDeSaludo]);
                await this.conversationFlow.set(turnContext, {lastQuestionAsked: question.none});
                await this.conversationState.saveChanges(turnContext);
                await this.userProfile.set(turnContext, {});
                await this.userState.saveChanges(turnContext);
                vacaciones = false;
                contacto = false;
                solicitudVacaciones = false;
            } else {
                await turnContext.sendActivity(`No te entiendi, intenta con otra pregunta`);
            }
        }
    }

}

module.exports.LuisBot = LuisBot;
