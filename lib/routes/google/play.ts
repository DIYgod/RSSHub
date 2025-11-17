import { Route } from '@/types';
import type { Context } from 'hono';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import { Browser } from 'rebrowser-puppeteer';
import { load } from 'cheerio';

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

// check more language codes on https://support.google.com/googleplay/android-developer/table/4419860?hl=en
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
    offeredBy: {
        'en-us': 'Offered by',
        'zh-cn': '提供方',
    },
};

async function handler(ctx: Context) {
    const id = ctx.req.param('id');
    const lang = ctx.req.param('lang') ?? 'en-us';
    const baseurl = 'https://play.google.com/store/apps';
    const link = `${baseurl}/details?id=${id}&hl=${lang}`;

    let browser: Browser | undefined;
    let htmlContent = '';
    try {
        browser = await puppeteer();
        const page = await browser.newPage();
        page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        logger.http(`Requesting ${link}`);
        await page.goto(link, {
            waitUntil: 'domcontentloaded',
        });

        // click "about this app" arrow button
        const aboutThisAppButtonXpath = `::-p-xpath(//button[@aria-label='${keywords.aboutThisAppButton[lang]}'])`;
        await page.click(aboutThisAppButtonXpath);

        // waiting for a dialog containing  <div class="xxxx">Version</div>
        const versionXpath = `::-p-xpath(//div[text()="${keywords.version[lang]}"]/following-sibling::*[1])`;
        await page.waitForSelector(versionXpath);

        htmlContent = await page.content();
        const $ = load(htmlContent);

        const appName = $('span[itemprop=name]').first().text();
        const appImage = $('img[itemprop=image]').first().attr('src');

        let updatedOnStr: string | undefined;
        let version: string | undefined;
        let offeredBy: string | undefined;

        $('div').each(function () {
            if ($(this).text().trim() === keywords.updatedOn[lang]) {
                updatedOnStr = $(this).next().text().trim();
            } else if ($(this).text().trim() === keywords.version[lang]) {
                version = $(this).next().text().trim();
            } else if ($(this).text().trim() === keywords.offeredBy[lang]) {
                offeredBy = $(this).next().text().trim();
            }
        });

        if (!updatedOnStr || !version || !offeredBy) {
            throw new Error('Failed to parse the page');
        }

        const updatedDate = parseDate(updatedOnStr, ...keywords.updatedOnFormat[lang]);

        const whatsNew = $('div[itemprop=description]').html();

        const feedContent = `
            <h2>${keywords.whatsNew[lang]}</h2>
            <p>${whatsNew ?? 'No release notes'}</p>
        `;

        return {
            title: appName + ' - Google Play',
            link,
            image: appImage,
            item: [
                {
                    title: formatVersion(version, updatedDate),
                    description: feedContent,
                    link,
                    pubDate: updatedDate,
                    guid: formatGuid(version, updatedDate),
                    author: offeredBy,
                },
            ],
        };
    } finally {
        await browser?.close();
    }
}

function formatVersion(version: string, updatedDate: Date) {
    // some apps show version as "Varies with device"
    // https://play.google.com/store/apps/details?id=com.adobe.reader&hl=en-us
    const isVersion = /^\d/.test(version);
    return isVersion ? version : updatedDate.toISOString().slice(0, 10);
}

function formatGuid(version: string, updatedDate: Date) {
    return updatedDate.getTime().toString() + '-' + version;
}
