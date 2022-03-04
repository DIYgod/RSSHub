const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const subpath = ctx.params.subpath;

    const url = `http://dean.xjtu.edu.cn/${subpath.replace(/\.htm/g, '')}.htm`;
    const base = url.split('/').slice(0, -1).join('/');

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const subname = $('em.ma-nav a')
        .slice(1)
        .map(function () {
            return $(this).text();
        })
        .get()
        .join(' - ');

    const list = $('.list_main_content > .list-li').get();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const info = $('.detail_main_content > h1')
            .contents()
            .filter(function () {
                return this.nodeType === 3;
            })
            .map(function () {
                return $(this).text().trim();
            })
            .get();

        const content = $('[id^="vsb_content"]');
        $('form > div > ul a').each(function () {
            $(this).appendTo(content);
            $('<br>').appendTo(content);
        });

        return {
            author: info[0] || '教务处',
            description: content.html(),
            pubDate: new Date(info[1]),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('a');
            const link = new URL(title.attr('href'), base).href;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                link,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);

                rssitem.description = result.description;
                rssitem.author = result.author;
                rssitem.pubDate = result.pubDate;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `西安交大教务处 - ${subname}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
