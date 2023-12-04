const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const { limit = '100' } = ctx.query;
    const baseUrl = 'https://www.i-cable.com';

    let link;
    let id;
    if (category) {
        const categoryDetail = await ctx.cache.tryGet(`i-cable:category:${category}`, async () => {
            const { data: res } = await got(`${baseUrl}/wp-json/wp/v2/categories`, {
                searchParams: {
                    search: category,
                },
            });
            const data = res[0];
            if (!data) {
                throw Error('Invalid category');
            }
            return {
                id: data.id,
                link: data.link,
            };
        });
        id = categoryDetail.id;
        link = categoryDetail.link;
    }

    const { data: response } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: limit,
            categories: id,
            _embed: 1,
        },
    });

    const items = response.map((item) => {
        const $ = cheerio.load(item.content.rendered, null, false);
        $('img').each((_, img) => {
            img = $(img);
            const src = img.attr('src');
            if (src.match(/-\d+x\d+.(jpg|png)$/)) {
                img.attr('src', src.replace(/-\d+x\d+.(jpg|png)$/, '.$1'));
            }
            img.removeAttr('srcset');
        });
        return {
            title: item.title.rendered,
            description: art(join(__dirname, 'templates/desc.art'), {
                content: $.html(),
                imgs: item.yoast_head_json.og_image.map((img) => img.url).filter((i) => !i.endsWith('Open-Graph-2.png')),
            }),
            pubDate: parseDate(item.date_gmt), // 2023-05-11T15:07:51
            updated: parseDate(item.modified_gmt),
            guid: item.guid.rendered,
            link: item.link,
            author: item._embedded.author.map((author) => author.name).join(', '),
            category: item._embedded['wp:term'][0].map((category) => category.name),
        };
    });

    ctx.state.data = {
        title: `${category || '主頁'} | 有線寬頻 i-CABLE`,
        description: '24小時無間斷緊貼香港本地及國際新聞，即時報道新聞事件的最新發展。內容包括時事、財經、體育、天氣消息等多元化資訊。',
        image: 'https://icable-prod.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/05/19010704/Open-Graph-1.png',
        link: link || baseUrl,
        item: items,
    };
};
