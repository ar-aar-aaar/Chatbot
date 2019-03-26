const { userService } = require('../services/users.js');

const question = {
    name: "name",
    none: "none"
}

class Paths {


    // Manages the conversation flow for filling out the user's profile.
    static async pathSaldoVacaciones(flow, results, turnContext) {
        console.log(question.none);

        switch (flow.lastQuestionAsked) {
            case question.none:
                await turnContext.sendActivity("Claro, cual es tu nombre?");
                flow.lastQuestionAsked = question.name;
                return true;
            case question.name:
                var nombre = '';
                var apellido = '';
                try {
                    console.log(results.entities);
                    results.entities.Name.forEach(name => { nombre = `${nombre} ${name}`.trim() });
                    results.entities.LastName.forEach(lastname => { apellido = `${apellido} ${lastname}`.trim() })
                } catch (error) {
                    console.log(error);
                }
                var usuarios = await userService.getUsers(nombre.trim(), apellido.trim()).catch(error => {
                    console.log(error);
                });
                var numeroDeUuarios = usuarios.length;

                if (numeroDeUuarios > 0) {
                    if (numeroDeUuarios < 2) {
                        var daysOff = await userService.getDaysOff(usuarios[0].id_myaxity).catch(error => {
                            console.log(error);
                        });
                        daysOff.totalDays = daysOff.totalDays === undefined ? 0 : daysOff.totalDays;
                        await turnContext.sendActivity(`${usuarios[0].name} ${usuarios[0].lastName} tiene ${daysOff.totalDays} dias de vacaciones.`);
                        await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                        flow.lastQuestionAsked = question.none;
                        return false;
                    } else {
                        await turnContext.sendActivity('Hay muchos usuarios con ese nombre, a cual te refieres?');
                        usuarios.forEach((usuario) => {
                            turnContext.sendActivity(`${usuario.name} ${usuario.lastName}`);
                        })
                        flow.lastQuestionAsked = question.name;
                    }
                    return true;
                } else {
                    // If we couldn't interpret their input, ask them for it again.
                    // Don't update the conversation flag, so that we repeat this step.
                    await turnContext.sendActivity("No hay usuarios con ese nombre, lo lamento");
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    flow.lastQuestionAsked = question.none;
                    return false;
                }
        }
    }

}

module.exports.Paths = Paths;