const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.chaincatcher.com';

module.exports = async (ctx) => {
    const { data } = await got.post(`${rootUrl}/api/article/lists`, {
        form: {
            page: 1,
            home: 1,
        },
    });

    const list = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${rootUrl}/article/${item.id}`,
        pubDate: parseDate(item.add_time, 'X'),
        categoryId: item.categoryid,
        category: [...item.keywords.split(','), item.category_name],
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.categoryId !== 3) {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);
                    item.description = art(path.join(__dirname, 'templates/home.art'), {
                        summary: item.description,
                        article: $('.article-container').html(),
                    });
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '链捕手ChainCatcher — 专业的区块链技术研究与资讯平台-Chain Catcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: rootUrl,
        item: items,
    };
};
