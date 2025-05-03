import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { ProcessItem } from './utils';
import parser from '@/utils/rss-parser';
import logger from '@/utils/logger';

const rootUrl = 'https://navi.cnki.net';

export const route: Route = {
    path: '/journals/:name',
    categories: ['journal'],
    example: '/cnki/journals/LKGP',
    parameters: { name: '期刊缩写，可以在网址中得到' },
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
            source: ['navi.cnki.net/knavi/journals/:name/detail'],
        },
    ],
    name: '期刊',
    maintainers: ['Fatpandac', 'Derekmini', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const rssUrl = `https://rss.cnki.net/kns/rss.aspx?Journal=${name}&Virtual=knavi`;

    const rssResponse = await got.get(rssUrl);

    try {
        const feed = await parser.parseString(rssResponse.data);

        if (feed.items && feed.items.length !== 0) {
            const items = feed.items.map((item) => ({
                title: item.title,
                description: item.content,
                pubDate: parseDate(item.pubDate),
                link: item.link,
                author: item.author,
            }));

            return {
                title: feed.title,
                link: feed.link,
                description: feed.description,
                item: items,
            };
        }
    } catch (error) {
        logger.error(error);
    }

    const journalUrl = `${rootUrl}/knavi/journals/${name}/detail`;
    const title = await got.get(journalUrl).then((res) => load(res.data)('head > title').text());

    const yearListUrl = `${rootUrl}/knavi/journals/${name}/yearList?pIdx=0`;

    const { code, date } = await got.get(yearListUrl).then((res) => {
        const $ = load(res.data);
        const code = $('.yearissuepage').find('dl').first().find('dd').find('a').first().attr('value');
        const date = parseDate($('.yearissuepage').find('dl').first().find('dd').find('a').first().attr('id').replace('yq', ''), 'YYYYMM');
        return { code, date };
    });

    const yearIssueUrl = `${rootUrl}/knavi/journals/${name}/papers?yearIssue=${code}&pageIdx=0&pcode=CJFD,CCJD`;
    const response = await got.post(yearIssueUrl);

    const $ = load(response.data);
    const publications = $('dd');

    const list = publications.toArray().map((publication) => {
        const title = $(publication).find('a').first().text();
        const filename = $(publication).find('b').attr('id');
        const link = `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`;

        return {
            title,
            link,
            pubDate: date,
        };
    });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => ProcessItem(item))));

    return {
        title: String(title),
        link: journalUrl,
        item: items,
    };
}
