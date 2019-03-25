const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { Paths } = require('./paths/pathSaldoVacaciones.js');
const { ContactPath } = require('./paths/pathContact.js');
const { SolicitarVacacionesPath } = require("./paths/pathSolicitarVacaciones.js");

const question = {
    name: "name",
    vacaciones: "vacaciones",
    none: "none"
}
// The accessor names for the conversation flow and user profile state property accessors.
const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

let vacaciones = false;
let contacto = false;
let solicitudVacaciones = false;
let datosSolicitante = {
    usuarioSolicitante: '',
    diasDisponibles:    0,
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

            if (topIntent.intent == 'Saldo Vacaciones' || (topIntent.intent == "Nombre" && vacaciones)) {
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

            }
            else {
                await turnContext.sendActivity(`No te entiendi, intenta con otra pregunta`);
            }
        }
    }

}

module.exports.LuisBot = LuisBot;
