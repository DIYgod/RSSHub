const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { data } = await got('https://www3.nhk.or.jp/news/easy/news-list.json');
    const dates = data[0];

    let items = Object.values(dates).reduce((acc, articles) => {
        for (const article of articles) {
            const date = timezone(parseDate(article.news_prearranged_time), +9);

            acc.push({
                title: article.title,
                description: art(path.join(__dirname, 'templates/news_web_easy.art'), {
                    title: article.title_with_ruby,
                    image: article.news_web_image_uri,
                }),
                guid: article.news_id,
                pubDate: date,
                link: `https://www3.nhk.or.jp/news/easy/${article.news_id}/${article.news_id}.html`,
            });
        }
        return acc;
    }, []);

    items = items.sort((a, b) => b.pubDate - a.pubDate).slice(0, ctx.query.limit ? Number(ctx.query.limit) : 30);

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);
                item.description += $('.article-body').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'NEWS WEB EASY',
        link: 'https://www3.nhk.or.jp/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。',
        item: items,
    };
};
