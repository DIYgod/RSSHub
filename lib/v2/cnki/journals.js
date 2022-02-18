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

    const yaerListUrl = `${rootUrl}/knavi/JournalDetail/GetJournalYearList?pcode=CJFD&pykm=${name}&pIdx=0`;
    const journalsInfo = await got.get(yaerListUrl).then((res) => {
        const $ = cheerio.load(res.data);
        const date = $('dd').find('a').first().attr('id').replace('yq', '');
        const year = date.substring(0, 4);
        const issue = date.substring(4);

        return {
            year,
            issue,
            date,
        };
    });

    const papersUrl = `${rootUrl}/knavi/JournalDetail/GetArticleList?year=${journalsInfo.year}&issue=${journalsInfo.issue}&pykm=${name}&pageIdx=0&pcode=CjFD`;
    const list = await got.get(papersUrl).then((res) => {
        const $ = cheerio.load(res.data);
        const item = $('span.name')
            .map((_, item) => {
                const url = new URL(`${rootUrl}/${$(item).find('a').attr('href')}`);
                const urlParams = new URLSearchParams(url.search);

                return {
                    title: $(item).find('a').text().trim(),
                    link: `${rootUrl}/kcms/detail/detail.aspx?dbcode=${urlParams.get('dbCode')}&filename=${urlParams.get('filename')}`,
                    pubDate: parseDate(journalsInfo.date, 'YYYYMM'),
                };
            })
            .get();

        return item;
    });

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
        title: String(title),
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
};
