const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword && ctx.params.keyword !== 'all' && ctx.params.keyword !== '全部' ? ctx.params.keyword : '';

    const url = 'https://www.haohaozhu.cn/community/whole-house';

    const response = await got({
        method: 'post',
        url: 'https://www.haohaozhu.cn/f/y/api/Share/GetArticle',
        headers: {
            Referer: url,
        },
        form: {
            keyword: keyword,
            page: 1,
        },
    });

    const list = response.data.data.rows;

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const content = $('.whole-header').parent();
        $('.whole-title').remove();
        $('.whole-user').remove();
        $('.question').appendTo(content);

        return {
            description: content.html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item, index) => {
            const link = `https://www.haohaozhu.cn/community/whole-house-detail/${item.article_id}`;

            const time = new Date();
            time.setMinutes(time.getMinutes() - index);

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: item.article_info.title,
                link: link,
                author: item.user_info.nick,
                pubDate: time,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);
                if (!result.description) {
                    return Promise.resolve('');
                }
                rssitem.description = result.description;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `好好住 - 整屋案例${keyword ? ' - ' + keyword : ''}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
