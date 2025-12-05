import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt();

const baseUrl = 'https://www.luogu.com.cn';

const typeMap = {
    ruleType: {
        1: 'OI',
        2: 'ACM',
        3: '乐多',
        4: 'IOI',
    },
    visibilityType: {
        1: '官方比赛',
        2: '团队公开赛',
        4: '个人公开赛',
    },
    // invitationCodeType: {
    //     1: '',
    //     2: '',
    // },
};

export const route: Route = {
    path: '/contest',
    categories: ['programming'],
    example: '/luogu/contest',
    parameters: {},
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
            source: ['luogu.com.cn/contest/list', 'luogu.com.cn/'],
        },
    ],
    name: '比赛列表',
    maintainers: ['prnake'],
    handler,
    url: 'luogu.com.cn/contest/list',
};

async function handler() {
    const link = `${baseUrl}/contest/list`;
    const { data: response } = await got(link);
    const $ = load(response);

    const data = JSON.parse(
        decodeURIComponent(
            $('script')
                .text()
                .match(/decodeURIComponent\("(.*)"\)/)[1]
        )
    );

    const result = await pMap(
        data.currentData.contests.result,
        (item) =>
            cache.tryGet(`${baseUrl}/contest/${item.id}`, async () => {
                const { data: response } = await got(`${baseUrl}/contest/${item.id}`);
                const $ = load(response);
                const data = JSON.parse(
                    decodeURIComponent(
                        $('script')
                            .text()
                            .match(/decodeURIComponent\("(.*)"\)/)[1]
                    )
                );

                return {
                    title: item.name,
                    description: md.render(data.currentData.contest.description),
                    link: `${baseUrl}/contest/${item.id}`,
                    author: item.host.name,
                    pubDate: parseDate(item.startTime, 'X'),
                    category: [item.rated ? 'Rated' : null, typeMap.ruleType[item.ruleType], typeMap.visibilityType[item.visibilityType]].filter(Boolean),
                };
            }),
        { concurrency: 4 }
    );

    return {
        title: $('head title').text(),
        link,
        image: 'https://www.luogu.com.cn/favicon.ico',
        item: result,
    };
}
