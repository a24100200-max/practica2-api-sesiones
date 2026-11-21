// ============================================================
//  Practica 2 - Frontend de la API con sesiones
//  Prueba los 4 endpoints: /login, /perfil, /estado y /logout
// ============================================================

const bloqueLogin  = document.getElementById('bloqueLogin');
const bloqueSesion = document.getElementById('bloqueSesion');
const bloqueEstado = document.getElementById('bloqueEstado');
const formLogin    = document.getElementById('formLogin');
const inputCorreo  = document.getElementById('correo');
const inputPass    = document.getElementById('password');
const mensajeLogin = document.getElementById('mensajeLogin');
const saludo       = document.getElementById('saludo');
const datosPerfil  = document.getElementById('datosPerfil');
const cajaEstado   = document.getElementById('estado');

// ------------------------------------------------------------
//  Mensajes del formulario de acceso
// ------------------------------------------------------------
function mostrarError(texto) {
    mensajeLogin.textContent = texto;
    mensajeLogin.className = 'mensaje mensaje-error';
}

function limpiarError() {
    mensajeLogin.textContent = '';
    mensajeLogin.className = 'mensaje oculto';
}

// ------------------------------------------------------------
//  POST /login
// ------------------------------------------------------------
formLogin.addEventListener('submit', async function (evento) {
    evento.preventDefault();      // no recargamos la pagina
    limpiarError();

    const correo   = inputCorreo.value.trim();
    const password = inputPass.value;

    // Validacion en el cliente (el servidor la vuelve a hacer)
    if (!correo || !password) {
        mostrarError('El correo y la contrasena son obligatorios');
        return;
    }

    try {
        const respuesta = await fetch('/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ correo, password })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.ok) {
            mostrarError(datos.mensaje || 'No se pudo iniciar sesion');
            return;
        }

        inputPass.value = '';
        await consultarEstado();

    } catch (error) {
        console.error(error);
        mostrarError('Error de conexion con el servidor');
    }
});

// ------------------------------------------------------------
//  GET /perfil   (ruta protegida)
//  Consulta de datos del usuario que tiene la sesion abierta.
// ------------------------------------------------------------
document.getElementById('btnPerfil').addEventListener('click', async function () {
    try {
        const respuesta = await fetch('/perfil');
        const datos     = await respuesta.json();

        // 401 = la sesion vencio o se cerro
        if (!respuesta.ok || !datos.ok) {
            datosPerfil.classList.add('oculto');
            await consultarEstado();
            return;
        }

        document.getElementById('perfilId').textContent     = datos.usuario.id;
        document.getElementById('perfilNombre').textContent = datos.usuario.nombre;
        document.getElementById('perfilCorreo').textContent = datos.usuario.correo;
        document.getElementById('perfilFecha').textContent  =
            new Date(datos.usuario.fecha_registro).toLocaleString('es-MX');

        datosPerfil.classList.remove('oculto');

    } catch (error) {
        console.error(error);
    }
});

// ------------------------------------------------------------
//  POST /logout
// ------------------------------------------------------------
document.getElementById('btnLogout').addEventListener('click', async function () {
    try {
        await fetch('/logout', { method: 'POST' });
    } catch (error) {
        console.error(error);
    }

    datosPerfil.classList.add('oculto');
    await consultarEstado();
});

// ------------------------------------------------------------
//  GET /estado  -  decide que se ve en pantalla
// ------------------------------------------------------------
document.getElementById('btnEstado').addEventListener('click', consultarEstado);

async function consultarEstado() {
    try {
        const respuesta = await fetch('/estado');
        const datos     = await respuesta.json();

        if (datos.autenticado) {
            cajaEstado.textContent =
                `Sesion activa de ${datos.usuario.nombre} (${datos.usuario.correo}). ` +
                `Vence en ${datos.sesion.minutosRestantes} minutos.`;
            cajaEstado.className = 'estado estado-activa';

            saludo.textContent = `Hola, ${datos.usuario.nombre}. Tu id de usuario es ${datos.usuario.id}.`;
            bloqueLogin.classList.add('oculto');
            bloqueSesion.classList.remove('oculto');
            bloqueEstado.classList.remove('oculto');
        } else {
            cajaEstado.textContent = 'No hay una sesion activa.';
            cajaEstado.className = 'estado estado-inactiva';

            datosPerfil.classList.add('oculto');
            bloqueLogin.classList.remove('oculto');
            bloqueSesion.classList.add('oculto');
            bloqueEstado.classList.add('oculto');
        }

        return datos.autenticado;

    } catch (error) {
        console.error(error);
        cajaEstado.textContent = 'No se pudo conectar con el servidor.';
        cajaEstado.className = 'estado estado-inactiva';
        return false;
    }
}

// ------------------------------------------------------------
//  Arranque: preguntamos si ya habia una sesion abierta
// ------------------------------------------------------------
consultarEstado();
