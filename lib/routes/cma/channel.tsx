import { createHash } from 'node:crypto';

import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const solveChallenge = (prefix: string, leadingZeroBits: number) => {
    for (let count = 0; count < 100_000_000; count++) {
        const suffix = count.toString(16);
        const hash = createHash('sha1')
            .update(prefix + suffix)
            .digest();
        if (hash.readUInt32BE(0) >>> (32 - leadingZeroBits) === 0) {
            return suffix;
        }
    }
    throw new Error('Failed to solve the SafeLine challenge of weather.cma.cn');
};

const fetchPageWithChallenge = async (url: string) => {
    const response = await ofetch.raw<string>(url);
    const html = response._data ?? '';
    const challenge = response.headers
        .getSetCookie()
        .find((cookie) => cookie.startsWith('safeline_bot_challenge='))
        ?.split(';', 1)[0];
    const prefix = html.match(/var prefix = '(\w+)';/)?.[1];
    const leadingZeroBits = Number(html.match(/var leading_zero_bit = (\d+);/)?.[1]);

    if (!challenge || !prefix || !leadingZeroBits) {
        return html;
    }

    const answer = challenge.replace('safeline_bot_challenge=', 'safeline_bot_challenge_ans=') + solveChallenge(prefix, leadingZeroBits);

    return ofetch<string>(url, {
        headers: {
            Cookie: `${challenge}; ${answer}`,
        },
    });
};

export const route: Route = {
    path: '/channel/:id?',
    categories: ['forecast'],
    example: '/cma/channel/380',
    parameters: { id: '分类，见下表，可在对应频道页 URL 中找到，默认为 380，即每日天气提示' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天气预报频道',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 天气实况

| 频道名称 | 频道 id                          |
| -------- | -------------------------------- |
| 卫星云图 | d3236549863e453aab0ccc4027105bad |
| 单站雷达 | 103                              |
| 降水量   | 18                               |
| 气温     | 32                               |
| 土壤水分 | 45                               |

#### 气象公报

| 频道名称       | 频道 id                          |
| -------------- | -------------------------------- |
| 每日天气提示   | 380                              |
| 重要天气提示   | da5d55817ad5430fb9796a0780178533 |
| 天气公报       | 3780                             |
| 强对流天气预报 | 383                              |
| 交通气象预报   | 423                              |
| 森林火险预报   | 424                              |
| 海洋天气公报   | 452                              |
| 环境气象公报   | 467                              |

::: tip
订阅更多细分频道，请前往对应上级频道页，使用下拉菜单选择项目后跳转到目标频道页，查看其 URL 找到对应频道 id
:::`,
};

async function handler(ctx) {
    const { id = '380' } = ctx.req.param();

    const author = '中国气象局·天气预报';
    const rootUrl = 'https://weather.cma.cn';
    const apiUrl = new URL('api/channel', rootUrl).href;
    const currentUrl = new URL(`web/channel-${id}.html`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            id,
        },
    });

    const article = response?.data?.pop() ?? {};

    article.image = article.image?.replace(/\?.*$/, '');

    const currentResponse = await fetchPageWithChallenge(currentUrl);

    const $ = load(currentResponse);

    const title = [
        ...new Set(
            $('ol#breadcrumb li')
                .slice(1)
                .toArray()
                .map((li) => $(li).text())
        ),
    ].join(' > ');
    const descriptionHtml = $('div.xml').html();
    const image = new URL($('li.active a img').prop('src'), rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;
    const sourceElement = $('div.col-xs-8 span')
        .toArray()
        .findLast((element) => $(element).text().startsWith('来源'));
    const itemAuthor = $(sourceElement).text().split('：').pop() || author;

    const items = [
        {
            title: `${article.title} ${article.releaseTime}`,
            link: new URL(article.link, rootUrl).href,
            description: renderToString(
                <>
                    {article.image ? (
                        <figure>
                            <img src={new URL(article.image, rootUrl).href} alt={article.title} />
                        </figure>
                    ) : null}
                    {descriptionHtml ? raw(descriptionHtml) : null}
                </>
            ),
            author: itemAuthor,
            guid: `cma${article.link}#${article.releaseTime.replaceAll(/\s/g, '-')}`,
            pubDate: timezone(parseDate(article.releaseTime), 8),
            enclosure_url: new URL(article.image, rootUrl).href,
            enclosure_type: article.image ? `image/${article.image.split(/\./).pop()}` : undefined,
        },
    ];

    return {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
}
