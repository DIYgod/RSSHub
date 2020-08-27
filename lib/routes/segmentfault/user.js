const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

const host = 'https://segmentfault.com';

module.exports = async (ctx) => {
    const username = ctx.params.name;

    const link = `https://segmentfault.com/u/${username}/articles`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const channel_name = $('h2.profile__heading--name').text().trim().split(' ')[0];

    const list = $('ul.profile-mine__content li')
        .slice(0, 10)
        .map(function () {
            const info = {
                link: $(this).find('a.profile-mine__content--title').attr('href'),
                title: $(this).find('a.profile-mine__content--title').text(),
                author: channel_name,
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);
            const author = info.author;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            let date_value = '';
            let description = '';
            if (info.link.indexOf('p') !== -1) {
                // 分享
                description =
                    $('div.fmt.mb10').html().trim() +
                    $('div.content h3')
                        .html()
                        .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                        .trim();

                const date_list = $('div.news__item-info > p > span').text().trim().split(' ');
                date_list.shift();
                let date_v = '';
                if (date_list.length > 1) {
                    date_v = date_list.join('');
                } else {
                    date_v = date_list[0];
                }
                date_value = date_v.substring(0, date_v.length - 3);
            } else {
                // 文章
                description = $('article.article.fmt.article-content')
                    .html()
                    .replace(/data-src="/g, 'src="https://segmentfault.com')
                    .trim();
                const date_v = $('div.article__authorright > span').text().trim().replace(' ', '');
                date_value = date_v.substring(0, date_v.length - 2);
            }

            const single = {
                title: title,
                link: itemUrl,
                author: author,
                description: description,
                pubDate: date(date_value, 8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${channel_name}-segmentfault`,
        link: link,
        item: out,
    };
};
