// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chaincatcher.com';

export default async (ctx) => {
    const { data } = await got.post(`${rootUrl}/index/content/lists`, {
        form: {
            page: 1,
            categoryid: 3,
        },
    });

    const $ = load(data.data, null, false);

    $('.share').remove();
    const items = $('.block')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.tips').remove();
            const act = !!item.find('.act-title').text();
            return {
                title: `${act ? '[重] ' : ''}${item.find('.title').text()}`,
                description: item.find('.summary').text(),
                link: `${rootUrl}${item.find('a').first().attr('href')}`,
                pubDate: timezone(parseDate(item.find('.time').text(), 'YYYY-MM-DD HH:mm:ss'), 8),
            };
        });

    ctx.set('data', {
        title: '最新资讯-ChainCatcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: `${rootUrl}/news`,
        item: items,
    });
};
