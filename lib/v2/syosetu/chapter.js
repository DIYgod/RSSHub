const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { CookieJar } = require('tough-cookie');

const cookieJar = new CookieJar();
cookieJar.setCookieSync('over18=yes', 'https://novel18.syosetu.com/');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const limit = parseInt(ctx.query.limit) || 5;
    const link = `https://ncode.syosetu.com/${id}`;
    const $ = cheerio.load(await get(link));

    const title = $('p.novel_title').text();
    const description = $('#novel_ex').html();

    const chapter_list = $('dl.novel_sublist2')
        .map((_, chapter) => {
            const $_chapter = $(chapter);
            const chapter_link = $_chapter.find('a');
            return {
                title: chapter_link.text(),
                link: chapter_link.attr('href'),
                pubDate: timezone(parseDate($_chapter.find('dt').text(), 'YYYY/MM/DD HH:mm'), +9),
            };
        })
        .toArray()
        .sort((a, b) => (a.pubDate <= b.pubDate ? 1 : -1))
        .slice(0, limit);

    const item_list = await Promise.all(
        chapter_list.map((chapter) =>
            ctx.cache.tryGet(chapter.link, async () => {
                chapter.link = `https://ncode.syosetu.com${chapter.link}`;
                const content = cheerio.load(await get(chapter.link));
                chapter.description = content('#novel_honbun').html();
                return chapter;
            })
        )
    );

    ctx.state.data = {
        title,
        description,
        link,
        language: 'ja',
        item: item_list,
    };
};

const get = async (url) => {
    const response = await got({
        method: 'get',
        url,
        cookieJar,
    });

    return response.data;
};
