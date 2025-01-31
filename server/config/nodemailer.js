import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Deshabilita la validación
  }
});
transporter.verify((error, success) => {
    if (error) {
        console.error('Error al conectar con SMTP:', error);
    } else {
        console.log('Conexión exitosa con SMTP');
    }
});


export default transporter;
