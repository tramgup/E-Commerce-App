import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import shoppingRoutes from './routes/shoppingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import adminMiddleware from './middleware/adminMiddleware.js'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 5003;

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));


// Routes, prepends /auth to all authroutes, and /todos to all todoRoutes
app.use('/auth', authRoutes);
app.use('/shopping', authMiddleware, shoppingRoutes);

//admin routes for product updating and such
app.use('/admin', authMiddleware, adminMiddleware, adminRoutes);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
});