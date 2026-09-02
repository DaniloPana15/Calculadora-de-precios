let correoSeleccionado = 'CA';
let modoActual = 'logistica';

const CATEGORIAS_MELI = [
    { id: 'general', nombre: 'General / Estándar', clasica: 0.14, premium: 0.29, envioBase: 6500 },
    { id: 'belleza', nombre: 'Belleza y Cuidado Personal', clasica: 0.14, premium: 0.29, envioBase: 5800 },
    { id: 'barberia', nombre: 'Barbería y Peluquería Pro', clasica: 0.13, premium: 0.28, envioBase: 6200 },
    { id: 'pelucas', nombre: 'Pelucas y Extensiones de Cabello', clasica: 0.14, premium: 0.29, envioBase: 5500 },
    { id: 'herramientas', nombre: 'Herramientas y Construcción', clasica: 0.13, premium: 0.28, envioBase: 7800 },
    { id: 'electronica', nombre: 'Electrónica, Audio y Video', clasica: 0.12, premium: 0.27, envioBase: 7200 },
    { id: 'celulares', nombre: 'Celulares y Telefonía', clasica: 0.10, premium: 0.25, envioBase: 6000 },
    { id: 'computacion', nombre: 'Computación y Laptops', clasica: 0.11, premium: 0.26, envioBase: 8500 },
    { id: 'ropa', nombre: 'Ropa, Calzado y Accesorios', clasica: 0.15, premium: 0.30, envioBase: 5800 },
    { id: 'hogar', nombre: 'Hogar, Muebles y Jardín', clasica: 0.135, premium: 0.285, envioBase: 9200 },
    { id: 'deportes', nombre: 'Deportes y Fitness', clasica: 0.14, premium: 0.29, envioBase: 7000 },
    { id: 'juguetes', nombre: 'Juegos y Juguetes', clasica: 0.14, premium: 0.29, envioBase: 6400 },
    { id: 'vehiculos_acc', nombre: 'Accesorios para Vehículos', clasica: 0.145, premium: 0.295, envioBase: 7500 },
    { id: 'salud', nombre: 'Salud y Equipamiento Médico', clasica: 0.13, premium: 0.28, envioBase: 6100 },
    { id: 'alimentos', nombre: 'Alimentos y Bebidas', clasica: 0.12, premium: 0.27, envioBase: 5900 }
];

let comisionMeliClasica = 0.14;
let comisionMeliPremium = 0.29;

function cargarCategoriasMeli() {
    const selectCat = document.getElementById('categoriaMeli');
    if (!selectCat) return;

    selectCat.innerHTML = '';
    CATEGORIAS_MELI.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.innerText = cat.nombre;
        selectCat.appendChild(option);
    });

    obtenerComisionesMeli();
}

function obtenerComisionesMeli() {
    const selectCat = document.getElementById('categoriaMeli');
    if (!selectCat) return;

    const catId = selectCat.value || 'general';
    const categoriaEncontrada = CATEGORIAS_MELI.find(cat => cat.id === catId);

    if (categoriaEncontrada) {
        comisionMeliClasica = categoriaEncontrada.clasica;
        comisionMeliPremium = categoriaEncontrada.premium;

        const displayEnvio = document.getElementById('displayCostoEnvio');
        if (displayEnvio) {
            displayEnvio.innerText = '$' + categoriaEncontrada.envioBase.toLocaleString('es-AR');
        }
    }

    actualizarComisionMeliDisplay();
}

