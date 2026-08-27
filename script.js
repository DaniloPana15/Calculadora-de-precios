let correoSeleccionado = 'CA';

function actualizarReglasCR() {
    let tipoEnvio = document.getElementById('tipoEnvio').value;
    let selectModalidad = document.getElementById('modalidadEnvio');

    if (tipoEnvio === 'cr') {
        selectModalidad.value = 'sucursal';
        selectModalidad.disabled = true;
    } else {
        selectModalidad.disabled = false;
    }

    calcularCostoFlete();
}

const TARIFAS = {
    CA: {
        regional: { sucursal: { 1: 14500, 5: 18000, 10: 24000 }, domicilio: { 1: 18400, 5: 21800, 10: 29300 } },
        nacional: { sucursal: { 1: 19500, 5: 24000, 10: 33000 }, domicilio: { 1: 24900, 5: 30200, 10: 42600 } }
    },
    ANDREANI: {
        regional: { sucursal: { 1: 11000, 5: 14500, 10: 19000 }, domicilio: { 1: 13000, 5: 17000, 10: 23000 } },
        nacional: { sucursal: { 1: 14000, 5: 18500, 10: 24000 }, domicilio: { 1: 16500, 5: 22000, 10: 28500 } }
    }
};

function seleccionarCorreo(correo) {
    correoSeleccionado = correo;
    document.getElementById('btn-ca').classList.toggle('active', correo === 'CA');
    document.getElementById('btn-andreani').classList.toggle('active', correo === 'ANDREANI');
    
    let selectTipo = document.getElementById('tipoEnvio');
    let opcionCR = selectTipo.querySelector('option[value="cr"]');

    if (correo === 'ANDREANI') {
        if (selectTipo.value === 'cr') selectTipo.value = 'estandar';
        opcionCR.disabled = true;
        opcionCR.innerText = "Contra Reembolso (No disponible en Andreani)";
        document.getElementById('modalidadEnvio').disabled = false;
    } else {
        opcionCR.disabled = false;
        opcionCR.innerText = "Contra Reembolso (Sucursal Oficial - Cobro en destino)";
    }

    actualizarReglasCR();
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
        if (pesoVol <= 1) {
            selectPeso.value = "1";
        } else if (pesoVol <= 5) {
            selectPeso.value = "5";
        } else {
            selectPeso.value = "10";
        }
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

// Formateo de separador de miles en tiempo real
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
    let costoEnvio = obtenerNumero('costoEnvio');
    let margen = obtenerNumero('margenGanancia');
    let tipoEnvio = document.getElementById('tipoEnvio').value;
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
    let subtotalNecesario = costoProd + gananciaObjetivo + costoEnvio;

    let tasaComision = 0;
    if (tipoEnvio === 'cr' && correoSeleccionado === 'CA') {
        tasaComision = 0.05;
    }

    let precioFinal = Math.ceil(subtotalNecesario / (1 - tasaComision));
    let comisionMonto = Math.round((precioFinal * tasaComision) * 100) / 100;
    let gananciaLimpia = precioFinal - comisionMonto - costoEnvio - costoProd;
    let rentabilidadEfectiva = ((gananciaLimpia / costoProd) * 100).toFixed(1);

    document.getElementById('precioPublicado').innerText = "$" + precioFinal.toLocaleString('es-AR');
    document.getElementById('gananciaNeta').innerText = "$" + Math.round(gananciaLimpia).toLocaleString('es-AR');
    document.getElementById('comisionCobrada').innerText = "$" + comisionMonto.toLocaleString('es-AR');
    document.getElementById('porcentajeReal').innerText = rentabilidadEfectiva + "% ";

    badge.style.display = "inline-block";
    if (margen < 40) {
        badge.innerText = "Riesgo";
        badge.className = "badge-status status-low";
    } else if (margen <= 80) {
        badge.innerText = "Saludable";
        badge.className = "badge-status status-good";
    } else {
        badge.innerText = "Excelente";
        badge.className = "badge-status status-great";
    }
}

// Inicialización automática al cargar
document.addEventListener('DOMContentLoaded', () => {
    calcularCostoFlete();
});
