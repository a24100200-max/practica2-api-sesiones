// Controlador: recibe la peticion, valida, usa el modelo y responde en JSON.
// Aqui vive la logica de los 4 endpoints: login, logout, perfil y estado.
const usuarioModel = require('../models/UsuarioModel');

// ------------------------------------------------------------
//  POST /login
//  Recibe correo y password, los compara contra la tabla usuarios
//  y, si coinciden, guarda al usuario en la sesion.
// ------------------------------------------------------------
async function login(req, res) {
    try {
        const correo   = (req.body.correo   || '').trim();
        const password = (req.body.password || '').trim();

        // 1) Validacion: ningun campo puede ir vacio
        const errores = [];
        if (!correo)   errores.push('El correo es obligatorio');
        if (!password) errores.push('La contrasena es obligatoria');

        if (errores.length > 0) {
            return res.status(400).json({ ok: false, mensaje: errores.join('. '), errores });
        }

        // 2) Buscamos el usuario en la base de datos por su correo
        const registro = await usuarioModel.buscarPorCorreo(correo);

        // 3) Se responde el MISMO mensaje si no existe el correo o si la
        //    contrasena esta mal: asi nadie puede averiguar que correos existen.
        if (!registro || registro.password !== password) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
        }

        // 4) Guardamos en la sesion solo lo necesario. NUNCA el password.
        req.session.usuario = {
            id:     registro.id,
            nombre: registro.nombre,
            correo: registro.correo
        };

        res.json({
            ok: true,
            mensaje: 'Inicio de sesion exitoso',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesion' });
    }
}

// ------------------------------------------------------------
//  GET /perfil   (ruta protegida)
//  Consulta de datos: vuelve a leer al usuario de la BD usando
//  el id que quedo guardado en la sesion.
// ------------------------------------------------------------
async function perfil(req, res) {
    try {
        // Ruta protegida: si no hay sesion iniciada, no dejamos pasar
        if (!req.session.usuario) {
            return res.status(401).json({ ok: false, mensaje: 'Debes iniciar sesion' });
        }

        const usuario = await usuarioModel.obtenerPorId(req.session.usuario.id);

        // Pudieron borrar al usuario de la BD con la sesion todavia abierta
        if (!usuario) {
            return res.status(404).json({ ok: false, mensaje: 'El usuario ya no existe' });
        }

        res.json({
            ok: true,
            mensaje: 'Perfil de usuario',
            usuario
        });

    } catch (error) {
        console.error('Error al consultar el perfil:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al consultar el perfil' });
    }
}

// ------------------------------------------------------------
//  GET /estado
//  Dice si hay sesion abierta y cuanto le falta para vencer.
//  Es publica: contesta 200 tanto si hay sesion como si no.
// ------------------------------------------------------------
function estado(req, res) {
    const autenticado = Boolean(req.session.usuario);

    if (!autenticado) {
        return res.json({
            ok: true,
            autenticado: false,
            mensaje: 'No hay una sesion activa'
        });
    }

    // req.session.cookie.maxAge se va descontando solo conforme pasa el tiempo
    const minutosRestantes = Math.max(0, Math.round(req.session.cookie.maxAge / 60000));

    res.json({
        ok: true,
        autenticado: true,
        mensaje: 'Hay una sesion activa',
        usuario: req.session.usuario,
        sesion: {
            id: req.sessionID,
            minutosRestantes
        }
    });
}

// ------------------------------------------------------------
//  POST /logout
//  Destruye la sesion en el servidor y borra la cookie del navegador.
// ------------------------------------------------------------
function logout(req, res) {
    if (!req.session.usuario) {
        return res.status(401).json({ ok: false, mensaje: 'No hay una sesion activa' });
    }

    const nombre = req.session.usuario.nombre;

    req.session.destroy(function (error) {
        if (error) {
            console.error('Error al cerrar la sesion:', error);
            return res.status(500).json({ ok: false, mensaje: 'No se pudo cerrar la sesion' });
        }

        // Hay que borrar la cookie con el MISMO nombre y las MISMAS opciones
        // con las que se creo en app.js, si no el navegador se la queda.
        res.clearCookie('session.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });

        res.json({ ok: true, mensaje: `Sesion cerrada correctamente. Hasta luego, ${nombre}` });
    });
}

module.exports = {
    login,
    perfil,
    estado,
    logout
};
