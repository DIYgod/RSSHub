const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { ProcessItem } = require('./utils');

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

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => ProcessItem(item))));

    ctx.state.data = {
        title: String(title),
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
};
