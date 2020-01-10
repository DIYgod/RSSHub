const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = 'http://www.wineyun.com/' + category;
    const flag = category === 'csborder';

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.wineyun.com',
        },
    });

    const $ = cheerio.load(response.data);

    const $list = !flag
        ? $('div.groupinfo')
              .slice(0, 10)
              .get()
        : $('div a.topitem')
              .slice(0, 10)
              .get();

    const description = $('head title');

    const resultItem = await Promise.all(
        $list.map(async (item) => {
            const title = !flag
                ? $(item)
                      .find('h1.bti')
                      .text()
                      .trim()
                : $(item).attr('title');
            const itemPicUrl = item.find('div.fl img').attr('src');
            const href = !flag
                ? $(item)
                      .find('dt.fl a')
                      .attr('href')
                : $(item).attr('href');
            const price = !flag
                ? $(item)
                      .find('dt.fl a i.fl')
                      .text()
                      .trim()
                : $(item)
                      .find('span.price')
                      .text()
                      .trim();

            const itemDetailurl = 'http://www.wineyun.com' + href;

            const cache = await ctx.cache.get(itemDetailurl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title: `${price} ${title}`,
                link: itemDetailurl,
                description: '',
            };

            const detail = await got({
                method: 'get',
                url: itemDetailurl,
                headers: {
                    Referer: 'http://www.wineyun.com',
                },
            });

            {
                const detailData = detail.data;
                const $ = cheerio.load(detailData);
                $('div#htmlDetails p img').replaceWith('');
                single.description = `<img src ="${itemPicUrl}"><br>` + $('div#htmlDetails').html();
            }

            ctx.cache.set(itemDetailurl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '酒云网-最新商品',
        link: url,
        item: resultItem,
        description: description,
    };
};
