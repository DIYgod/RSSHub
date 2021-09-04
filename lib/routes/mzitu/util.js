const got = require('@/utils/got');
const cheerio = require('cheerio');

exports.getItem = async (ctx, data) => {
    const $ = cheerio.load(data);
    const list = $('#pins li').get().slice(0, 5);

    return await Promise.all(
        list.map(async (item) => {
            const title = $(item).find('span > a').text();
            const item_link = $(item).find('span > a').attr('href');

            const cache = await ctx.cache.get(item_link);
            let description;
            if (cache) {
                description = cache;
            } else {
                const response = await got({
                    method: 'get',
                    url: item_link,
                });
                const $ = cheerio.load(response.data);
                const page_lengh = $('div.pagenavi > a:nth-last-child(2) > span').text();

                const pages = Array.from({ length: page_lengh }, (v, i) => i);
                const description_list = await Promise.all(
                    pages.map(async (page) => {
                        const page_link = item_link + '/' + (page + 1).toString();

                        const response = await got({
                            method: 'get',
                            url: page_link,
                        });
                        const $ = cheerio.load(response.data);

                        return `<img src="${$('div.main-image img').attr('src')}"><br>`;
                    })
                );

                description = description_list.join('');
                ctx.cache.set(item_link, description);
            }

            return {
                title,
                description,
                link: item_link,
            };
        })
    );
};
