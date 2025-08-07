// Mostrar datos generales en la tarjeta
const datosGeneralesCard = document.getElementById("datosGeneralesCard");
function mostrarDatosGeneralesCard() {
  const empleado = localStorage.getItem('dg_empleado') || '';
  const bin = localStorage.getItem('dg_bin') || '';
  const bcv = localStorage.getItem('dg_bcv') || '';
  datosGeneralesCard.innerHTML =
    `<div class='dato-row'><strong>Empleado:</strong> <span>${empleado || '-'}</span></div>`+
    `<div class='dato-row'><strong>BIN:</strong> <span>${bin || '-'} bs</span></div>`+
    `<div class='dato-row'><strong>BCV:</strong> <span>${bcv || '-'} bs</span></div>`;
  datosGeneralesCard.style.display = 'none';
}
mostrarDatosGeneralesCard();

// Alternar tablas
const btnAlternar = document.getElementById('btnAlternar');
const tabla = document.getElementById('tabla');
const tablaClientes = document.getElementById('tablaClientes');
let mostrandoTablaClientes = false;

btnAlternar.addEventListener('click', function() {
  mostrandoTablaClientes = !mostrandoTablaClientes;
  if (mostrandoTablaClientes) {
    tabla.classList.add('table-hide');
    setTimeout(() => {
      tabla.style.display = 'none';
      tablaClientes.style.display = 'table';
      tablaClientes.classList.remove('table-hide');
      btnAlternar.textContent = 'Alternar';
    }, 350);
    tablaClientes.classList.add('table-hide');
    setTimeout(() => {
      tablaClientes.classList.remove('table-hide');
    }, 10);
  } else {
    tablaClientes.classList.add('table-hide');
    setTimeout(() => {
      tablaClientes.style.display = 'none';
      tabla.style.display = 'table';
      tabla.classList.remove('table-hide');
      btnAlternar.textContent = 'Alternar';
    }, 350);
    tabla.classList.add('table-hide');
    setTimeout(() => {
      tabla.classList.remove('table-hide');
    }, 10);
  }
});

