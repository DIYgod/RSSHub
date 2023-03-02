const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const zlib = require('zlib');

const categories = {
    '': {
        id: 'feed',
        title: '首页',
    },
    article: {
        id: 'feed',
        title: '文章',
    },
    news: {
        id: 'news',
        title: '快讯',
    },
    column: {
        id: 'articles',
        title: '专栏',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const id = ctx.params.id ?? '1';

    const rootUrl = 'https://foresightnews.pro';
    const currentUrl = `${rootUrl}/v1/${categories[category].id}?page=1&size=${ctx.query.limit ?? 30}${category === 'column' ? `&column_id=${id}` : ''}`;

    const response = await got(currentUrl);

    const list = JSON.parse(zlib.inflateSync(Buffer.from(response.data.data.list, 'base64')).toString());

    let items = list.map((item) =>
        item.source_type
            ? {
                  type: item.source_type,
                  title: item[item.source_type].title,
                  author: item[item.source_type]?.author?.username ?? undefined,
                  link: `${rootUrl}/${item.source_type}/detail/${item.source_id}`,
                  category: item[item.source_type].tags ? item[item.source_type].tags.map((tag) => tag.name) : undefined,
                  description: item[item.source_type]?.content ?? '',
                  pubDate: parseDate(item[item.source_type].publishDate),
              }
            : {
                  type: category,
                  title: item.title,
                  author: item.author?.username ?? undefined,
                  link: `${rootUrl}/${category === 'article' || category === 'column' ? 'article' : 'news'}/detail/${item.id}`,
                  category: item.tags ? item.tags.map((tag) => tag.name) : undefined,
                  description: item.content ?? '',
                  pubDate: parseDate(item.publishDate),
              }
    );

    if (category === 'article') {
        items = items.filter((item) => item.type === 'article');
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.type !== 'news') {
                    const detailResponse = await got(item.link);

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.detail-body').html();
                }

                delete item.type;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${categories[category].title} - Foresight News`,
        link: currentUrl,
        item: items,
    };
};
