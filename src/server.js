import express from 'express';
import dotenv from 'dotenv';
import repoRoutes from './routes/repoRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.use('/api/repos', repoRoutes); // Routes mounted under /api/repos

app.use(errorHandler); // Global error handler middleware

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
