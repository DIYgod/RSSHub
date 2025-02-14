import { Route } from '@/types';
import cache from '@/utils/cache';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:section?',
    categories: ['finance'],
    example: '/okx/new-listings',
    parameters: {
        section: {
            description: '公告版块',
            default: 'latest-announcements',
            options: [
                {
                    value: 'latest-announcements',
                    label: '最新公告',
                },
                {
                    value: 'new-listings',
                    label: '新币种上线',
                },
                {
                    value: 'delistings',
                    label: '币对下线',
                },
                {
                    value: 'trading-updates',
                    label: '交易规则更新',
                },
                {
                    value: 'deposit-withdrawal-suspension-resumption',
                    label: '充提暂停/恢复公告',
                },
                {
                    value: 'p2p-trading',
                    label: 'C2C 公告',
                },
                {
                    value: 'web3',
                    label: 'Web3',
                },
                {
                    value: 'earn',
                    label: '赚币',
                },
                {
                    value: 'jumpstart',
                    label: 'Jumpstart',
                },
                {
                    value: 'api',
                    label: 'API公告',
                },
                {
                    value: 'okb-buy-back-burn',
                    label: 'OKB销毁',
                },
                {
                    value: 'others',
                    label: '其他',
                },
            ],
        },
    },
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
            source: ['www.okx.com/zh-hans/help/section/:section'],
            target: '/:section',
        },
    ],
    name: '公告',
    maintainers: ['lxl66566'],
    handler,
};

async function handler(ctx: Context) {
    const baseUrl = 'https://www.okx.com';
    let { section = 'latest-announcements' } = ctx.req.param();
    section = section.replace(/^announcements-/, '');

    const data = await ofetch(`${baseUrl}/zh-hans/help/section/announcements-${section}`);
    const $ = load(data);

    const itemsTemp = $('ul[aria-describedby=help-load-more-desc] li')
        .toArray()
        .map((item) => {
            const link = `${baseUrl}${$(item).find('a').attr('href')}`;
            const title = $(item).find('a div[class^="index_title"]').text().trim();
            const dateText = $(item).find('[data-testid="DateDisplay"]').text().trim(); // 从"发布于 2025年1月18日"提取日期
            const pubDate = parseDate(dateText.replace('发布于 ', ''), 'YYYY年M月D日');
            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(
        itemsTemp.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    const content = $('div[class^="index_richTextContent"]').html();

                    return {
                        ...item,
                        description: content,
                    };
                } catch (error) {
                    return {
                        ...item,
                        description: '内容获取失败：' + (error instanceof Error ? error.message : 'Unknown Error'),
                    };
                }
            })
        )
    );

    return {
        title: $('.okui-breadcrumbs-crumb-active').text().trim(),
        link: `${baseUrl}/zh-hans/help/section/announcements-${section}`,
        item: items,
    };
}
