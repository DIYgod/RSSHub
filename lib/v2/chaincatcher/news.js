const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.chaincatcher.com';

module.exports = async (ctx) => {
    const { data } = await got.post(`${rootUrl}/index/content/lists`, {
        form: {
            page: 1,
            categoryid: 3,
        },
    });

    const $ = cheerio.load(data.data, null, false);

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

    ctx.state.data = {
        title: '最新资讯-ChainCatcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: `${rootUrl}/news`,
        item: items,
    };
};
