// Rutas: conectan cada URL con su funcion del controlador.
// Son los 4 endpoints que pide la practica.
const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

router.post('/login',  authController.login);    // publica
router.get ('/estado', authController.estado);   // publica
router.get ('/perfil', authController.perfil);   // protegida (revisa la sesion en el controlador)
router.post('/logout', authController.logout);   // solo con sesion

module.exports = router;
