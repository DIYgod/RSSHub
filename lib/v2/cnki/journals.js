const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { ProcessItem } = require('./utils');

const rootUrl = 'https://navi.cnki.net';

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const journalUrl = `${rootUrl}/knavi/journals/${name}/detail`;
    const title = await got.get(journalUrl).then((res) => cheerio.load(res.data)('head > title').text());

    const yearListUrl = `${rootUrl}/knavi/journals/${name}/yearList?pIdx=0`;

    const { code, date } = await got.get(yearListUrl).then((res) => {
        const $ = cheerio.load(res.data);
        const code = $('.yearissuepage').find('dl').first().find('dd').find('a').first().attr('value');
        const date = parseDate($('.yearissuepage').find('dl').first().find('dd').find('a').first().attr('id').replace('yq', ''), 'YYYYMM');
        return { code, date };
    });

    const yearIssueUrl = `${rootUrl}/knavi/journals/${name}/papers?yearIssue=${code}&pageIdx=0&pcode=CJFD,CCJD`;
    const response = await got.post(yearIssueUrl);

    const $ = cheerio.load(response.data);
    const publications = $('dd');

    const list = publications
        .map((_, publication) => {
            const title = $(publication).find('a').first().text();
            const filename = $(publication).find('b').attr('id');
            const link = `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`;

            return {
                title,
                link,
                pubDate: date,
            };
        })
        .get();

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => ProcessItem(item))));

    ctx.state.data = {
        title: String(title),
        link: journalUrl,
        item: items,
    };
};
