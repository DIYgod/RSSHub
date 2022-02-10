const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootURL = 'http://www.huizhou.gov.cn';

module.exports = async (ctx) => {
    const cate = ctx.params.category ?? 'zwyw';
    const url = `${rootURL}/zwgk/hzsz/${cate}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const title = $('span#navigation').children('a').last().text();
    const list = $('ul.ul_art_row')
        .map((_, item) => ({
            title: $(item).find('a').text().trim(),
            link: $(item).find('a').attr('href'),
            pubDate: timezone(parseDate($(item).find('li.li_art_date').text().trim()), +8),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                try {
                    item.description = content('div.artContent').html();
                    item.author = content('div.info_fbt')
                        .find('span.ly')
                        .text()
                        .match(/来源：(.*)/)[1];
                    item.pubDate = timezone(
                        parseDate(
                            content('div.info_fbt')
                                .find('span.time')
                                .text()
                                .match(/时间：(.*)/)[1]
                        ),
                        +8
                    );
                } catch (e) {
                    item.description = '';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `惠州市人民政府 - ${title}`,
        link: url,
        item: items,
    };
};