function actualizarComisionMeliDisplay() {
    const tipoPub = document.getElementById('tipoPublicacion').value;
    const inputPct = document.getElementById('porcentajeComisionMeli');
    
    let porcentajeAplicado = (tipoPub === 'clasica') ? comisionMeliClasica : comisionMeliPremium;
    
    if (inputPct) {
        inputPct.innerText = (porcentajeAplicado * 100).toFixed(1) + "%";
    }

    calcular();
}

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

    let rowAds = document.getElementById('row-ads');
    let rowImpuestos = document.getElementById('row-impuestos');
    let rowGananciaOrganica = document.getElementById('row-ganancia-organica');

    if (costoProd <= 0) {
        document.getElementById('precioPublicado').innerText = "$0";
        document.getElementById('gananciaNeta').innerText = "$0";
        document.getElementById('gananciaOrganica').innerText = "$0";
        document.getElementById('comisionCobrada').innerText = "$0";
        document.getElementById('montoAds').innerText = "$0";
        document.getElementById('montoImpuestos').innerText = "$0";
        document.getElementById('porcentajeReal').innerText = "0%";
        badge.style.display = "none";
        return;
    }

    let gananciaObjetivo = costoProd * (margen / 100);
    let precioFinal = 0;
    let comisionMonto = 0;
    let costoEnvioFinal = 0;
    let montoAds = 0;
    let montoImpuestos = 0;
    let gananciaLimpiaAds = 0;
    let gananciaLimpiaOrganica = 0;

    if (modoActual === 'logistica') {
        rowAds.style.display = 'none';
        rowImpuestos.style.display = 'none';
        rowGananciaOrganica.style.display = 'none';

        costoEnvioFinal = obtenerNumero('costoEnvio');
        let tipoEnvio = document.getElementById('tipoEnvio').value;
        let subtotalNecesario = costoProd + gananciaObjetivo + costoEnvioFinal;
        
        let tasaComision = 0;
        if (tipoEnvio === 'cr') {
            tasaComision = (correoSeleccionado === 'CA') ? 0.05 : 0.04;
        }

        precioFinal = Math.ceil(subtotalNecesario / (1 - tasaComision));
        comisionMonto = Math.round((precioFinal * tasaComision) * 100) / 100;
        
        gananciaLimpiaAds = precioFinal - comisionMonto - costoEnvioFinal - costoProd;

    } else {
        rowAds.style.display = 'flex';
        rowImpuestos.style.display = 'flex';
        rowGananciaOrganica.style.display = 'flex';

        let tipoPub = document.getElementById('tipoPublicacion').value;
        let rep = document.getElementById('reputacionMeli').value;
        
        const selectCat = document.getElementById('categoriaMeli');
        const catId = selectCat ? selectCat.value : 'general';
        const categoriaEncontrada = CATEGORIAS_MELI.find(cat => cat.id === catId);
        let baseEnvioMeli = categoriaEncontrada ? categoriaEncontrada.envioBase : 6500;
        let costoFijoUnidad = 1500;

        let pctAds = obtenerNumero('porcentajeAds') / 100;
        let pctImpuestos = obtenerNumero('porcentajeImpuestos') / 100;

        let pctMeli = (tipoPub === 'clasica') ? comisionMeliClasica : comisionMeliPremium;

        const txtPorcentaje = document.getElementById('porcentajeComisionMeli');
        if (txtPorcentaje) {
            txtPorcentaje.innerText = (pctMeli * 100).toFixed(1) + "%";
        }

        let descEnvio = (rep === 'verde') ? 0.50 : (rep === 'amarillo') ? 0.40 : 0;
        costoEnvioFinal = baseEnvioMeli * (1 - descEnvio);

        let tasaTotalCargas = pctMeli + pctAds + pctImpuestos;

        if (tasaTotalCargas >= 1) {
            alert("La suma de comisiones, publicidad e impuestos no puede ser igual o mayor al 100%");
            return;
        }

        let subtotalFijo = costoProd + gananciaObjetivo + costoEnvioFinal + costoFijoUnidad;
        precioFinal = Math.ceil(subtotalFijo / (1 - tasaTotalCargas));

        comisionMonto = Math.round(precioFinal * pctMeli);
        montoAds = Math.round(precioFinal * pctAds);
        montoImpuestos = Math.round(precioFinal * pctImpuestos);

        gananciaLimpiaAds = precioFinal - comisionMonto - costoFijoUnidad - costoEnvioFinal - montoImpuestos - montoAds - costoProd;
        gananciaLimpiaOrganica = gananciaLimpiaAds + montoAds;
    }

    let rentabilidadEfectiva = ((gananciaLimpiaAds / costoProd) * 100).toFixed(1);

    document.getElementById('precioPublicado').innerText = "$" + precioFinal.toLocaleString('es-AR');
    document.getElementById('gananciaNeta').innerText = "$" + Math.round(gananciaLimpiaAds).toLocaleString('es-AR');
    document.getElementById('gananciaOrganica').innerText = "$" + Math.round(gananciaLimpiaOrganica).toLocaleString('es-AR');
    document.getElementById('comisionCobrada').innerText = "$" + comisionMonto.toLocaleString('es-AR');
    document.getElementById('montoAds').innerText = "$" + montoAds.toLocaleString('es-AR');
    document.getElementById('montoImpuestos').innerText = "$" + montoImpuestos.toLocaleString('es-AR');
    document.getElementById('porcentajeReal').innerText = rentabilidadEfectiva + "% ";

    badge.style.display = "inline-block";
    if (rentabilidadEfectiva < 25) {
        badge.innerText = "Riesgo";
        badge.className = "badge-status status-low";
    } else if (rentabilidadEfectiva <= 60) {
        badge.innerText = "Saludable";
        badge.className = "badge-status status-good";
    } else {
        badge.innerText = "Excelente";
        badge.className = "badge-status status-great";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasMeli();
    calcularCostoFlete();

    const btnProbar = document.querySelector('.btn-hero-probar');
    const calculadoraSeccion = document.getElementById('calculadora');

    if (btnProbar && calculadoraSeccion) {
        btnProbar.addEventListener('click', (e) => {
            e.preventDefault();
            btnProbar.classList.add('slide-bottom');

            setTimeout(() => {
                calculadoraSeccion.scrollIntoView({
                    behavior: 'smooth'
                });
            }, 400);
        });
    }
});
