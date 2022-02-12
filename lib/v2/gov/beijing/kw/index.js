const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'http://kw.beijing.gov.cn';

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const url = `${rootUrl}/col/${channel}/index.html`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const title = $('a.bt_link').last().text().replace('>', '');
    const dataJs = $('div.left.zhengce_right > script[language="javascript"]').html() ? $('div.left.zhengce_right > script[language="javascript"]').html() : $('div.centent_width > script[language="javascript"]').html();
    let items = dataJs
        .match(/urls\[i]='(.*?)';headers\[i]="(.*?)";year\[i]='(\d+)';month\[i]='(\d+)';day\[i]='(\d+)';/g)
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .map((item) => {
            const result = item.match(/urls\[i]='(.*?)';headers\[i]="(.*?)";year\[i]='(\d+)';month\[i]='(\d+)';day\[i]='(\d+)';/);
            return {
                title: cheerio.load(result[2])('a').attr('title') || result[2],
                link: `${rootUrl}${result[1]}`,
                pubDate: parseDate(`${result[3]}-${result[4]}-${result[5]}`, 'YYYY-MM-DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const content = await got.get(item.link);
                const $ = cheerio.load(content.data);
                item.description = $('#zoom').html() ? $('#zoom').html() : $('div.left.zhengce_right').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `北京市科学技术委员会、中关村科技园区管理委员会 - ${title}`,
        link: url,
        item: items,
    };
};
