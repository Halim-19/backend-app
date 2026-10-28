import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());          // 1. security headers
app.use(cors());            // 2. cross-origin access
app.use(morgan('dev'));     // 3. request logging
app.use(express.json());    // 4. parse JSON bodies into req.body

app.use('/api', routes);    // 5. your actual routes

app.use(notFound);          // 6. anything unmatched → 404
app.use(errorHandler);      // 7. errors always go last

export default app;