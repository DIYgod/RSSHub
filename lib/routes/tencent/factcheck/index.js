const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://vp.fact.qq.com/loadmore?artnum=0&page=0&callback=';

    const list_res = await got.get(url);
    const list = list_res.data.content;

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);
        let content = cheerio.load('<div></div>');
        content = content('div');
        $('.subtitle.text').appendTo(content);
        $('.check_content.text').appendTo(content);
        $('.information').appendTo(content);
        content.find('.point_num').remove();
        content.find('.check_content_bottom').remove();
        content.find('li').removeAttr('style');
        return {
            description: content.html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const title = `${item.result}/${item.explain} - ${item.title}`;
            const link = `https://vp.fact.qq.com/article?id=${item.id}`;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title,
                link: link,
                author: item.author,
                pubDate: new Date(item.date),
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
        title: '腾讯新闻较真查证平台',
        link: 'https://vp.fact.qq.com/',
        item: out.filter((item) => item !== ''),
    };
};
