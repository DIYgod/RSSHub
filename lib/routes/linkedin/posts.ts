import { load } from 'cheerio';

import type { Route } from '@/types';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

import { BASE_URL, parseCompanyName, parseCompanyPosts } from './utils';

export const route: Route = {
    path: '/company/:company_id/posts',
    categories: ['social-media'],
    example: '/linkedin/company/google/posts',
    parameters: { company_id: "Company's LinkedIn profile ID" },
    description: "Get company's LinkedIn posts by company ID",
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Company Posts',
    maintainers: ['saifazmi'],
    handler: async (ctx) => {
        const company_id = ctx.req.param('company_id');

        // Puppeteer setup
        const browser = await puppeteer();
        const page = await browser.newPage();
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });

        const url = new URL(`${BASE_URL}/company/${company_id}`);

        logger.http(`Requesting ${url.href}`);
        await page.goto(url.href, {
            waitUntil: 'domcontentloaded',
        });

        const response = await page.content();
        await page.close();

        const $ = load(response);
        const companyName = parseCompanyName($);
        const posts = parseCompanyPosts($);

        await browser.close();

        return {
            title: `LinkedIn - ${companyName}'s Posts`,
            link: url.href,
            description: `This feed gets ${companyName}'s posts from LinkedIn`,
            item: posts.map((post) => ({
                title: post.text,
                description: post.text,
                link: post.link,
                pubDate: post.date,
                updated: post.date,
            })),
        };
    },
};
