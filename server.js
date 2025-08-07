

const express = require('express');
const mongoose = require('mongoose');
const Articulo = require('./models/articulo');
const Cliente = require('./models/cliente');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect('mongodb+srv://alex:alexdavid@cluster0.vi7d4cg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Rutas para Artículos
// Eliminar artículo por ID

app.delete('/articulos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Intentando eliminar artículo con id:', id);
    // Validar formato de ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de artículo inválido' });
    }
    const eliminado = await Articulo.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json({ message: 'Artículo eliminado' });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
});

app.get('/articulos', async (req, res) => {
  try {
    const articulos = await Articulo.find();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
});

app.post('/articulos', async (req, res) => {
  try {
    const articulo = new Articulo(req.body);
    await articulo.save();
    res.status(201).json(articulo);
  } catch (error) {
    res.status(400).json({ error: 'Error al guardar artículo' });
  }
});

// Rutas para Clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.post('/clientes', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al guardar cliente' });
  }
});

// Eliminar cliente por ID
app.delete('/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Validar formato de ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    const eliminado = await Cliente.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// Actualizar artículo por ID
app.put('/articulos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Validar formato de ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de artículo inválido' });
    }
    const actualizado = await Articulo.findByIdAndUpdate(id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error al actualizar artículo' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});