import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/price-adjustment/:category',
    categories: ['other'],
    example: '/ccmn/price-adjustment/copper',
    parameters: {
        category: {
            description: '金属类别',
            options: [
                { label: '铜', value: 'copper' },
                { label: '铝', value: 'alu' },
                { label: '锌', value: 'zn' },
                { label: '锡', value: 'sn' },
                { label: '铅', value: 'pb' },
                { label: '镍', value: 'ni' },
            ],
        },
    },
    radar: [
        {
            source: ['copper.ccmn.cn/:suffix', 'copper.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/copper',
        },
        {
            source: ['alu.ccmn.cn/:suffix', 'alu.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/alu',
        },
        {
            source: ['zn.ccmn.cn/:suffix', 'zn.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/zn',
        },
        {
            source: ['sn.ccmn.cn/:suffix', 'sn.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/sn',
        },
        {
            source: ['pb.ccmn.cn/:suffix', 'pb.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/pb',
        },
        {
            source: ['ni.ccmn.cn/:suffix', 'ni.ccmn.cn/:suffix/:subsuffix?'],
            target: '/price-adjustment/ni',
        },
    ],
    features: {
        supportRadar: true,
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: false,
    },
    name: '调价动态',
    maintainers: ['chrisis58'],
    handler,
    description: '长江有色网的金属调价动态，包括铜、铝、锌、锡、铅、镍等金属。',
};

const SUB_DOMAIN_MAP = {
    copper: 'copper.ccmn.cn',
    alu: 'alu.ccmn.cn',
    zn: 'zn.ccmn.cn',
    sn: 'sn.ccmn.cn',
    pb: 'pb.ccmn.cn',
    ni: 'ni.ccmn.cn',
};

const READABLE_CATEGORIES = {
    copper: '铜',
    alu: '铝',
    zn: '锌',
    sn: '锡',
    pb: '铅',
    ni: '镍',
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const subdomain = SUB_DOMAIN_MAP[category];
    if (!subdomain) {
        throw new Error('未知的金属类型');
    }

    const url = `https://${subdomain}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);

    const items = await Promise.all(
        $('.content1-text-div')
            .toArray()
            .map(async (item) => {
                const $item = $(item);
                const dataId = $item.attr('data-id');

                const $top = $item.find('.top');

                const regionRaw = $top.find('.left').first();
                const region = regionRaw
                    .contents()
                    .filter((_, e) => e.type === 'text')
                    .text()
                    .trim();

                const dateStr = $top.find('.time').text();

                const metal = $top.find('.right').first().text();

                const $priceSpan = $top.find('span.clearfloat');
                const minPriceLabel = $priceSpan.find('.left').text();
                const maxPriceLabel = $priceSpan.find('.right').text();

                const $bottom = $item.find('.bottom');
                const $avgSpan = $bottom.find('.up_down_span');

                const avgPrice = $avgSpan
                    .contents()
                    .filter((_, e) => e.type === 'text')
                    .text()
                    .trim();

                const changeStr = $avgSpan.find('.up_down').text();
                const changeNum = Number(changeStr);

                let icon; // Omit the icon when the change is zero or cannot be parsed.
                if (changeNum > 0) {
                    icon = '🔴';
                } else if (changeNum < 0) {
                    icon = '🟢';
                }

                const title = `${icon ? icon + ' ' : ''}${region} ${metal} 调价: ${changeStr} (均价 ${avgPrice})`;

                const description = renderToString(
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>品类</strong>
                                </td>
                                <td>{metal}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>厂商</strong>
                                </td>
                                <td>{region}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>均价</strong>
                                </td>
                                <td>{avgPrice}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>涨跌</strong>
                                </td>
                                <td>
                                    {icon}
                                    {changeStr}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>价格范围</strong>
                                </td>
                                <td>
                                    {minPriceLabel} - {maxPriceLabel}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                );

                const link = `${url}/quota/${dataId}.html`;
                const fullDate = await cache.tryGet(`${link}:${dateStr}`, async () => {
                    const detailResponse = await got(link);
                    const [, year, month, day] = detailResponse.data.match(/<title>[^<]*(\d{4})年(\d{2})月(\d{2})日/);
                    return `${year}-${month}-${day}`;
                });

                return {
                    title,
                    description,
                    link,
                    guid: dataId, // Use the native data-id as the unique identifier.
                    pubDate: parseDate(fullDate, 'YYYY-MM-DD', 8),
                };
            })
    );

    return {
        title: `长江有色网 - 调价动态 - ${READABLE_CATEGORIES[category]}`,
        link: url,
        item: items,
    };
}
