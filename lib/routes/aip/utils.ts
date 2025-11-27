import path from 'node:path';

import { art } from '@/utils/render';

const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    // await page.setExtraHTTPHeaders({ referer: host });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    return html;
};

const renderDesc = (title, authors, doi, img) =>
    art(path.join(__dirname, 'templates/description.art'), {
        title,
        authors,
        doi,
        img,
    });

export { puppeteerGet, renderDesc };
