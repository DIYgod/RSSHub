const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const url = `https://vimeo.com/channels/${channel}/videos`;
    const page1 = await got({
        method: 'get',
        url: `${url}/page:1/sort:date/format:detail`,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const page2 =
        channel === `bestoftheyear`
            ? await got({
                  method: 'get',
                  url: `${url}/page:2/sort:date/format:detail`,
                  headers: {
                      'X-Requested-With': 'XMLHttpRequest',
                  },
              })
            : '';
    const pagedata = page1.data.concat(page2.data);
    const $ = cheerio.load(pagedata);
    const list = $('ol li.clearfix');

    const description = await Promise.all(
        list.get().map(async (item) => {
            item = $(item);
            const link = item.find('.more').attr('href');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url: `https://vimeo.com${link}/description?breeze=1`,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)  ',
                },
            });
            const articledata = response2.data;
            const $2 = cheerio.load(articledata);
            $2('span').remove();
            const description = $2.html();

            ctx.cache.set(link, JSON.stringify(description));
            return Promise.resolve(description);
        })
    );
    ctx.state.data = {
        title: `${channel} | Vimeo channel`,
        link: `${url}`,
        item: list
            .map((index, item) => {
                item = $(item);
                const title = `${item.find('.title a').text()}`;
                const author = `${item.find('.meta a').text()}`;
                return {
                    title: `${title}`,
                    description: `<iframe width="640" height="360" src='https://player.vimeo.com/video${item.find('.more').attr('href')}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>${
                        description[index] ? description[index] : ''
                    }`,
                    pubDate: `${item.find('time').attr('datetime')}`,
                    link: `https://vimeo.com${item.find('.more').attr('href')}`,
                    author: `${author}`,
                };
            })
            .get(),
    };
};
