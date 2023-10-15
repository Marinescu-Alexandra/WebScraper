import puppeteer from 'puppeteer';

let browser;

async function initializeBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
        });
    }
}

export {initializeBrowser, browser}