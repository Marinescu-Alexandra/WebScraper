import express from 'express';
import { scrapeUrl } from '../scraper/webScraper.js';
import { check, validationResult } from 'express-validator';
import { BadRequestError } from '../errors/errors.js';

const scraperRouter = express.Router();

scraperRouter.get('/', [
    check('url').isURL().withMessage('Invalid URL format.'),
    check('sentiment').optional().isIn(["negative", "positive", "neutral"]).withMessage('Bad sentiment query parameter, sentiment must be positive|negative|neutral'),
    check('category').optional().isString().isLength({ min: 2 }).withMessage('Bad category query parameter, category must have at least 2 letters.'),
    check('minIsoDate').optional().isISO8601().withMessage('Bad minIsoDate query parameter, the date must be a valid ISO date.'),
    check('maxIsoDate').optional().isISO8601().withMessage('Bad maxIsoDate query parameter, the date must be a valid ISO date.'),
    check('blogContent').optional().isBoolean().withMessage('Bad blogContent query parameter, blogContent must be a boolean value.')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array().map(e => e.msg).join('. ');
            throw new BadRequestError(errorMessage);
        }

        const { url, sentiment, category, minIsoDate, maxIsoDate, blogContent } = req.query;

        const filters = {
            sentiment: sentiment || null,
            category: category || null,
            minIsoDate: minIsoDate ? new Date(minIsoDate) : null,
            maxIsoDate: maxIsoDate ? new Date(maxIsoDate) : null,
            blogContent: blogContent === "true",
        };

        filters.minIsoDate?.setHours(0, 0, 0, 0);
        filters.maxIsoDate?.setHours(0, 0, 0, 0);

        const data = await scrapeUrl(url, filters);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

export { scraperRouter };