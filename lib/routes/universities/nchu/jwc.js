import got from '~/utils/got.js';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

const host = 'http://jwc.nchu.edu.cn';

const map = {
    notice: '3',
    news: '1',
};

export default async (ctx) => {
    const {
        type = 'notice'
    } = ctx.params;
    const link = `${host}/Topic.asp?secondColumnID=${map[type]}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'GBK');
    const $ = cheerio.load(responseHtml);

    const linkList = $('td[width=515]')
        .find('a')
        .slice(0, 10)
        .map((_, e) => ({
            title: $(e).text(),
            link: `${host}/${$(e).attr('href')}`,
        }))
        .get();
    $('td[width=85]')
        .map((i, e) => (linkList[i].pubDate = new Date($(e).text().replace('[', '').replace(']', '').split('/').join('-')).toUTCString()))
        .get();

    let info = '教务公告';
    if (type === 'news') {
        info = '教务新闻';
    }

    ctx.state.data = {
        link,
        title: `南昌航空大学教务处 - ${info}`,
        item: linkList,
    };
};
