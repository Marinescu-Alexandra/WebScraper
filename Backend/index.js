import express from 'express';
import { AppError } from './errors/errors.js';
import { initializeBrowser } from './scraper/browserManager.js';
import { scraperRouter } from './routes/scrape.js';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = 3000;

const errorHandler = (error, request, response, next) => {
    if (error instanceof AppError) {
        response.status(error.status).json({error: error.message});
    }
    else {
        response.status(500).json({error: "Internal server error"});
    }
}

app.use("/scrape", scraperRouter);

app.use(errorHandler);
app.listen(PORT, async () => {
    await initializeBrowser();
    console.log(`App is listening on port ${PORT}; http://localhost:${PORT}/`);
});