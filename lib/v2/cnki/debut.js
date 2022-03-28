const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://chn.oversea.cnki.net';

module.exports = async (ctx) => {
    const { name } = ctx.params;

    const journalUrl = `${rootUrl}/knavi/JournalDetail?pcode=CjFD&pykm=${name}`;
    const title = await got.get(journalUrl).then((res) => cheerio.load(res.data)('head > title').text());

    const outlineUrl = `${rootUrl}/knavi/JournalDetail/GetnfAllOutline`;
    const response = await got({
        method: 'post',
        url: outlineUrl,
        form: {
            pageIdx: '0',
            type: '2',
            pcode: 'CJFD',
            pykm: name,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('dd')
        .map((_, item) => ({
            title: $(item).find('span.name > a').text().trim(),
            link: `${rootUrl}/kcms/detail/${new URLSearchParams(new URL(`${rootUrl}/${$(item).find('span.name > a').attr('href')}`).search).get('url')}.html`,
            pubDate: parseDate($(item).find('span.company').text(), 'YYYY-MM-DD HH:mm:ss'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $ = cheerio.load(detailResponse.data);
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    author: $('h3.author > span')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(' '),
                    company: $('a.author')
                        .map((_, item) => $(item).text())
                        .get()
                        .join(' '),
                    content: $('div.row > span.abstract-text').parent().text(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${title} - 全网首发`,
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
};
