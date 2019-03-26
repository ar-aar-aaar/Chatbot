const { userService } = require('../services/users.js');

class ContactPath {
    static async contactPath(results, turnContext) {
        var nombre = '';
        var apellido = '';
        try {
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
                await turnContext.sendActivity(`Nombre: ${usuarios[0].name} ${usuarios[0].lastName}`);
                await turnContext.sendActivity(`Telefono: ${usuarios[0].phone}`);
                await turnContext.sendActivity(`E-mail: ${usuarios[0].email}`);
                await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
                return false;
            } else {
                await turnContext.sendActivity('Hay muchos usuarios con ese nombre, a cual te refieres?');
                usuarios.forEach((usuario) => {
                    turnContext.sendActivity(`${usuario.name} ${usuario.lastName}`);
                })
                return true;
            }
        } else {
            await turnContext.sendActivity("No hay usuarios con ese nombre, lo lamento");
            await turnContext.sendActivity('Te puedo ayudar en otra cosa?');
            return false;
        }
    }
}

module.exports.ContactPath = ContactPath;