import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const currentURL = (catagory: string, page: number) => (catagory === '_all' ? `https://www.csie.ncku.edu.tw/zh-hant/news?page=${page}` : `https://www.csie.ncku.edu.tw/zh-hant/news/${catagory}?page=${page}`);

const catagories = {
    _all: '全部資訊',
    normal: '一般資訊',
    bachelorAdmission: '大學部招生',
    masterAdmission: '研究所招生',
    speeches: '演講及活動資訊',
    awards: '獲獎資訊',
    scholarship: '獎助學金',
    jobs: '徵人資訊',
};

export const route: Route = {
    'zh-TW': {
        name: '國立成功大學資訊系公告',
        description: String.raw`可用分類：\_all, normal, bachelorAdmission, masterAdmission, speeches, awards, scholarship, jobs`,
    },
    name: 'CSIE News',
    description: String.raw`Availible catagories：\_all, normal, bachelorAdmission, masterAdmission, speeches, awards, scholarship, jobs`,
    path: '/csie/:catagory?',
    categories: ['university'],
    example: '/ncku/csie/normal',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.csie.ncku.edu.tw/zh-hant/news/'],
            target: '/csie/_all',
        },
        {
            source: ['www.csie.ncku.edu.tw/zh-hant/news/:catagory'],
            target: '/csie/:catagory',
        },
    ],
    maintainers: ['simbafs'],
    handler: async (ctx) => {
        let catagory = ctx.req.param('catagory') ?? '_all';
        if (!Object.hasOwn(catagories, catagory)) {
            catagory = 'normal';
        }

        const $ = await ofetch<CheerioAPI>(currentURL(catagory, 1), {
            parseResponse: load,
        });

        const item = $('.list-title > li')
            .toArray()
            .map((e) => {
                const date = $('small', e)
                    .text()
                    .match(/\d{4}\.\d{2}\.\d{2}/)?.[0]
                    .replaceAll('.', '-');
                return {
                    title: $('a', e).text(),
                    pubDate: date ? parseDateInTimezone(date, 8) : undefined,
                    link: `https://www.csie.ncku.edu.tw${$('a', e).attr('href')}`,
                    category: [$('span:nth-child(2)', e).text()].filter(Boolean),
                };
            });

        return {
            title: `成大資訊系公告 - ${catagories[catagory]}`,
            link: currentURL(catagory, 1),
            item,
        };
    },
};
