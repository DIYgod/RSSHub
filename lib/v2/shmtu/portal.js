const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const bootstrapHost = 'https://weixin.shmtu.edu.cn/dynamic/shmtuHttps';
const host = 'https://portal.shmtu.edu.cn/api';

const loadDetail = async (link) => {
    const response = await got.post(bootstrapHost, {
        form: {
            interfaceUrl: link,
        },
        https: { rejectUnauthorized: false },
    });

    return JSON.parse(response.data);
};

const processFeed = (list, caches) =>
    Promise.all(
        list.map((item) =>
            caches.tryGet(item.link, async () => {
                const detail = await loadDetail(item.link);
                item.description = detail.body.und[0].safe_value;
                item.link = detail.path;
                return item;
            })
        )
    );

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let info;
    switch (type) {
        case 'bmtzgg':
            info = '部门通知公告';
            break;
        case 'xsydxhdgg':
            info = '学术与大型活动公告';
            break;
        case 'bmdt':
            info = '部门动态';
            break;
        default:
            info = '未知';
            break;
    }

    const response = await got.post(bootstrapHost, {
        form: {
            interfaceUrl: `${host}/${type}.json?page=0`,
        },
        https: { rejectUnauthorized: false },
    });

    const list = JSON.parse(response.data).map((item) => ({
        title: cheerio.load(item.title).text(),
        link: `${host}/node/${item.nid}.json`,
        pubDate: timezone(parseDate(item.created), 8),
        category: item.field_department[0],
        author: item.field_department[0],
    }));

    const result = await processFeed(list, ctx.cache);

    ctx.state.data = {
        title: `上海海事大学 ${info}`,
        link: 'https://portal.shmtu.edu.cn/bumentongzhigonggao',
        description: '上海海事大学 数字平台',
        item: result,
    };
};
