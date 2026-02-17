import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const subDomain = SUB_DOMAIN_MAP[category];
    if (!subDomain) {
        throw new Error('未知的金属类型');
    }

    const url = `https://${subDomain}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);

    const items = $('.content1-text-div')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const dataId = $item.attr('data-id');

            const $top = $item.find('.top');

            const regionRaw = $top.find('.left').first();
            const region = regionRaw
                .contents()
                .filter((_, e) => e.type === 'text')
                .text()
                .trim();

            const dateStr = $top.find('.time').text().trim();

            const metal = $top.find('.right').first().text().trim();

            const $priceSpan = $top.find('span.clearfloat');
            const minPriceLabel = $priceSpan.find('.left').text().trim();
            const maxPriceLabel = $priceSpan.find('.right').text().trim();

            const $bottom = $item.find('.bottom');
            const $avgSpan = $bottom.find('.up_down_span');

            const avgPrice = $avgSpan
                .contents()
                .filter((_, e) => e.type === 'text')
                .text()
                .trim();

            const changeStr = $avgSpan.find('.up_down').text().trim();
            const changeNum = Number.parseFloat(changeStr);

            let icon; // 如果 change 为 0 或者无法解析，则不显示图标
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
                                {icon ?? ''}
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

            return {
                title,
                description,
                link: `${url}/quota/${dataId}.html`,
                guid: dataId, // 使用 data-id 作为唯一标识
                pubDate: timezone(parseDate(dateStr, 'MM-DD'), +8),
            };
        });

    return {
        title: `长江有色网 - 调价动态 - ${READABLE_CATEGORIES[category]}`,
        link: url,
        item: items,
    };
}
