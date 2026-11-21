// Servidor principal - Practica 2: API con sesiones
const express = require('express');
const session = require('express-session');   // maneja las sesiones
const path    = require('path');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// Para poder leer el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
//  Configuracion de la sesion
//  Crea una cookie firmada en el navegador y guarda los datos
//  del usuario en el servidor mientras la sesion este abierta.
// ------------------------------------------------------------
app.use(session({
    name:   'session.sid',                   // nombre de la cookie en el navegador
    secret: process.env.SESSION_SECRET,      // llave con la que se firma la cookie
    resave: false,                           // no reescribe la sesion si no cambio
    saveUninitialized: false,                // no guarda sesiones vacias
    cookie: {
        httpOnly: true,            // el JavaScript del navegador NO puede leerla
        secure:   false,           // en produccion (HTTPS) debe ser true
        sameSite: 'lax',           // reduce el riesgo de CSRF
        maxAge:   1000 * 60 * 30   // la sesion dura 30 minutos
    }
}));

// Servimos el Frontend como archivos estaticos
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Los 4 endpoints de la practica
app.use(authRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, function () {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});
