const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let typeUrl = '0!0!0!0!0!!!!1!-1!1';
    let typeName = '全部推荐';

    const type = ctx.params.type;
    if (type === 'home') {
        typeUrl = '0!0!0!0!0!!!!3!-1!1';
        typeName = '首页推荐';
    } else if (type === 'edit') {
        typeUrl = '0!0!0!0!0!!!!2!-1!1';
        typeName = '编辑推荐';
    } else if (type === 'article') {
        typeUrl = '0!8!0!0!0!!!!3!-1!1';
        typeName = '文章推荐';
    }

    const url = 'https://www.zcool.com.cn/discover/' + typeUrl;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('.work-list-box > .card-box')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('.card-info-title').find('a').attr('title').trim();
            const link = element.find('.card-info-title').find('a').attr('href').trim();
            const author = element.find('.user-avatar').find('a').attr('title');

            return {
                title: title,
                description: '',
                link: link,
                author: author,
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            // item.description = itemElement('.work-content-wrap').html();
            item.description = type !== 'article' ? itemElement('div.work-content-wrap').html() : itemElement('div.article-content-wraper').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '站酷 - ' + typeName,
        link: url,
        item: result,
    };
};
