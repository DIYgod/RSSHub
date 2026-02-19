import gPlay from 'google-play-scraper';
import type { Context } from 'hono';

import type { Route } from '@/types';
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
    const hl = lang.split('-')[0].toLowerCase();
    const gl = lang.split('-')[1].toLowerCase();
    const link = `${baseurl}/details?id=${id}&hl=${hl}&gl=${gl}`;

    const appInfo = await gPlay.app({ appId: id, lang: hl, country: gl });

    const appName = appInfo.title;
    const appImage = appInfo.icon;

    const version = appInfo.version;
    const offeredBy = appInfo.developer || appInfo.developerLegalName;

    const updatedDate = parseDate(appInfo.updated);

    const whatsNew = appInfo.recentChanges;

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
}

function formatVersion(version: string, updatedDate: Date) {
    // some apps show version as "VARY"
    // https://play.google.com/store/apps/details?id=com.adobe.reader&hl=en-us
    const isVersion = /^\d/.test(version);
    return isVersion ? version : updatedDate.toISOString().slice(0, 10);
}

function formatGuid(version: string, updatedDate: Date) {
    return updatedDate.getTime().toString() + '-' + version;
}
