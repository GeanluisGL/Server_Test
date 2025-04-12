import express from "express";
import dotenv from "dotenv";
import connectToDB from "./database/db.js";
import { CRUDadhair } from "./models/CRUDadhair.model.js";
import { Order } from "./models/Orders.model.js";
import mongoose  from "mongoose";
import multer from 'multer';
import path  from 'path';
import cors from "cors";
import emailRouter from "./email.js"
import fs from 'fs/promises'
dotenv.config();
const app = express();``
const port = process.env.por || 5000;

//middleware
// // Configuración de Multer
// Configuración de Multer
    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Nombre del archivo
    },
    });
    
    const upload = multer({ storage });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.get('/favicon.ico', (req, res) => res.status(204).end());

connectToDB();


//Email EndPoint

app.use("/confirmation", emailRouter); // Usar el endpoint en /api/send-email
app.use('/api', emailRouter)


// Endpoint Servir imágenes 
app.use('/uploads', express.static('uploads'));

//Product - Crud API

app.get("/product", async (req, res) => {
    try {
        const result = await CRUDadhair.find()
        res.send({
            success:true,
            message: "CRUD list retreived successfully",
            data: result,
        })
    } catch (error) {
        res.send({
            success:false,
            message: "Failed to retreived CRUD list retreived successfully",
            data: result,
        })
    }
});

app.get('/images/product/:productId', async (req, res) => {
  try {
    const product = await CRUDadhair.findById(req.params.productId);
    
    if (!product?.images?.length) {
      return res.status(404).json({ error: 'No se encontraron imágenes para este producto' });
    }

const imagesUrls = product.images.map(image => {
      return `${req.protocol}://${req.get('host')}/images/${image}`;
});

    res.json(imagesUrls);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ error: 'Error del servidor al recuperar imágenes' });
  }
});

// Endpoint para servir las imágenes individuales (nuevo)
app.get('/images/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, 'uploads', req.params.imageName);
  
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Imagen no encontrada');
    }
    res.sendFile(imagePath);
  });
});

app.post('/product', upload.array('images', 5), async (req, res) => {
    const productDetails = req.body; // Detalles del producto
    const images = req.files; // Archivos de imágenes subidos
  
    try {
      // Validación de imágenes
      if (!images || images.length === 0) {
        return res.status(400).send({
          success: false,
          message: 'Debe subir al menos una imagen',
        });
      }
  
      // Guardar las rutas de las imágenes en el objeto del producto
      productDetails.images = images.map((file) => file.path);
  
      // Crear el producto en la base de datos
      const result = await CRUDadhair.create(productDetails);
  
      res.send({
        success: true,
        message: 'Product created successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }); 

app.get("/product/:productId", async (req, res) => {
    const productId = req.params.productId
    try {
        const result = await CRUDadhair.findById(productId)
        res.send({
            success:true,
            message: "Product found",
            data: result
        })
    } catch (error) {
    res.send({
        success: false,
        message: "Failed finding product "
    })
}
})

// Ruta para actualizar un producto
app.patch("/product/:productId", upload.array('images', 10), async (req, res) => {
  const productId = req.params.productId;
  const updatedProduct = req.body; // Datos actualizados del producto
  const newImages = req.files; // Nuevas imágenes subidas

  try {
    // Buscar el producto existente
    const existingProduct = await CRUDadhair.findById(productId);
    if (!existingProduct) {
      return res.status(404).send({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Eliminar imágenes antiguas del sistema de archivos
    if (existingProduct.ProductImage && existingProduct.ProductImage.length > 0) {
      deleteOldImages(existingProduct.ProductImage);
    }

    // Guardar las rutas de las nuevas imágenes
    if (newImages && newImages.length > 0) {
      updatedProduct.ProductImage = newImages.map((file) => `/uploads/products/${file.filename}`);
    }

    // Actualizar el producto en la base de datos
    const updated = await CRUDadhair.findByIdAndUpdate(productId, updatedProduct, {
      new: true,
    });

    res.status(200).send({
      success: true,
      message: "Producto actualizado correctamente",
      data: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
});


app.delete("/product/delete/:productId", async (req, res) => {
    try {
        await CRUDadhair.findByIdAndDelete(req.params.productId);
        res.send({
            success: true,
            message: "Product is deleted successfully",
            data: null,
        })
    } catch (error) {
        res.send({
            success: false,
            message: "Failed to delete Product ",
            data: null,
        })
    }
})

// Eliminar imagen
app.delete("/product/:productId/images/:imageId", async (req, res) => {
  const { productId, imageId } = req.params;

  try {
    // Buscar el producto en la base de datos
    const product = await CRUDadhair.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

      // Opción 1: Si images es array de strings
      product.images = product.images.filter(image => image !== imageId);

      // Opción 2: Si images es array de objetos con _id
      product.images = product.images.filter(image => 
        image._id && image._id.toString() !== imageId
      );

    await product.save();

    res.status(200).json({ success: true, message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res.status(500).json({ success: false, message: "Error al eliminar la imagen" });
  }
});



//Orders - Crud API

app.get("/orders", async (req, res) => {
    try {
        const result = await Order.find()
        res.send({
            success:true,
            message: "Order list retreived successfully",
            data: result,
        })
    } catch (error) {
        res.send({
            success:false,
            message: "Failed to retreived CRUD list retreived successfully",
            data: result,
        })
    }
});


app.post('/orders', upload.array('images', 10), async (req, res) => {
    const orderDetails = req.body; // Detalles de la orden
    const images = req.files; // Archivos de imágenes subidos
  
    try {
      // Guardar las rutas de las imágenes en el objeto de la orden
      if (images && images.length > 0) {
        orderDetails.images = images.map((file) => file.path);
      }
  
      // Crear la orden en la base de datos
      const result = await Order.create(orderDetails);
  
      res.send({
        success: true,
        message: 'Order created successfully',
        data: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Failed to create order',
        error: error.message,
      });
    }
  });

app.get("/orders/:ordersId", async (req, res) => {
    const ordersId = req.params.ordersId
    try {
        const result = await Order.findById(ordersId)
        res.send({
            success:true,
            message: "Order found",
            data: result
        })
    } catch (error) {
    res.send({
        success: false,
        message: "Failed finding product "
    })
}
})


app.patch("/orders/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
    const updatedorder = req.body;
    try {
        const result = await Order.findById(orderId); // Validamos si existe primero
    
        if (!result) {
          return res.status(404).send({
            success: false,
            message: "Producto no encontrado",
          });
        }
    
        const updated = await Order.findByIdAndUpdate(orderId, updatedorder, {
          new: true,
        });
    
        res.status(200).send({
          success: true,
          message: "Product is updated successfully",
          data: updated,
        });
      } catch (error) {
        console.log(error); // Para ver exactamente cuál es el error
        res.status(500).send({
          success: false,
          message: "Failed to update the product",
        });
      }
    });
  

app.delete("/orders/delete/:ordersId", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.ordersId);
        res.send({
            success: true,
            message: "Product is deleted successfully",
            data: null,
        })
    } catch (error) {
        res.send({
            success: false,
            message: "Failed to delete Product ",
            data: null,
        })
    }
})



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

