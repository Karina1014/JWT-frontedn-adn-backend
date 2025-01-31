// Cargar las variables de entorno desde .env
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.MONGODB_URI); // Ahora debería imprimir el valor de la URI

console.log(process.env.SMTP_USER); // Ahora debería imprimir el valor de la URI

console.log(process.env.SMTP_PASS); // Ahora debería imprimir el valor de la URI

console.log(process.env.SENDER_EMAIL); // Ahora debería imprimir el valor de la URI
