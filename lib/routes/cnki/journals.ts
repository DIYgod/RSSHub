import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { ProcessItem } from './utils';

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
    maintainers: ['Fatpandac', 'Derekmini'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
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

    const list = publications
        .map((_, publication) => {
            const title = $(publication).find('a').first().text();
            const filename = $(publication).find('b').attr('id');
            const link = `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`;

            return {
                title,
                link,
                pubDate: date,
            };
        })
        .get();

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => ProcessItem(item))));

    return {
        title: String(title),
        link: journalUrl,
        item: items,
    };
}
