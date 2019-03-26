const { userService } = require('../services/users.js');

const question = {
    name: "name",
    vacaciones: "vacaciones",
    none: "none"
}

const DIAS = {
    DOMINGO: 0,
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6
}

class SolicitarVacacionesPath {
    static async pathSolicitudVacaciones(flow, results, turnContext, datosSolicitante) {
        switch (flow.lastQuestionAsked) {
            case question.none:

                var fechaActual = new Date();
                var mesActual = fechaActual.getMonth() + 1;
                var anioActual = fechaActual.getFullYear();
                if (!results.entities.meses) {
                    await turnContext.sendActivity("Claro, cuando quieres tus vacaciones?");
                    return true;
                }
                var mesDeSolicitud = results.entities.meses;
                var anioDeSolicitud = results.entities.anio;
                var diaDeSolicitud = results.entities.number;
                if (!anioDeSolicitud) {
                    anioDeSolicitud = anioActual;
                    if (mesActual > mesDeSolicitud) {
                        anioDeSolicitud = anioActual + 1;
                    }
                }
                datosSolicitante.fechaDeSolicitud = new Date(`${mesDeSolicitud}-${diaDeSolicitud}-${anioDeSolicitud}`);
                console.log(datosSolicitante.fechaDeSolicitud);
                console.log(fechaActual);

                await turnContext.sendActivity("Claro, cual es tu nombre?");
                flow.lastQuestionAsked = question.name;
                return true;
            case question.name:
                var nombre = '';
                var apellido = '';
                try {
                    results.entities.Name.forEach(name => { nombre = `${nombre} ${name}`.trim() });
                    results.entities.LastName.forEach(lastname => { apellido = `${apellido} ${lastname}`.trim() })
                } catch (error) {
                    console.log(error);
                }
                datosSolicitante.usuarioSolicitante = await userService.getUsers(nombre.trim(), apellido.trim()).catch(error => {
                    console.log(error);
                });
                var numeroDeUuarios = datosSolicitante.usuarioSolicitante.length;

                if (numeroDeUuarios > 0) {
                    if (numeroDeUuarios < 2) {
                        datosSolicitante.diasDisponibles = await userService.getDaysOff(datosSolicitante.usuarioSolicitante[0].id_myaxity).catch(error => {
                            console.log(error);
                        });
                        datosSolicitante.diasDisponibles.totalDays = datosSolicitante.diasDisponibles.totalDays === undefined ? 0 : datosSolicitante.diasDisponibles.totalDays;
                        if (datosSolicitante.diasDisponibles.totalDays) {
                            await turnContext.sendActivity(`tienes ${datosSolicitante.diasDisponibles.totalDays} dias de vacaciones, cuantos deseas tomar?.`);
                            flow.lastQuestionAsked = question.vacaciones;
                        } else {
                            await turnContext.sendActivity('No tienes dias de vacaciones disponibles, lo siento :(');
                            await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                            flow.lastQuestionAsked = question.none;
                        }

                    } else {
                        await turnContext.sendActivity('Hay muchos usuarios con ese nombre, a cual te refieres?');
                        datosSolicitante.usuarioSolicitante.forEach((usuario) => {
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
            case question.vacaciones:
                var diasSolicitados = results.entities.number;
                if (datosSolicitante.diasDisponibles.totalDays >= diasSolicitados) {
                    await turnContext.sendActivity(this.fechaDeTerminoDeVacaciones(datosSolicitante.fechaDeSolicitud,
                        diasSolicitados));
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    flow.lastQuestionAsked = question.none;
                } else {
                    await turnContext.sendActivity("No tienes dias de vacaciones suficientes, lo siento");
                    await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                    flow.lastQuestionAsked = question.none;

                }
                return false;
        }
    }

    static fechaDeTerminoDeVacaciones(fechaVacaciones, numeroDeDias) {
        console.log(fechaVacaciones);
        var diaTermino = fechaVacaciones.getDate();
        var mesTermino = fechaVacaciones.getMonth() + 1;
        var anioTermino = fechaVacaciones.getFullYear();
        var fechaDeTerminoDeVacaciones = new Date(`${mesTermino}-${diaTermino}-${anioTermino}`);
        var diaCiclo;


        for (let i = 0; i < numeroDeDias; i++) {
            diaCiclo = fechaDeTerminoDeVacaciones.getDay();
            if (diaCiclo != DIAS.DOMINGO && diaCiclo != DIAS.SABADO) {
                fechaDeTerminoDeVacaciones.setDate(fechaDeTerminoDeVacaciones.getDate() + 1);
            } else {
                fechaDeTerminoDeVacaciones.setDate(fechaDeTerminoDeVacaciones.getDate() + 1);
                i--;
            }
        }
        console.log(fechaDeTerminoDeVacaciones);
        diaTermino = fechaDeTerminoDeVacaciones.getDate();
        mesTermino = fechaDeTerminoDeVacaciones.getMonth();
        anioTermino = fechaDeTerminoDeVacaciones.getFullYear();
        var mensajeConfirmacion = `Se envio la solicitud de vacaciones del ${fechaVacaciones.getDate()}/${fechaVacaciones.getMonth() + 1}/${fechaVacaciones.getFullYear()} al ${diaTermino}/${mesTermino + 1}/${anioTermino}`;
        console.log(mensajeConfirmacion);

        return mensajeConfirmacion;
    }
}

module.exports.SolicitarVacacionesPath = SolicitarVacacionesPath;