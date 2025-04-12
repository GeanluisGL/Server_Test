import nodemailer from "nodemailer";
import express from "express"
const router = express.Router();

// Email Configuration (ya existente)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "stak89544@gmail.com",
      pass: "pwvm stag aqsu gttr",
    },
});

// Endpoint para enviar correo genérico (ya existente)
router.post("/send-email", async (req, res) => {
  const { to, subject, text, name, email, phone } = req.body;

  const textContent = `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nAsunto: ${subject}\nMensaje: ${text}`;

  const htmlContent = `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: #4a6fa5; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
      </div>
      
      <!-- Content -->
      <div style="padding: 25px; background-color: #f9f9f9;">
        <div style="background-color: white; border-radius: 6px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h2 style="color: #333; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">${subject}</h2>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong style="color: #555;">Nombre:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong style="color: #555;">Email:</strong> <a href="mailto:${email}" style="color: #4a6fa5; text-decoration: none;">${email}</a></p>
            <p style="margin: 5px 0;"><strong style="color: #555;">Teléfono:</strong> ${phone}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #444;">Mensaje:</h3>
            <p style="margin-bottom: 0; color: #333;">${text.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto</p>
      </div>
    </div>
  `;


  const mailOptions = {
    from: "stak89544@gmail.com",
    to,
    subject: `Nuevo mensaje de: ${subject}`,
    text: textContent,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Correo enviado con éxito" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al enviar el correo" });
  }
});

// Nuevo endpoint específico para confirmación de pedidos
router.post('/send-order-confirmation', async (req, res) => {
  const {
    clientEmail,
    clientName,
    productName,
    color,
    size,
    quantity,
    unitPrice,
    totalPrice,
    address,
    clientNumber,
    transferId
  } = req.body;

  // Validación de campos requeridos
  if (!clientEmail || !clientName || !productName || !quantity || !totalPrice) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan campos requeridos" 
    });
  }

  // Plantilla HTML profesional para el email de confirmación
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: #333; margin: 0;">Confirmación de Pedido</h1>
      </div>
      
      <div class="content">
        <p>Hola ${clientName},</p>
        <p>Gracias por tu pedido. Hemos recibido tu orden y la estamos procesando. Aquí están los detalles:</p>
        
        <div class="order-details">
          <h2 style="margin-top: 0;">Detalles del Pedido</h2>
          
          <table>
            <tr>
              <th>Producto</th>
              <td>${productName}</td>
            </tr>
            ${color ? `<tr><th>Color</th><td>${color}</td></tr>` : ''}
            ${size ? `<tr><th>Tamaño</th><td>${size}</td></tr>` : ''}
            <tr>
              <th>Cantidad</th>
              <td>${quantity}</td>
            </tr>
            <tr>
              <th>Precio Unitario</th>
              <td>$${unitPrice || 'N/A'}</td>
            </tr>
            <tr>
              <th>Precio Total</th>
              <td>$${totalPrice}</td>
            </tr>
          </table>
        </div>
        
        <h2>Información de Envío</h2>
        <table>
          <tr>
            <th>Nombre</th>
            <td>${clientName}</td>
          </tr>
          ${address ? `<tr><th>Dirección</th><td>${address}</td></tr>` : ''}
          ${clientNumber ? `<tr><th>Teléfono</th><td>${clientNumber}</td></tr>` : ''}
          ${transferId ? `<tr><th>Número de Transferencia</th><td>${transferId}</td></tr>` : ''}
        </table>
        
        <p>Recibirás una notificación cuando tu pago sea confirmado. Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Gracias por comprar con nosotros!</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Adahara Hair. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;

  // Texto plano alternativo para clientes de email que no soportan HTML
  const textContent = `
    Confirmación de Pedido
    ----------------------
    Hola ${clientName},
    
    Gracias por tu pedido. Aquí están los detalles:
    
    Producto: ${productName}
    ${color ? `Color: ${color}` : ''}
    ${size ? `Tamaño: ${size}` : ''}
    Cantidad: ${quantity}
    Precio Unitario: $${unitPrice || 'N/A'}
    Precio Total: $${totalPrice}
    
    Información de Envío:
    Nombre: ${clientName}
    ${address ? `Dirección: ${address}` : ''}
    ${clientNumber ? `Teléfono: ${clientNumber}` : ''}
    ${transferId ? `Número de Transferencia: ${transferId}` : ''}
    
    Recibirás una notificación cuando tu pedido sea enviado.
    ¡Gracias por comprar con nosotros!
  `;

  const mailOptions = {
    from: '"Adahara Hair" <stak89544@gmail.com>',
    to: clientEmail,
    subject: `Confirmación de Pedido - ${productName}`,
    text: textContent,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ 
      success: true, 
      message: "Email de confirmación enviado con éxito" 
    });
  } catch (error) {
    console.error("Error al enviar email de confirmación:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al enviar el email de confirmación" 
    });
  }
});

export default router;