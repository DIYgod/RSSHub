import { load } from 'cheerio';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'http://flaresolverr:8191/v1';
const SESSION_ID = 'gxnas_session';

// Session singleton: create once, reuse across requests
let sessionCreated = false;

async function ensureSession() {
    if (sessionCreated) {
        return;
    }
    try {
        logger.debug(`Creating FlareSolverr session: ${SESSION_ID}`);
        await ofetch(FLARESOLVERR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { cmd: 'sessions.create', session: SESSION_ID },
        });
        sessionCreated = true;
        logger.debug(`FlareSolverr session created: ${SESSION_ID}`);
    } catch (e) {
        // Session might already exist from a previous run
        logger.debug(`Session creation failed (may already exist): ${(e as Error).message}`);
        sessionCreated = true;
    }
}

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/gxnas',
    radar: [
        {
            source: ['wp.gxnas.com/'],
        },
    ],
    url: 'wp.gxnas.com/',
    name: '最新文章',
    maintainers: ['Franklittleboy'],
    handler,
    description: 'GXNAS博客最新文章',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler() {
    const rootUrl = 'https://wp.gxnas.com';

    await ensureSession();

    logger.debug(`Fetching ${rootUrl} via FlareSolverr session ${SESSION_ID}`);
    const result = await ofetch(FLARESOLVERR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
            cmd: 'request.get',
            url: rootUrl,
            session: SESSION_ID,
            maxTimeout: 120000,
        },
    });

    const html = result?.solution?.response;
    if (!html) {
        throw new Error('FlareSolverr 返回内容为空');
    }

    const $ = load(html);

    const items = $('.article-panel')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const titleEl = $el.find('.header .title a');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');
            const categoryEl = $el.find('.header .label');
            const category = categoryEl.text().trim();
            const contentEl = $el.find('.content');
            const description = contentEl.html() || '';
            const thumbEl = $el.find('.a-thumb img');
            const image = thumbEl.attr('src');

            // Date format: 2023年11月17日
            const dateText = $el.find('.a-meta span').first().text().trim();
            let pubDate: Date | undefined;
            const m = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (m) {
                pubDate = new Date(Number.parseInt(m[1]), Number.parseInt(m[2]) - 1, Number.parseInt(m[3]));
            }

            return {
                title,
                link,
                description: image ? `<img src="${image}"><br>${description}` : description,
                category,
                pubDate: pubDate && parseDate(pubDate),
            } as DataItem;
        })
        .filter((item) => item.title && item.link);

    return {
        title: 'GXNAS博客',
        link: rootUrl,
        item: items,
        description: 'GXNAS博客 - NAS博客|NAS社区|NAS交流|NAS技术|群晖教程|软路由',
    };
}
