const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got('http://rg.noi.cn/admin/sysSet/newsIndex.php', { responseType: 'buffer' });
    response.data = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(response.data);
    const postList = $('.list-group .list-group-item').get();
    postList.shift();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('a').text();
            const link = $(item).find('a').attr('href').replace('..', 'http://rg.noi.cn/admin');
            const guid = link;
            const pubDate = new Date($(item).find('.badge').text()).toUTCString();

            const single = {
                title,
                link,
                guid,
                pubDate,
                description: '',
            };

            const key = guid;
            const cache = await ctx.cache.get(key);

            if (cache) {
                const value = JSON.parse(cache);

                single.description = value.description;
            } else {
                const temp = await got(link, { responseType: 'buffer' });
                temp.data = iconv.decode(temp.data, 'gbk');
                single.description = $(temp.data).find('.panel-body').html();

                ctx.cache.set(key, {
                    description: single.description,
                });
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '新闻 - NOI 网上报名系统', link: 'http://rg.noi.cn/', item: result };
};
