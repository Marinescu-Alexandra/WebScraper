import { sentimentAnalysis } from '../sentimentAnalysis/sentiment.js';
import { BadRequestError, ExternalServerError } from '../errors/errors.js';
import { browser } from './browserManager.js';


async function navigatePage(page, url) {
    let response;
    try {
        response = await page.goto(url, { waitUntil: 'networkidle2' });
    } catch {
        throw new BadRequestError(`The target website at ${url} cannot be accessed at the moment.`);
    }
    if (response.status() == 404) {
        throw new BadRequestError(`The specific route at ${url} could not be located on the target website.`);
    }
    else if (response.status() >= 500) {
        throw new ExternalServerError(`Data extraction from ${url} is impossible due to issues occurring on the destination website.`);
    }
}

async function scrapeUrl(url, filters) {
    const page = await browser.newPage();
    try {
        await navigatePage(page, url);
        return await getScrapedData(page, filters);
    } finally {
        await page.close();
    }
}

async function getScrapedData(page, filters) {
    let scrapedData = await page.$$eval('a:has(img) + div', nodes => nodes.map(node => {
        const imgNode = node.previousElementSibling?.firstChild;
        const timeNode = node?.querySelector('div:has(time)');
        const spanNode = node?.querySelector('a:has(span)');
        const avatarNode = node?.querySelector('div:has(img)');
        return {
            post_image: imgNode?.src ?? null,
            post_date: timeNode?.firstChild?.textContent ?? null,
            post_category: timeNode?.lastChild?.textContent ?? null,
            post_href: spanNode?.href ?? null,
            post_title: spanNode?.textContent ?? null,
            post_short_description: spanNode?.parentNode?.nextSibling?.textContent ?? null,
            author_avatar: avatarNode?.firstChild?.src ?? null,
            author_name: avatarNode?.lastChild?.firstChild?.textContent ?? null,
            author_profession: avatarNode?.lastChild?.lastChild?.textContent ?? null,
        };
    }));

    scrapedData = scrapedData.map((element) => {
        element.sentiment = null;
        if (element.post_title && element.post_short_description) {
            element.sentiment = sentimentAnalysis(`${element.post_title} ${element.post_short_description}`);
        }
        return element;
    });

    scrapedData = filterItems(scrapedData, filters);

    const tasks = scrapedData.map(element => getPost(element.post_href));
    const pageResults = await Promise.allSettled(tasks);

    return scrapedData.map((element, index) => {
        const text = pageResults[index].status === 'fulfilled' ? pageResults[index].value : null;
        element.words = null;
        if (text) {
            const words = text.split(/\n| /);
            element.words = words.length;
        }
        if (filters.blogContent) {
            element.blog_content = text;
        }
        return element;
    });
}

async function getPost(postUrl) {
    const page = await browser.newPage();
    try {
        await navigatePage(page, postUrl);
        const text = await page.$eval('a:has(span)', node => {
            return node.parentElement?.previousElementSibling?.innerText
        });
        return text;
    } finally {
        await page.close();
    }
}

function filterItems(arr, filters) {
    return arr.filter((element) => {
        if (filters.category && element.post_category !== filters.category) {
            return false;
        }
        if (filters.sentiment && element.sentiment !== filters.sentiment) {
            return false;
        }
        const postDate = new Date(element.post_date);

        if (filters.minIsoDate && postDate < filters.minIsoDate) {
            return false;
        }
        if (filters.maxIsoDate && postDate > filters.maxIsoDate) {
            return false;
        }
        return true;
    });
}

export { scrapeUrl };