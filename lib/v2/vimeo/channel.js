const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

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
        list.get().map((item) => {
            item = $(item);
            const link = item.find('.more').attr('href');
            return ctx.cache.tryGet(link, async () => {
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
                return $2.html();
            });
        })
    );
    ctx.state.data = {
        title: `${channel} | Vimeo channel`,
        link: url,
        item: list
            .map((index, item) => {
                item = $(item);
                const title = item.find('.title a').text();
                const author = item.find('.meta a').text();
                return {
                    title,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        videoUrl: item.find('.more').attr('href'),
                        vdescription: description[index] ? description[index] : '',
                    }),
                    pubDate: parseDate(item.find('time').attr('datetime')),
                    link: `https://vimeo.com${item.find('.more').attr('href')}`,
                    author,
                };
            })
            .get(),
    };
};
