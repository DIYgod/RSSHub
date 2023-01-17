const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const config = {
        dqxy: { title: '电气工程学院', id: '2462' },
        dxxy: { title: '电子与信息工程学院', id: 'tzgg' },
        energy: { title: '能源与机械工程学院', id: '892' },
        fao: { title: '国际交流与合作处（港澳台办公室）', id: 'tzgg' },
        gjjlxy: { title: '国际交流学院', id: 'tzgg' }, // NAME_NOT_RESOLVED
        hhxy: { title: '环境与化学工程学院', id: '1231' },
        jgxy: { title: '经济与管理学院', id: '3633' },
        jjxy: { title: '继续教育学院', id: '2582' },
        jsjxy: { title: '计算机科学与技术学院', id: '973' },
        jwc: { title: '教务处', id: '227' },
        kyc: { title: '科研处', id: '834' },
        news: { title: '新闻网', id: 'notice' },
        rsc: { title: '党委教师工作部、人事处', id: '1695' },
        skb: { title: '马克思主义学院', id: '1736' },
        slxy: { title: '数理学院', id: '2063' },
        tyb: { title: '体育学院', id: '2891' },
        wgyxy: { title: '外国语学院', id: 'tzgg' },
        xxgk: { title: '信息公开网', id: 'zxgkxx' },
        yjsc: { title: '研究生院/研工部', id: '1161' },
        yjzx: { title: '人文艺术学院', id: '3089' }, // NAME_NOT_RESOLVED
        zdhxy: { title: '自动化工程学院', id: '2002' },
        zs: { title: '本科招生网', id: 'zxxx' },
    };

    if (!Object.keys(config).includes(type)) {
        throw Error('Invalid type');
    }

    const id = ctx.params.id ?? config[type].id;

    const response = await got({
        method: 'get',
        url: `https://${type}.shiep.edu.cn/${id}/list.htm`,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const class_name = 'list_item';
    const pubDateClass = type === 'dxxy' ? 'div[class="article-publishdate"]' : 'span[class="Article_PublishDate"]'; // 适配电子与信息工程学院网站改版
    const list = $(`.${class_name}`);

    ctx.state.data = {
        title: '上海电力大学-' + config[type].title,
        link: `https://${type}.shiep.edu.cn/${id}/list.htm`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                        pubDate: parseDate(item.find(pubDateClass).text().trim(), 'YYYY-MM-DD'),
                    };
                })
                .get(),
    };
};
