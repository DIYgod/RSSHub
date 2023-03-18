const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const dateRegex = /(20\d{2})\/(\d{2})\/(\d{2})/;

const baseUrl = 'https://www.jwc.uestc.edu.cn/';
const detailUrl = 'https://www.jwc.uestc.edu.cn/info/';

const map = {
    important: 'hard/?page=1',
    student: 'list/256/?page=1',
    teacher: 'list/255/?page=1',
    teach: 'list/40/?page=1',
    office: 'list/ff80808160bcf79c0160c010a8d20020/?page=1',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'important';
    const pageUrl = map[type];
    if (!pageUrl) {
        throw new Error('type not supported');
    }

    const response = await got.get(baseUrl + pageUrl);

    const $ = cheerio.load(response.data);

    const items = $('div.textAreo.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').attr('title');
            const newsLink = detailUrl + item.find('a').attr('newsid');
            const newsDate = parseDate(item.find('i').text().replace(dateRegex, '$1-$2-$3'));

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsDate,
            };
        })
        .get();

    ctx.state.data = {
        title: '教务处通知',
        link: baseUrl,
        description: '电子科技大学教务处通知',
        item: out,
    };
};
