const url = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');

const processPages = ({ list, caches, host, department }) =>
    Promise.all(
        list.map(async (item) => {
            const { path, title, author } = item;
            const link = path.indexOf('http://') === -1 ? host + path : path;
            const cache = await caches.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: host,
                },
            });

            const $ = cheerio.load(response.data);
            let dateString = '';
            switch (department) {
                case 'grs':
                    dateString = $('#times').text().slice(5);
                    break;
                case 'home':
                    dateString = $('.dateAadDian').text().slice(6, 17).replace(/年/, '-').replace(/月/, '-').replace(/日/, '');
                    break;
                case 'jwc':
                    dateString = $('.taitshj').text().slice(5, 15);
            }
            let description =
                $('.v_news_content').html() &&
                $('.v_news_content')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();
            if (department === 'jwc' && $('#vsb_content').siblings().has('ul li').length > 0) {
                const attachment = $('#vsb_content')
                    .siblings('ul')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();
                description = description.concat('\n' + attachment);
            }
            const single = {
                pubDate: new Date(dateString).toUTCString(),
                author,
                link,
                title,
                description,
            };
            caches.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

module.exports = {
    processPages,
};
