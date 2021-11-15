import got from '~/utils/got.js';
import cheerio from 'cheerio';

const baseUrl = 'http://kjt.sc.gov.cn';
const dateRegex = /\((\d{4})-(\d{2})-(\d{2})\)/;

const map = {
    tz: '/tz/index.jhtml',
    gs: '/gs/index.jhtml',
};

export default async (ctx) => {
    const {
        type = 'tz'
    } = ctx.params;

    const {
        data
    } = await got({
        method: 'get',
        url: baseUrl + map[type],
    });
    const $ = cheerio.load(data);
    ctx.state.data = {
        title: '四川省科学技术厅',
        link: baseUrl,
        item: $('div[class="news_middle_top"]')
            .next('div')
            .children('h2')
            .slice(0, 15)
            .map((_, elem) => ({
                link: baseUrl + $(elem).children('a').attr('href'),
                title: $(elem).children('a').text(),
                pubDate: new Date($(elem).children('span').text().replace(dateRegex, '$1-$2-$3')).toUTCString(),
            }))
            .get(),
    };
};
