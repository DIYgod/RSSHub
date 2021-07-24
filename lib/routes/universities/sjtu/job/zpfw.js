const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const subType = ctx.params.subType || 'new';

    let request_url;
    switch (type) {
        case 'zprd':
            request_url = 'https://www.job.sjtu.edu.cn/eweb/jygl/zpfw.so?modcode=jygl_scfwzpxx&subsyscode=zpfw&type=searchZprd&sysType=TPZPFW';
            break;
        case 'zpxx':
            request_url = `https://www.job.sjtu.edu.cn/eweb/jygl/zpfw.so?modcode=jygl_scfwzpxx&subsyscode=zpfw&type=searchZpxx&zpxxType=${subType}`;
            break;
        default:
            throw Error(`Type Not Found - ${type}`);
    }
    const list_response = await got.get(request_url);

    const $ = cheerio.load(list_response.data);
    const list = $('div.z_newsl ul li')
        .slice(1)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            const content_id = a.attr('onclick').match(/viewZpxx\('(\w+)',/)[1];
            const date = parseDate(item.find('div').eq(1).text());
            return {
                title: a.text(),
                link: `https://www.job.sjtu.edu.cn/eweb/jygl/zpfw.so?modcode=jygl_scfwzpxx&subsyscode=zpfw&type=view&id=${content_id}`,
                pubDate: date,
            };
        })
        .get();

    ctx.state.data = {
        title: '上海交通大学学生就业服务和职业发展中心',
        link: request_url,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const res = await got.get(item.link);
                        const content = cheerio.load(res.data);
                        item.description = content('div#divnr').html();
                        return item;
                    })
            )
        ),
    };
};