// Cargar artículos desde el servidor
async function loadArticulos() {
  try {
    const response = await fetch('/articulos');
    const articulos = await response.json();
    const articulosBody = document.getElementById('articulosBody');
    articulosBody.innerHTML = '';
    articulos.forEach(articulo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${articulo.modelo}</td>
        <td>${articulo.bcv}</td>
        <td>${articulo.dolarBcv}</td>
        <td>${articulo.inicial}</td>
        <td>${articulo.cuotas}</td>
        <td>${articulo.balance}</td>
        <td>${articulo.bin}</td>
        <td>${articulo.weppa}</td>
        <td>
          <button class="btn-seleccionar" title="Seleccionar">
            <span style="font-size:20px;transition:transform 0.2s;">✅</span>
          </button>
          <button class="btn-eliminar" title="Eliminar">
            <span style="font-size:20px;transition:transform 0.2s;">🗑️</span>
          </button>
        </td>
      `;
      // Botón Eliminar con confirmación
      const btnEliminar = row.querySelector('.btn-eliminar');
      btnEliminar.addEventListener('mouseenter', () => {
        btnEliminar.querySelector('span').style.transform = 'scale(1.2) rotate(-10deg)';
      });
      btnEliminar.addEventListener('mouseleave', () => {
        btnEliminar.querySelector('span').style.transform = '';
      });
      btnEliminar.addEventListener('click', async () => {
        if (confirm('¿Seguro que deseas eliminar este artículo?')) {
          try {
            // Verifica que el id exista y sea válido
            if (!articulo._id || !String(articulo._id).match(/^[0-9a-fA-F]{24}$/)) {
              alert('ID de artículo inválido. No se puede eliminar.');
              return;
            }
            const res = await fetch(`/articulos/${articulo._id}`, { method: 'DELETE' });
            if (res.ok) {
              loadArticulos(); // Recarga la tabla para reflejar el cambio
            } else {
              alert('Error al eliminar el artículo');
            }
          } catch (error) {
            alert('Error al eliminar el artículo');
          }
        }
      });
      // Botón Seleccionar (puedes agregar funcionalidad aquí)
      const btnSeleccionar = row.querySelector('.btn-seleccionar');
      btnSeleccionar.addEventListener('mouseenter', () => {
        btnSeleccionar.querySelector('span').style.transform = 'scale(1.2) rotate(10deg)';
      });
      btnSeleccionar.addEventListener('mouseleave', () => {
        btnSeleccionar.querySelector('span').style.transform = '';
      });
      btnSeleccionar.addEventListener('click', () => {
        // Abrir modal para registrar cliente
        const modalSel = document.getElementById('modalSeleccionarCliente');
        document.getElementById('clienteModeloInput').value = articulo.modelo;
        document.getElementById('clienteInicialInput').value = articulo.inicial;
        document.getElementById('clienteWeppaInput').value = articulo.weppa;
        document.getElementById('clienteCuotasInput').value = articulo.cuotas;
        document.getElementById('clienteFechaInput').value = new Date().toLocaleDateString();
        // Calcular próximo martes
        let hoy = new Date();
        let diaSemana = hoy.getDay();
        let diasHastaMartes = (9 - diaSemana) % 7;
        let proximoMartes = new Date(hoy.getTime() + diasHastaMartes * 24 * 60 * 60 * 1000);
        document.getElementById('clientePagoInput').value = proximoMartes.toLocaleDateString();
        modalSel.style.display = 'flex';
        setTimeout(() => { modalSel.classList.add('show'); }, 10);
        // Guardar el artículo seleccionado para usarlo al insertar
        window.articuloSeleccionado = articulo;
      });
      articulosBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar artículos:', error);
  }
}

// Guardar un artículo en el servidor
async function saveArticulo(articuloData) {
  try {
    // Obtener datos generales
    const binTasa = parseFloat(localStorage.getItem('dg_bin')) || 0;
    const bcvTasa = parseFloat(localStorage.getItem('dg_bcv')) || 0;
    const empleado = localStorage.getItem('dg_empleado') || '';
    // Obtener datos del modal
    const modelo = articuloData.modelo;
    const binInput = parseFloat(articuloData.bin) || 0;
    const weppa = articuloData.weppa;

    // Calcular BCV (bs) y DÓLAR BCV
    const bcv = (binTasa * binInput).toFixed(2);
    let dolarBcv = "0";
    if (bcvTasa) {
      dolarBcv = Math.ceil(bcv / bcvTasa).toString();
    }
    // Calcular balance: weppa * -0.4 + weppa
    let balance = "";
    let weppaNum = parseFloat(weppa) || 0;
    balance = (weppaNum * -0.4 + weppaNum).toFixed(2);
    // Calcular inicial: redondeado a más (dolarBcv * 1.05) - balance
    let inicial = "";
    let dolarBcvNum = parseFloat(dolarBcv) || 0;
    let balanceNum = parseFloat(balance) || 0;
    inicial = Math.ceil((dolarBcvNum * 1.05) - balanceNum).toString();
    // Calcular cuotas: redondear a más balance * 1.35 / 6
    let cuotas = "";
    cuotas = Math.ceil((balanceNum * 1.35) / 6).toString();

    // Construir el objeto para guardar
    const articuloFinal = {
      modelo,
      bcv: Number(bcv),
      dolarBcv: Number(dolarBcv),
      inicial: Number(inicial),
      cuotas: Number(cuotas),
      balance: Number(balance),
      bin: binInput,
      weppa: weppaNum
    };
    const response = await fetch('/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articuloFinal)
    });
    const articulo = await response.json();
    console.log('Artículo guardado:', articulo);
    loadArticulos(); // Recargar la tabla
  } catch (error) {
    console.error('Error al guardar artículo:', error);
  }
}

// Cargar clientes desde el servidor
async function loadClientes() {
  try {
    const response = await fetch('/clientes');
    const clientes = await response.json();
    const clientesBody = document.getElementById('clientesBody');
    clientesBody.innerHTML = '';
    clientes.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.nombre}</td>
        <td>${cliente.modelo}</td>
        <td>${cliente.compra}</td>
        <td>${cliente.inicial}</td>
        <td>${cliente.balance}</td>
        <td>${cliente.pago}</td>
        <td>${cliente.cuota}</td>
        <td>${cliente.weppa}</td>
        <td>${cliente.bin}</td>
        <td>${cliente.bcv}</td>
        <td>
          <button class="btn-eliminar" title="Eliminar" style="color: red;">
            <span style="font-size:20px; transition: transform 0.2s;">🗑️</span>
          </button>
        </td>
      `;
      // Animación y eventos para los botones
      const btnEliminar = row.querySelector('.btn-eliminar');
      btnEliminar.addEventListener('mouseenter', () => {
        btnEliminar.querySelector('span').style.transform = 'scale(1.2) rotate(-10deg)';
      });
      btnEliminar.addEventListener('mouseleave', () => {
        btnEliminar.querySelector('span').style.transform = '';
      });
      btnEliminar.addEventListener('click', async () => {
        if (confirm(`¿Seguro que deseas eliminar el cliente: ${cliente.nombre}?`)) {
          try {
            // Verifica que el id exista y sea válido
            if (!cliente._id || !String(cliente._id).match(/^[0-9a-fA-F]{24}$/)) {
              alert('ID de cliente inválido. No se puede eliminar.');
              return;
            }
            const res = await fetch(`/clientes/${cliente._id}`, { method: 'DELETE' });
            if (res.ok) {
              loadClientes(); // Recarga la tabla para reflejar el cambio
            } else {
              alert('Error al eliminar el cliente');
            }
          } catch (error) {
            alert('Error al eliminar el cliente');
          }
        }
      });
      clientesBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

// Guardar un cliente en el servidor
async function saveCliente(clienteData) {
  try {
    const response = await fetch('/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    });
    const cliente = await response.json();
    console.log('Cliente guardado:', cliente);
    loadClientes(); // Recargar la tabla
  } catch (error) {
    console.error('Error al guardar cliente:', error);
  }
}

// Manejo de modales
// Modal Datos Generales
const modalDatosGenerales = document.getElementById('modalDatosGenerales');
const btnDatos = document.getElementById('btnDatos');
const cancelarDatosGenerales = document.getElementById('cancelarDatosGenerales');
const guardarDatosGenerales = document.getElementById('guardarDatosGenerales');

btnDatos.addEventListener('click', () => {
  // Cargar valores actuales si existen
  document.getElementById('dgEmpleado').value = localStorage.getItem('dg_empleado') || '';
  document.getElementById('dgBin').value = localStorage.getItem('dg_bin') || '';
  document.getElementById('dgBcv').value = localStorage.getItem('dg_bcv') || '';
  modalDatosGenerales.style.display = 'flex';
  setTimeout(() => {
    modalDatosGenerales.classList.add('show');
  }, 10);
});

cancelarDatosGenerales.addEventListener('click', () => {
  modalDatosGenerales.classList.remove('show');
  setTimeout(() => {
    modalDatosGenerales.style.display = 'none';
  }, 350);
});
guardarDatosGenerales.addEventListener('click', async () => {
  const empleado = document.getElementById('dgEmpleado').value.trim();
  const bin = document.getElementById('dgBin').value.trim();
  const bcv = document.getElementById('dgBcv').value.trim();
  if (!empleado || !bin || !bcv) {
    alert('Por favor, complete todos los campos de datos generales.');
    return;
  }
  // Guardar en localStorage
  localStorage.setItem('dg_empleado', empleado);
  localStorage.setItem('dg_bin', bin);
  localStorage.setItem('dg_bcv', bcv);
  mostrarDatosGeneralesCard();

  // Actualizar todos los artículos en la base de datos con los nuevos datos generales
  try {
    const response = await fetch('/articulos');
    const articulos = await response.json();
    for (const articulo of articulos) {
      // Recalcular valores dependientes de los datos generales
      const binTasa = parseFloat(bin) || 0;
      const bcvTasa = parseFloat(bcv) || 0;
      const binInput = parseFloat(articulo.bin) || 0;
      const weppa = articulo.weppa;
      const bcvCalc = (binTasa * binInput).toFixed(2);
      let dolarBcv = "0";
      if (bcvTasa) {
        dolarBcv = Math.ceil(bcvCalc / bcvTasa).toString();
      }
      let balance = (parseFloat(weppa) * -0.4 + parseFloat(weppa)).toFixed(2);
      let inicial = Math.ceil((parseFloat(dolarBcv) * 1.05) - parseFloat(balance)).toString();
      let cuotas = Math.ceil((parseFloat(balance) * 1.35) / 6).toString();
      // Actualizar el artículo en la base de datos
      await fetch(`/articulos/${articulo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: articulo.modelo,
          bin: binInput,
          weppa: weppa,
          bcv: Number(bcvCalc),
          dolarBcv: Number(dolarBcv),
          inicial: Number(inicial),
          cuotas: Number(cuotas),
          balance: Number(balance)
        })
      });
    }
  } catch (error) {
    alert('Error al actualizar artículos con los nuevos datos generales');
  }
  loadArticulos();
  modalDatosGenerales.style.display = 'none';
});
const modalArticulo = document.getElementById('modalArticulo');
const btnAddArticulo = document.getElementById('btnAddArticulo');
const btnActualizarArticulos = document.getElementById('btnActualizarArticulos');

if (btnActualizarArticulos) {
  btnActualizarArticulos.addEventListener('click', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = 'flex';
      loader.style.opacity = '1';
    }
    loadArticulos().finally(() => {
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 400);
      }
    });
  });
}
const cancelarArticulo = document.getElementById('cancelarArticulo');
const agregarArticulo = document.getElementById('agregarArticulo');

btnAddArticulo.addEventListener('click', () => {
  modalArticulo.style.display = 'flex';
  setTimeout(() => {
    modalArticulo.classList.add('show');
  }, 10);
});
cancelarArticulo.addEventListener('click', () => {
  modalArticulo.classList.remove('show');
  setTimeout(() => {
    modalArticulo.style.display = 'none';
  }, 350);
});
agregarArticulo.addEventListener('click', async () => {
  // Validar datos generales
  const empleado = localStorage.getItem('dg_empleado');
  const bin = localStorage.getItem('dg_bin');
  const bcv = localStorage.getItem('dg_bcv');
  if (!empleado || !bin || !bcv) {
    alert('Debe registrar los datos generales (Empleado, BIN y BCV) antes de añadir un artículo.');
    return;
  }
  const articuloData = {
    modelo: document.getElementById('articuloModelo').value,
    bin: Number(document.getElementById('articuloBin').value),
    weppa: Number(document.getElementById('articuloWeppa').value)
  };
  await saveArticulo(articuloData);
  modalArticulo.classList.remove('show');
  setTimeout(() => {
    modalArticulo.style.display = 'none';
  }, 350);
});

const modalCliente = document.getElementById('modalCliente');
// Modal Seleccionar Cliente
const modalSeleccionarCliente = document.getElementById('modalSeleccionarCliente');
const cancelarSeleccionarCliente = document.getElementById('cancelarSeleccionarCliente');
const insertarSeleccionarCliente = document.getElementById('insertarSeleccionarCliente');

cancelarSeleccionarCliente.addEventListener('click', () => {
  modalSeleccionarCliente.classList.remove('show');
  setTimeout(() => { modalSeleccionarCliente.style.display = 'none'; }, 350);
});

insertarSeleccionarCliente.addEventListener('click', async () => {
  // Obtener datos generales
  const bin = localStorage.getItem('dg_bin') || '';
  const bcv = localStorage.getItem('dg_bcv') || '';
  // Obtener datos del modal
  const nombre = document.getElementById('clienteNombreInput').value;
  const modelo = document.getElementById('clienteModeloInput').value;
  const inicial = Number(document.getElementById('clienteInicialInput').value);
  const weppa = Number(document.getElementById('clienteWeppaInput').value);
  const cuotas = Number(document.getElementById('clienteCuotasInput').value);
  const fechaStr = document.getElementById('clienteFechaInput').value;
  const pagoStr = document.getElementById('clientePagoInput').value;
  // Convertir fechas a timestamp (número)
  const fecha = Date.parse(fechaStr);
  const pago = Date.parse(pagoStr);
  // Balance del artículo seleccionado
  const balance = window.articuloSeleccionado ? window.articuloSeleccionado.balance : 0;
  // Construir objeto cliente
  const clienteData = {
    nombre,
    modelo,
    compra: fecha,
    inicial,
    balance,
    pago,
    cuota: cuotas,
    weppa,
    bin: Number(bin),
    bcv: Number(bcv)
  };
  // Guardar en la base de datos
  try {
    const response = await fetch('/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    });
    const cliente = await response.json();
    console.log('Cliente guardado:', cliente);
    // Recargar la tabla de clientes
    loadClientes();
  } catch (error) {
    console.error('Error al guardar cliente:', error);
  }
  // Cerrar modal
  modalSeleccionarCliente.classList.remove('show');
  setTimeout(() => { modalSeleccionarCliente.style.display = 'none'; }, 350);
});
const cancelarCliente = document.getElementById('cancelarCliente');
const guardarCliente = document.getElementById('guardarCliente');

cancelarCliente.addEventListener('click', () => modalCliente.style.display = 'none');
guardarCliente.addEventListener('click', async () => {
  const clienteData = {
    nombre: document.getElementById('clienteNombre').value,
    modelo: document.getElementById('clienteModelo').value,
    compra: Number(document.getElementById('clienteCompra').value),
    inicial: Number(document.getElementById('clienteInicial').value),
    balance: Number(document.getElementById('clienteCompra').value) - Number(document.getElementById('clienteInicial').value),
    pago: Number(document.getElementById('clientePago').value),
    cuota: Number(document.getElementById('clienteCuota').value),
    weppa: Number(document.getElementById('clienteWeppa').value),
    bin: Number(document.getElementById('clienteBin').value),
    bcv: Number(document.getElementById('clienteBcv').value)
  };
  await saveCliente(clienteData);
  modalCliente.style.display = 'none';
});

// Cargar datos al iniciar
window.onload = function() {
  // Mostrar loader
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  // Ocultar loader tras 1 segundo
  setTimeout(() => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 400);
    }
  }, 1000);
  // Cargar datos (no depende del loader)
  loadArticulos();
  loadClientes();
};