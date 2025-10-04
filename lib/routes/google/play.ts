import { Route } from '@/types';
import type { Context } from 'hono';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Play Store Update',
    path: '/play/:id/:lang?',
    categories: ['program-update'],
    example: '/google/play/net.dinglisch.android.taskerm',
    parameters: {
        id: 'Package id, can be found in url',
        lang: {
            description: 'language',
            options: [
                { value: 'en-us', label: 'English' },
                { value: 'zh-cn', label: '简体中文' },
            ],
            default: 'en-us',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['play.google.com/store/apps/details?id=:id'],
        },
    ],
    maintainers: ['surwall'],
    handler,
};

const keywords = {
    // find aria-label of the button next to the "About this app"
    aboutThisAppButton: {
        'en-us': 'See more information on About this app',
        'zh-cn': '查看“关于此应用”的更多相关信息',
    },
    whatsNew: {
        'en-us': 'What’s new',
        'zh-cn': '新变化',
    },
    updatedOn: {
        'en-us': 'Updated on',
        'zh-cn': '更新日期',
    },
    // this format is used to parse the date string in the "Updated on" section
    updatedOnFormat: {
        // Jun 23, 2025, 'Jun' is a locale word, we use 'en' as the locale key
        'en-us': ['MMM D, YYYY', 'en'],
        // 2025年6月23日
        'zh-cn': ['YYYY年M月D日'],
    },
    version: {
        'en-us': 'Version',
        'zh-cn': '版本',
    },
};

async function handler(ctx: Context) {
    const id = ctx.req.param('id');
    const lang = ctx.req.param('lang') ?? 'en-us';

    const browser = await puppeteer();
    const page = await browser.newPage();

    const baseurl = 'https://play.google.com/store/apps';
    const link = `${baseurl}/details?id=${id}&hl=${lang}`;

    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });

    const appNameXpath = `::-p-xpath(//span[@itemprop='name'])`;
    const appNameHandler = await page.$(appNameXpath);
    const appName = (await page.evaluate((elem) => elem?.textContent, appNameHandler)) as string;

    const appImageXpath = `::-p-xpath(//img[@itemprop='image'])`;
    const appImageHandler = await page.$(appImageXpath);
    const appImage = (await page.evaluate((elem) => (elem as HTMLImageElement).src, appImageHandler)) as string;

    const updatedOnXpath = `::-p-xpath(//div[text()="${keywords.updatedOn[lang]}"]/following-sibling::*[1])`;
    const updatedOnHandler = await page.$(updatedOnXpath);
    const updatedOn = (await page.evaluate((elem) => elem?.textContent, updatedOnHandler)) as string;
    const updatedDate = parseDate(updatedOn, ...keywords.updatedOnFormat[lang]);

    // some apps don't have a "What's new" section
    const whatsNewXpath = `::-p-xpath(//div[@itemprop='description'])`;
    const whatsNewHandler = await page.$(whatsNewXpath);
    const whatsNewContent = (await page.evaluate((elem) => elem?.innerHTML, whatsNewHandler)) as string;

    const feedContent = `
        <h2>${keywords.whatsNew[lang]}</h2>
        <p>${whatsNewContent ?? 'No release notes'}</p>
    `;

    // click "about this app" button
    const aboutThisAppButtonXpath = `::-p-xpath(//button[@aria-label='${keywords.aboutThisAppButton[lang]}'])`;
    await page.click(aboutThisAppButtonXpath);

    const versionXpath = `::-p-xpath(//div[text()="${keywords.version[lang]}"]/following-sibling::*[1])`;
    const versionHandler = await page.waitForSelector(versionXpath);
    const version = (await page.evaluate((elem) => elem?.textContent, versionHandler)) as string;

    page.close();
    browser.close();

    return {
        title: appName + ' - Google Play',
        link,
        image: appImage,
        item: [
            {
                title: version,
                description: feedContent,
                link,
                pubDate: updatedDate,
                guid: version,
                author: 'Google Play',
            },
        ],
    };
}
