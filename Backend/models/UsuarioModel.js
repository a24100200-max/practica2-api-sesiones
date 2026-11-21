// Modelo: todo lo que tiene que ver con la tabla "usuarios"
// Es el unico archivo que escribe SQL.
const db = require('../config/database');

// Busca un usuario por su correo. Se usa en el login.
// Trae tambien el password porque el controlador tiene que compararlo.
async function buscarPorCorreo(correo) {
    const sql = 'SELECT id, nombre, correo, password FROM usuarios WHERE correo = ?';
    const [filas] = await db.execute(sql, [correo]);
    return filas[0] || null;
}

// Trae los datos del usuario por su id. Se usa en /perfil.
// OJO: aqui NO se selecciona el password, para que nunca salga en la respuesta.
async function obtenerPorId(id) {
    const sql = 'SELECT id, nombre, correo, fecha_registro FROM usuarios WHERE id = ?';
    const [filas] = await db.execute(sql, [id]);
    return filas[0] || null;
}

module.exports = {
    buscarPorCorreo,
    obtenerPorId
};
