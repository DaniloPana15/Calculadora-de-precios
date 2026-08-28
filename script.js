let correoSeleccionado = 'CA';
let modoActual = 'logistica';

const TARIFAS = {
    CA: {
        regional: { sucursal: { 1: 14500, 5: 18000, 10: 24000 }, domicilio: { 1: 18400, 5: 21800, 10: 29300 } },
        nacional: { sucursal: { 1: 19500, 5: 24000, 10: 33000 }, domicilio: { 1: 24900, 5: 30200, 10: 42600 } }
    },
    ANDREANI: {
        regional: { sucursal: { 1: 11000, 5: 14500, 10: 19000 }, domicilio: { 1: 13000, 5: 17000, 10: 23000 } },
        nacional: { sucursal: { 1: 14000, 5: 18500, 10: 24000 }, domicilio: { 1: 16500, 5: 22000, 10: 28500 } }
    },
    OCA: {
        regional: { sucursal: { 1: 12500, 5: 16000, 10: 21000 }, domicilio: { 1: 15000, 5: 19000, 10: 25000 } },
        nacional: { sucursal: { 1: 16000, 5: 21000, 10: 28000 }, domicilio: { 1: 19800, 5: 26000, 10: 35000 } }
    }
};

function cambiarModo(modo) {
    modoActual = modo;
    document.getElementById('tab-logistica').classList.toggle('active', modo === 'logistica');
    document.getElementById('tab-meli').classList.toggle('active', modo === 'meli');
    
    document.getElementById('panel-logistica').style.display = (modo === 'logistica') ? 'block' : 'none';
    document.getElementById('panel-meli').style.display = (modo === 'meli') ? 'block' : 'none';
    
    document.getElementById('titulo-seccion').innerText = (modo === 'logistica') ? 'Armado de Precios Directo' : 'Armado de Precios Mercado Libre';
    calcular();
}

function seleccionarCorreo(correo) {
    correoSeleccionado = correo;
    document.getElementById('btn-ca').classList.toggle('active', correo === 'CA');
    document.getElementById('btn-andreani').classList.toggle('active', correo === 'ANDREANI');
    document.getElementById('btn-oca').classList.toggle('active', correo === 'OCA');
    
    let selectTipo = document.getElementById('tipoEnvio');
    let opcionCR = selectTipo.querySelector('option[value="cr"]');

    if (correo === 'ANDREANI') {
        if (selectTipo.value === 'cr') selectTipo.value = 'estandar';
        opcionCR.disabled = true;
        opcionCR.innerText = "Contra Reembolso (No disponible)";
    } else {
        opcionCR.disabled = false;
        opcionCR.innerText = "Contra Reembolso (Sucursal Oficial)";
    }

    actualizarReglasCR();
}

function actualizarReglasCR() {
    let tipoEnvio = document.getElementById('tipoEnvio').value;
    let selectModalidad = document.getElementById('modalidadEnvio');

    if (tipoEnvio === 'cr' && correoSeleccionado === 'CA') {
        selectModalidad.value = 'sucursal';
        selectModalidad.disabled = true;
    } else {
        selectModalidad.disabled = false;
    }

    calcularCostoFlete();
}

function calcularVolumetrico() {
    let ancho = parseFloat(document.getElementById('ancho').value) || 0;
    let alto = parseFloat(document.getElementById('alto').value) || 0;
    let largo = parseFloat(document.getElementById('largo').value) || 0;
    let txtVol = document.getElementById('txtVolumetrico');

    if (ancho > 0 && alto > 0 && largo > 0) {
        let pesoVol = (ancho * alto * largo) / 6000;
        txtVol.innerText = "Volumétrico: " + pesoVol.toFixed(2) + " kg";
        let selectPeso = document.getElementById('pesoPaquete');
        if (pesoVol <= 1) selectPeso.value = "1";
        else if (pesoVol <= 5) selectPeso.value = "5";
        else selectPeso.value = "10";
    } else {
        txtVol.innerText = "";
    }
    calcularCostoFlete();
}

function calcularCostoFlete() {
    let peso = document.getElementById('pesoPaquete').value;
    let inputEnvio = document.getElementById('costoEnvio');
    let zona = document.getElementById('zonaEnvio').value;
    let modalidad = document.getElementById('modalidadEnvio').value;

    if (peso === 'manual') {
        inputEnvio.disabled = false;
        calcular();
        return;
    }

    inputEnvio.disabled = true;
    let tarifaCalculada = TARIFAS[correoSeleccionado][zona][modalidad][peso];
    if (tarifaCalculada) {
        inputEnvio.value = tarifaCalculada.toLocaleString('es-AR');
    }
    calcular();
}

function usarMargenRecomendado() {
    document.getElementById('margenGanancia').value = '70';
    calcular();
}

