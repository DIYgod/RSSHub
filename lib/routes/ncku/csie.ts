import type { Route, DataItem } from '@/types';
import { load } from 'cheerio';

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
        description: '可用分類：_all, normal, bachelorAdmission, masterAdmission, speeches, awards, scholarship, jobs',
    },
    name: 'NCKU CSIE News',
    description: 'Availible catagories：_all, normal, bachelorAdmission, masterAdmission, speeches, awards, scholarship, jobs',
    path: '/csie/:catagory?',
    categories: ['university'],
    example: '/csie/normal',
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
            source: ['www.csie.ncku.edu.tw/zh-hant/news/:catagory?/', 'www.csie.ncku.edu.tw/en/news/:catagory?/'],
            target: '/zh-hant/:catagory',
        },
    ],
    maintainers: ['simbafs'],
    handler: async (ctx) => {
        let catagory = ctx.req.param('catagory') ?? '_all';
        if (catagories[catagory] === undefined) {
            catagory = 'normal';
        }

        const base = 1; // get from query
        const limit = 10; // get from query

        // console.log({ catagory }, currentURL(catagory, 1));

        const item = await Promise.allSettled(
            Array.from({ length: limit }).map((_, i) =>
                fetch(currentURL(catagory, base + i))
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`Failed to fetch ${res.url}`);
                        }
                        return res.text();
                    })
                    .then(load)
                    .then(($) => {
                        const r = $('.list-title > li')
                            .toArray()
                            .map((el) => ({
                                title: $('a', el).text(),
                                pubDate: $('small', el).text(),
                                link: `https://www.csie.ncku.edu.tw${$('a', el).attr('href')}`,
                                catagory: $('span:nth-child(2)', el).text(),
                            }));

                        return r;
                    })
            )
        )
            .then((result) => result.filter((item) => item.status === 'fulfilled'))
            .then((result) => result.reduce((acc: DataItem[], cur) => [...acc, ...cur.value], []));
        // .then((d) => {
        //     console.log(d);
        //     return d;
        // });

        return {
            title: `成大資訊系公告 - ${catagories[catagory]}`,
            link: `https://www.csie.ncku.edu.tw/zh-hant/${catagory}/`,
            item,
        };
    },
};
