const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');

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

    const host = `https://${type}.shiep.edu.cn`;
    const id = ctx.params.id || config[type].id;
    const pubDateClass = type === 'dxxy' ? 'div[class="article-publishdate"]' : 'span[class="Article_PublishDate"]'; // 适配电子与信息工程学院网站改版

    const response = await got(`${host}/${id}/list.htm`);

    const $ = cheerio.load(response.data);

    const items = $('.list_item')
        .toArray()
        .filter((item) => {
            const date = dayjs($(item).find(pubDateClass).text().trim());
            return date.isValid();
        })
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title') || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: parseDate(item.find(pubDateClass).text().trim(), 'YYYY-MM-DD'),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    if ($('.wp_articlecontent').length > 0) {
                        item.description = art(path.resolve(__dirname, 'templates/description.art'), {
                            description: $('.wp_articlecontent').html(),
                        });
                    } else {
                        item.description = '请进行统一身份认证后查看内容';
                    }
                } catch (e) {
                    item.description = '请在校内或通过校园VPN查看内容';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '上海电力大学-' + config[type].title,
        link: `${host}/${id}/list.htm`,
        description: '上海电力大学-' + config[type].title,
        item: items,
    };
};