function formatearEntrada(input) {
    let valorLimpio = input.value.replace(/\D/g, '');
    if (valorLimpio) {
        input.value = parseInt(valorLimpio, 10).toLocaleString('es-AR');
    } else {
        input.value = '';
    }
    calcular();
}

function obtenerNumero(id) {
    let input = document.getElementById(id);
    if (!input || !input.value) return 0;
    let val = input.value.replace(/\D/g, '');
    return val ? parseFloat(val) : 0;
}

function calcular() {
    let costoProd = obtenerNumero('costoProducto');
    let margen = obtenerNumero('margenGanancia');
    let badge = document.getElementById('badgeEstado');

    if (costoProd <= 0) {
        document.getElementById('precioPublicado').innerText = "$0";
        document.getElementById('gananciaNeta').innerText = "$0";
        document.getElementById('comisionCobrada').innerText = "$0";
        document.getElementById('porcentajeReal').innerText = "0%";
        badge.style.display = "none";
        return;
    }

    let gananciaObjetivo = costoProd * (margen / 100);
    let precioFinal = 0;
    let comisionMonto = 0;
    let costoEnvioFinal = 0;

    if (modoActual === 'logistica') {
        costoEnvioFinal = obtenerNumero('costoEnvio');
        let tipoEnvio = document.getElementById('tipoEnvio').value;
        let subtotalNecesario = costoProd + gananciaObjetivo + costoEnvioFinal;
        
        let tasaComision = 0;
        if (tipoEnvio === 'cr') {
            tasaComision = (correoSeleccionado === 'CA') ? 0.05 : 0.04;
        }

        precioFinal = Math.ceil(subtotalNecesario / (1 - tasaComision));
        comisionMonto = Math.round((precioFinal * tasaComision) * 100) / 100;

    } else {
        // MODO MERCADO LIBRE
        let tipoPub = document.getElementById('tipoPublicacion').value;
        let rep = document.getElementById('reputacionMeli').value;
        let baseEnvioMeli = obtenerNumero('costoEnvioMeli');

        let descEnvio = (rep === 'verde') ? 0.50 : (rep === 'amarillo') ? 0.40 : 0;
        costoEnvioFinal = baseEnvioMeli * (1 - descEnvio);

        let tasaMeli = (tipoPub === 'clasica') ? 0.14 : 0.29;
        let subtotal = costoProd + gananciaObjetivo + costoEnvioFinal;

        precioFinal = Math.ceil(subtotal / (1 - tasaMeli));
        comisionMonto = Math.round((precioFinal * tasaMeli) * 100) / 100;
    }

    let gananciaLimpia = precioFinal - comisionMonto - costoEnvioFinal - costoProd;
    let rentabilidadEfectiva = ((gananciaLimpia / costoProd) * 100).toFixed(1);

    document.getElementById('precioPublicado').innerText = "$" + precioFinal.toLocaleString('es-AR');
    document.getElementById('gananciaNeta').innerText = "$" + Math.round(gananciaLimpia).toLocaleString('es-AR');
    document.getElementById('comisionCobrada').innerText = "$" + comisionMonto.toLocaleString('es-AR');
    document.getElementById('porcentajeReal').innerText = rentabilidadEfectiva + "% ";

    // RANGOS Y BORDER NEÓN
    badge.style.display = "inline-block";
    if (margen < 40) {
        badge.innerText = "Riesgo";
        badge.className = "badge-status status-low"; // Rojo Neón
    } else if (margen <= 80) {
        badge.innerText = "Saludable";
        badge.className = "badge-status status-good"; // Verde Neón
    } else {
        badge.innerText = "Excelente";
        badge.className = "badge-status status-great"; // Azul Neón
    }
}

document.addEventListener('DOMContentLoaded', () => {
    calcularCostoFlete();
});

// Manejo de la animación y desplazamiento del botón "Probar ahora"
document.addEventListener('DOMContentLoaded', () => {
    const btnProbar = document.querySelector('.btn-hero-probar');
    const calculadoraSeccion = document.getElementById('calculadora');

    if (btnProbar && calculadoraSeccion) {
        btnProbar.addEventListener('click', (e) => {
            // Prevenir el comportamiento por defecto del enlace
            e.preventDefault();

            // Añadir la clase de animación
            btnProbar.classList.add('slide-bottom');

            // Esperar a que termine la animación (400ms) antes de desplazarse
            setTimeout(() => {
                calculadoraSeccion.scrollIntoView({
                    behavior: 'smooth'
                });

                // Opcional: quitar la clase después de la animación para que pueda volver a usarse si se sube
                // setTimeout(() => btnProbar.classList.remove('slide-bottom'), 100);
            }, 400); // 400ms coincide con la duración de la animación (0.4s)
        });
    }
});

