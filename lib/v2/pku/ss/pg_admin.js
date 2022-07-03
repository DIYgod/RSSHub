const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const link = 'http://www.ss.pku.edu.cn';
const host = 'http://www.ss.pku.edu.cn/index.php/admission/admbrochure/admission01';

const getSingleRecord = async () => {
    const res = await got(host);

    const $ = cheerio.load(res.data);
    const list = $('#info-list-ul').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const date = item.find('.time').text();
                return {
                    title: item.find('a').attr('title'),
                    pubDate: parseDate(date),
                    link: link + item.find('a').attr('href'),
                };
            })
            .get()
    );
};

module.exports = async (ctx) => {
    const items = await getSingleRecord();
    const out = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                return {
                    title: item.title,
                    link: item.link,
                    description: $('.article-content').html(),
                    pubDate: item.pubDate,
                };
            })
        )
    );

    ctx.state.data = {
        title: '北大软微-硕士统考招生',
        description: '北京大学软件与微电子学院 - 硕士统考招生通知',
        link: host,
        item: out,
    };
};
