// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

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
    static async fillOutUserProfile(flow, profile, turnContext) {
        const input = turnContext.activity.text;
        let result;
        switch (flow.lastQuestionAsked) {
            // If we're just starting off, we haven't asked the user for any information yet.
            // Ask the user for their name and update the conversation flag.
            case question.none:
                await turnContext.sendActivity("Let's get started. What is your name?");
                flow.lastQuestionAsked = question.name;
                break;

            // If we last asked for their name, record their response, confirm that we got it.
            // Ask them for their age and update the conversation flag.
            case question.name:
                result = this.validateName(input);
                if (result.success) {
                    profile.name = result.name;
                    await turnContext.sendActivity(`I have your name as ${profile.name}.`);
                    await turnContext.sendActivity('How old are you?');
                    flow.lastQuestionAsked = question.age;
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity(
                        result.message || "I'm sorry, I didn't understand that.");
                    break;
                }

            // If we last asked for their age, record their response, confirm that we got it.
            // Ask them for their date preference and update the conversation flag.
            case question.age:
                result = this.validateAge(input);
                if (result.success) {
                    profile.age = result.age;
                    await turnContext.sendActivity(`I have your age as ${profile.age}.`);
                    await turnContext.sendActivity('When is your flight?');
                    flow.lastQuestionAsked = question.date;
                    break;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity(
                        result.message || "I'm sorry, I didn't understand that.");
                    break;
                }

            // If we last asked for a date, record their response, confirm that we got it,
            // let them know the process is complete, and update the conversation flag.
            case question.date:
                result = this.validateDate(input);
                if (result.success) {
                    profile.date = result.date;
                    await turnContext.sendActivity(`Your cab ride to the airport is scheduled for ${profile.date}.`);
                    await turnContext.sendActivity(`Thanks for completing the booking ${profile.name}.`);
                    await turnContext.sendActivity('Type anything to run the bot again.');
                    flow.lastQuestionAsked = question.none;
                    profile = {};
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



    // /**
    //  * Every conversation turn calls this method.
    //  * There are no dialogs used, since it's "single turn" processing, meaning a single request and
    //  * response, with no stateful conversation.
    //  * @param {TurnContext} turnContext A TurnContext instance, containing all the data needed for processing the conversation turn.
    //  */
    // async onTurn(turnContext) {
    //     // By checking the incoming Activity type, the bot only calls LUIS in appropriate cases.
    //     if (turnContext.activity.type === ActivityTypes.Message) {
    //         // Perform a call to LUIS to retrieve results for the user's message.
    //         const results = await this.luisRecognizer.recognize(turnContext);

    //         // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
    //         const topIntent = results.luisResult.topScoringIntent;

    //         if (topIntent.intent == 'Telefonos') {
    //             console.log(turnContext.activity.text);
    //             console.log(turnContext.activity.from.name);
    //             console.log(results.entities);//$instance.Nombres);

    //             await turnContext.sendActivity(`El telefono de ${results.entities.Nombres} es 5518755714`);
    //             //await turnContext.getActivity(turnContext);
    //         } else {
    //             // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
    //             await turnContext.sendActivity(`No LUIS intents were found.
    //                                             \nThis sample is about identifying two user intents:
    //                                             \n - 'Calendar.Add'
    //                                             \n - 'Calendar.Find'
    //                                             \nTry typing 'Add Event' or 'Show me tomorrow'.`);
    //         }
    //     } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
    //         turnContext.activity.recipient.id !== turnContext.activity.membersAdded[0].id) {
    //         // If the Activity is a ConversationUpdate, send a greeting message to the user.
    //         await turnContext.sendActivity('Welcome to the NLP with LUIS sample! Send me a message and I will try to predict your intent.');
    //     } else if (turnContext.activity.type !== ActivityTypes.ConversationUpdate) {
    //         // Respond to all other Activity types.
    //         await turnContext.sendActivity(`[${turnContext.activity.type}]-type activity detected.`);
    //     }
    // }



    async onTurn(turnContext) {
        // This bot listens for message activities.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Get the state properties from the turn context.


            const results = await this.luisRecognizer.recognize(turnContext);

            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;

            console.log(turnContext.activity.text);
            console.log(turnContext.activity.from.name);
            console.log(results.entities);//$instance.Nombres);

            if (topIntent.intent == 'Telefonos') {
                const flow = await this.conversationFlow.get(turnContext, { lastQuestionAsked: question.none });
                const profile = await this.userProfile.get(turnContext, {});

                await LuisBot.fillOutUserProfile(flow, profile, turnContext);

                // Update state and save changes.
                await this.conversationFlow.set(turnContext, flow);
                await this.conversationState.saveChanges(turnContext);

                await this.userProfile.set(turnContext, profile);
                await this.userState.saveChanges(turnContext);
            }
        }
    }


    //Para acceder al servicio
    getUsers() {
        var Request = require("request");

        Request.get("http://10.11.1.245:9090/login/users", (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            console.log("BODY: ");
            var jsonContent = JSON.parse(body);
            console.log(JSON.parse(body));

            var prueba = JSON.parse(body);


            console.log(prueba[0].username);



            return JSON.parse(body);

        });
    }
}

module.exports.LuisBot = LuisBot;
