import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js"; // Asegúrate del nombre del archivo
import authRouter from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Conecta a la base de datos
connectDB();

//conecta de de todas las maneras

const allowedOrigins = ['http://localhost:5173'];  // Si estás trabajando localmente con Vite


app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true })); // Permitir cualquier origen

// API Endpoints
app.get('/', (req, res) => res.send("API working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  });

app.listen(port, () => console.log(`Server started on PORT:${port}`));
