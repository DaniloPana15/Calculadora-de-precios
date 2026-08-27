function seleccionarCorreo(correo) {
    correoSeleccionado = correo;
    document.getElementById('btn-ca').classList.toggle('active', correo === 'CA');
    document.getElementById('btn-andreani').classList.toggle('active', correo === 'ANDREANI');
    
    let selectTipo = document.getElementById('tipoEnvio');
    let opcionCR = selectTipo.querySelector('option[value="cr"]');

    if (correo === 'ANDREANI') {
        // Andreani no realiza cobro de producto en destino (Contra Reembolso)
        if (selectTipo.value === 'cr') selectTipo.value = 'estandar';
        opcionCR.disabled = true;
        opcionCR.innerText = "Contra Reembolso (No disponible en Andreani)";
    } else {
        // Correo Argentino sí ofrece servicio de Contra Reembolso
        opcionCR.disabled = false;
        opcionCR.innerText = "Contra Reembolso (Cobro de producto en destino)";
    }

    calcularVolumetrico();
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

    // Solo Correo Argentino descuenta comisión por gestión de Contra Reembolso / Giro
    let tasaComision = 0;
    if (tipoEnvio === 'cr' && correoSeleccionado === 'CA') {
        tasaComision = 0.05; // 5% de tasa por servicio de reembolso
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
