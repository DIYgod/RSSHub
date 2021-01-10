const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got('http://noi.cn/xw/index.shtml', { responseType: 'buffer' });
    const $ = cheerio.load(response.data);
    const postList = $('.news-item').get();
    postList.shift();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('a').text();
            const link = 'http://noi.cn' + $(item).find('a').attr('href');
            const guid = link;
            const pubDate = new Date($(item).find('small').text()).toUTCString();

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: pubDate,
                description: '',
            };

            const key = guid;
            const cache = await ctx.cache.get(key);

            if (cache) {
                const value = JSON.parse(cache);

                single.description = value.description;
            } else {
                const temp = await got(link, { responseType: 'buffer' });
                temp.data = iconv.decode(temp.data, 'utf-8');
                single.description = $(temp.data).find('.right-con').find('.panel-body').html();

                ctx.cache.set(key, {
                    description: single.description,
                });
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '新闻 - NOI 全国青少年信息学奥林匹克竞赛', link: 'http://noi.cn/xw/index.shtml', item: result };
};
