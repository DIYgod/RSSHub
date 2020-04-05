
const got = require('@/utils/got');
const cheerio = require('cheerio');
const topics = {
  lingyishijian:'灵异事件',
  lingyijingli:'亲身经历',
  lingyiqiuzhu:'灵异求助',
  lingyitupian:'灵异图片',
  lingyishipin:'亲身视频',
  guihualianpian:'鬼话连篇',
  minjianqitan:'民间奇谈',
  qiwenyishi:'奇闻异事',
  tansuofaxian:'探索发现'
};

module.exports = async (ctx) => {
    const type = ctx.params.topics;
    const url = `http://www.lingyi.org/topics/${type}`;
    const res = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(res.data);
    const items = await Promise.all(
        $('#post-list > ul > li')
            .get()
            .map(async (li) => {
                const title = $(li).find('h2> a').text();
                const link = $(li).find('h2> a').attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const res = await got.get(link);
                    const $ = cheerio.load(res.data);
                    return $('.entry-content').html();
                });
                return Promise.resolve({
                    title: title,
                    description: description,
                    author: $(li).find('.post-list-meta-user > a > span').text(),
                    link: link,
                    pubDate: new Date($(li).find('time').attr('datetime')).toUTCString(),
                });
            })
    );
    ctx.state.data = {
        title:  `${topics[type]} - 中国灵异网`,
        link: url,
        description: `${topics[type]} - 中国灵异网`,
        item: items,
    };
};
