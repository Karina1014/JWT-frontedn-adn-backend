import express from "express";
import 'dotenv/config';
import connectDB from "./config/mongodb.js"; 
import authRouter from "./routes/authRoutes.js";

const app = express();
const port = 3011;

connectDB();

app.use(express.json());

// API Endpoints
app.get('/', (req, res) => res.send("API working"));
app.use('/api/auth', authRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  });

app.listen(port, () => console.log(`Server started on PORT:${port}`));
