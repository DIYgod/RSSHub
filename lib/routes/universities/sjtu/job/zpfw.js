const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const subType = ctx.params.subType || 'new';

    const subTypeMap = {
        new: '最新招聘信息',
        allqy: '所有企业',
        gyqy: '国有企业',
        myqy: '民营企业',
        wzqy: '外资企业',
        qtqy: '海外及其他企业',
        alldw: '所有单位',
        sxjz: '实习兼职',
    };

    let request_url;
    let title;
    switch (type) {
        case 'zprd':
            request_url = 'https://www.job.sjtu.edu.cn/eweb/jygl/zpfw.so?modcode=jygl_scfwzpxx&subsyscode=zpfw&type=searchZprd&sysType=TPZPFW';
            title = '招聘热点';
            break;
        case 'zpxx':
            request_url = `https://www.job.sjtu.edu.cn/eweb/jygl/zpfw.so?modcode=jygl_scfwzpxx&subsyscode=zpfw&type=searchZpxx&zpxxType=${subType}`;
            title = `招聘信息-${subTypeMap[subType]}`;
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
        title: `上海交通大学学生就业服务和职业发展中心-${title}`,
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
