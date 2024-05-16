import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = '60847' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12;

    const rootUrl = 'https://cfhd.cf.qq.com';
    const rootImageUrl = 'https://game.gtimg.cn';
    const currentUrl = new URL(`webplat/info/news_version3/37427/59139/59140/${category}/m22510/list_1.shtml`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const language = $('html').prop('lang');

    let items = $('div.news-list-item ul li.list-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('p').text(),
                pubDate: parseDate(item.find('span.date').text()),
                link: new URL(item.find('a.clearfix').prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const $$ = load(iconv.decode(detailResponse, 'gbk'));

                const title = $$('div.news-details-title h4').text();
                const description = $$('div.news-details-cont').html();
                const image = $$('div.news-details-cont img').first().prop('src');

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('p.news-details-p1').text().trim()), +8);
                item.content = {
                    html: description,
                    text: $$('div.news-details-cont').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL('images/cfhd/web202305/logo.png', rootImageUrl).href;

    return {
        title: `${$('title').text().split(/-/)[0]} - ${$('li.cur').text()}`,
        description: $('meta[name="Description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="author"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/cfhd/news/:category?',
    name: '穿越火线 CFHD 专区资讯中心',
    url: 'cfhd.cf.qq.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/qq/cfhd/news',
    parameters: { category: '分类，默认为 60847，即最新，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [穿越火线 CFHD 专区资讯中心 - 最新](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60847/m22510/list_1.shtml)，网址为 \`https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60847/m22510/list_1.shtml\`。截取 \`https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/\` 到末尾 \`/m22510/list_1.shtml\` 的部分 \`60847\` 作为参数填入，此时路由为 [\`/qq/cfhd/news/60847\`](https://rsshub.app/qq/cfhd/news/60847)。
  :::

  | 分类                                                                                                  | ID                                            |
  | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- |
  | [最新](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60847/m22510/list_1.shtml) | [60847](https://rsshub.app/qq/cfhd/news/60847) |
  | [公告](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59625/m22510/list_1.shtml) | [59625](https://rsshub.app/qq/cfhd/news/59625) |
  | [版本](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60850/m22510/list_1.shtml) | [60850](https://rsshub.app/qq/cfhd/news/60850) |
  | [赛事](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59626/m22510/list_1.shtml) | [59626](https://rsshub.app/qq/cfhd/news/59626) |
  | [杂谈](https://cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59624/m22510/list_1.shtml) | [59624](https://rsshub.app/qq/cfhd/news/59624) |
  `,
    categories: ['game'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '穿越火线 CFHD 专区资讯中心 - 最新',
            source: ['cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60847/m22510/list_1.shtml'],
            target: '/cfhd/news/60847',
        },
        {
            title: '穿越火线 CFHD 专区资讯中心 - 公告',
            source: ['cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59625/m22510/list_1.shtml'],
            target: '/cfhd/news/59625',
        },
        {
            title: '穿越火线 CFHD 专区资讯中心 - 版本',
            source: ['cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/60850/m22510/list_1.shtml'],
            target: '/cfhd/news/60850',
        },
        {
            title: '穿越火线 CFHD 专区资讯中心 - 赛事',
            source: ['cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59626/m22510/list_1.shtml'],
            target: '/cfhd/news/59626',
        },
        {
            title: '穿越火线 CFHD 专区资讯中心 - 杂谈',
            source: ['cfhd.cf.qq.com/webplat/info/news_version3/37427/59139/59140/59624/m22510/list_1.shtml'],
            target: '/cfhd/news/59624',
        },
    ],
};
