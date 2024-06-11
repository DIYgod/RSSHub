import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { ProcessItem } from './utils';

const rootUrl = 'https://kns.cnki.net';

export const route: Route = {
    path: '/author/:code',
    categories: ['journal'],
    example: '/cnki/author/000042423923',
    parameters: { code: '作者对应code，可以在网址中得到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作者期刊文献',
    description: `:::tip
    可能仅限中国大陆服务器访问，以实际情况为准。
    :::`,
    maintainers: ['harveyqiu', 'Derekmini'],
    handler,
};

async function handler(ctx) {
    const code = ctx.req.param('code');

    const authorInfoUrl = `${rootUrl}/kcms/detail/knetsearch.aspx?sfield=au&code=${code}`;
    const res = await got(authorInfoUrl);
    const $ = load(res.data);
    const authorName = $('#showname').text();
    const companyName = $('body > div.wrapper > div.main > div.container.full-screen > div > div:nth-child(3) > h3:nth-child(2) > span > a').text();

    const res2 = await got(`${rootUrl}/kns8/Detail`, {
        searchParams: {
            sdb: 'CAPJ',
            sfield: '作者',
            skey: authorName,
            scode: code,
            acode: code,
        },
        followRedirect: false,
    });
    const authorPageUrl = res2.headers.location;

    const regex = /v=([^&]+)/;
    const code2 = authorPageUrl.match(regex)[1];

    const url = `${rootUrl}/restapi/knowledge-api/v1/experts/relations/resources?v=${code2}&sequence=PT&size=10&sort=desc&start=1&resource=CJFD`;

    const res3 = await got(url, { headers: { Referer: authorPageUrl } });
    const publications = res3.data.data.data;

    const list = publications.map((publication) => {
        const metadata = publication.metadata;
        const { value: title = '' } = metadata.find((md) => md.name === 'TI') || {};
        const { value: date = '' } = metadata.find((md) => md.name === 'PT') || {};
        const { value: filename = '' } = metadata.find((md) => md.name === 'FN') || {};

        return {
            title,
            link: `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`,
            author: authorName,
            pubDate: date,
        };
    });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => ProcessItem(item))));

    return {
        title: `知网 ${authorName} ${companyName}`,
        link: authorInfoUrl,
        item: items,
    };
}
