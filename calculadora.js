let salarioDiarioResultado = 0;

function calcularFormulario() {
    const modal = document.getElementById('miFormulario4');
    modal.style.display = 'flex';
    document.getElementById("DDA").value = `RD$ 0.00`;

    calcularSalarioDiarioEmpleado();
    calcularAntiguedadCompleta();
    CalcularBonificacion();
    SalarioMensualTSS();
    calcularISR();
    calcularInfotep();
    //calcularMontoImponible();
    calcularDescuentoTotal();
    calcularIngresoTotal();
    calcularMontoImponible()
}

function formatearNumero(valor) {
    const numero = parseFloat(valor) || 0;
    
    const partes = numero.toFixed(2).split('.');
    parteEntera = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `RD$ ${parteEntera}.${partes[1]}`;
}

function limpiarFormulario() {
    const modal = document.getElementById('miFormulario4');
    modal.style.display = 'none';

    document.getElementById("miFormulario").reset();
    document.getElementById("miFormulario2").reset();
    document.getElementById("miFormulario3").reset();
}

function calcularSalarioDiarioEmpleado() {
    const operacion = parseFloat(document.getElementById("IngresoSalario").value) || 0;
    salarioDiarioResultado = operacion / 23.83;
    document.getElementById("salarioDiario").value = formatearNumero(salarioDiarioResultado);
    return salarioDiarioResultado;  
}

function calcularAntiguedadCompleta() {
    const fechaIngresoInput = document.getElementById('FechaIngreso');
    const anoBonificacionSelect = document.getElementById("AñoOption");
    const resultadoInput = document.getElementById("time_age");
    
    if (!fechaIngresoInput || !fechaIngresoInput.value) {
        alert("Por favor selecciona una fecha de ingreso");
        return { años: 0, meses: 0, dias: 0 };
    }

    const fechaIngreso = new Date(fechaIngresoInput.value);
    const anoBonificacion = anoBonificacionSelect.value;
    
    let fechaComparacion;

    if (anoBonificacion === "2024") {
        fechaComparacion = new Date(2024, 11, 31); 
    } else {
        fechaComparacion = new Date();
    }

    const diffMs = fechaComparacion - fechaIngreso;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const años = Math.floor(diffDays / 365.25);
    const meses = Math.floor((diffDays % 365.25) / 30.44);
    const dias = Math.floor(diffDays % 30.44);
    
    resultadoInput.value = `${años} años, ${meses} meses y ${dias} días`;
    
    return {
        años,
        meses,
        dias,
        mesesTotales: (años * 12) + meses
    };
}

function CalcularBonificacion() {
    // Obtener elementos del DOM
    const montoBNInput = document.getElementById("MontoBN");
    const diasBonoInput = document.getElementById("DiasBono");
    
    // Validar que existen los elementos
    if (!montoBNInput || !diasBonoInput) {
        alert("Error en el sistema. Elementos no encontrados.");
        return;
    }

    // Calcular salario diario
    const salarioDiario = calcularSalarioDiarioEmpleado();
    if (isNaN(salarioDiario)) {
        alert("Error en el cálculo del salario diario");
        return;
    }

    // Calcular antigüedad
    const antiguedad = calcularAntiguedadCompleta();
    if (!antiguedad) {
        alert("Error al calcular la antigüedad");
        return;
    }

    // Calcular días de bonificación según antigüedad
    let diasBonificacion;
    if (antiguedad.años >= 3) {
        diasBonificacion = 60;
    } else if (antiguedad.años >= 1) {
        diasBonificacion = 45;
    } else {
        const mesesTrabajados = Math.max(1, antiguedad.mesesTotales);
        const bonificacion = (salarioDiario * mesesTrabajados * 45) / 12;
        montoBNInput.value = formatearNumero(bonificacion);
        diasBonoInput.value = "45 días";
        return;
    }
    // Calcular bonificación para mas de 1 año
    const bonificacion = salarioDiario * diasBonificacion;
    montoBNInput.value = formatearNumero(bonificacion);
    diasBonoInput.value = `${diasBonificacion} días`;

    return { bonificacion: bonificacion}
}

function SalarioMensualTSS() {
    const sueldo = parseFloat(document.getElementById("IngresoSalario").value) || 0;
    const descuentoTss =parseFloat(sueldo * 0.0591);

    document.getElementById("DTSM").value = formatearNumero(descuentoTss);

    return{descuentoTss}
}

function calcularISR() {
    const sueldo = parseFloat(document.getElementById("IngresoSalario").value) || 0;
    const bonoEmpleado = CalcularBonificacion();
    const calculoTotal =  ((sueldo * 12) + bonoEmpleado.bonificacion)
    let excedente = calculoTotal - 416220;
    let isr = 0;

    if (calculoTotal > 416220.01) { 
        isr = excedente * 0.15;
    } else if (calculoTotal > 624329.01) { 
        isr = 31216.00 + (excedente * 0.20);
    } else if (calculoTotal > 867123.01) {
        isr = 79776.00 + (excedente * 0.25);
    }

    document.getElementById("ISR").value = formatearNumero(isr);

    return {excedente,isr}
}

function calcularInfotep() {
    const bonoEmpleado = CalcularBonificacion();
    const infotep = 0.005;

    const calculoInfotep = bonoEmpleado.bonificacion * infotep;

    document.getElementById("Infotep").value = formatearNumero(calculoInfotep);

    return {calculoInfotep}
}

function calcularDescuentoTotal() {
    const impuestoISR = calcularISR();
    const descInfotep = calcularInfotep();
    const desTSS = SalarioMensualTSS();

    const descuento_total = (impuestoISR.isr + descInfotep.calculoInfotep) + desTSS.descuentoTss;
    document.getElementById("TD").value = formatearNumero(descuento_total);

    return {descuento_total}
}

function calcularIngresoTotal() {
    const descuentos = calcularDescuentoTotal();
    const bonoEmpleado = CalcularBonificacion();
    const sueldo = parseFloat(document.getElementById("IngresoSalario").value) || 0;

    const total = (sueldo + bonoEmpleado.bonificacion)-descuentos.descuento_total;

    document.getElementById("MNBS").value = formatearNumero(total);
}

function calcularMontoImponible() {
    const bonoEmpleado = CalcularBonificacion(); // { bonificacion }
    const descuentoTss = SalarioMensualTSS();
    const sueldoMensual = parseFloat(document.getElementById("IngresoSalario").value) || 0;

    const montoImponible = (bonoEmpleado.bonificacion + sueldoMensual) - descuentoTss.descuentoTss;

    document.getElementById('MontoImponible').value =  formatearNumero(montoImponible);
    return montoImponible;
}
