import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'http://tj.ustb.edu.cn';
const maps = {
    xyxw: '/Class/xyxw/index.htm',
    xshhd: '/Class/xshhd/index.htm',
    csjsxy: '/Class/csjsxy/index.htm',
    xxgcxy: '/Class/xxgcxy/index.htm',
    jjx: '/Class/jjx/index.htm',
    glxy: '/Class/glxy/index.htm',
    clx: '/Class/clx/index.htm',
    jxgcx: '/Class/jxgcx/index.htm',
    hlx: '/Class/hlx/index.htm',
    flx: '/Class/flx/index.htm',
    wyx: '/Class/wyx/index.htm',
    ysx: '/Class/ysx/index.htm',
};

function getNews(data) {
    const $ = load(data);
    return $('div[class="classnews"] ul li a')
        .toArray()
        .map((elem) => ({
            link: baseUrl + elem.attribs.href,
            title: elem.children[0].data,
            pubDate: timezone(parseDate(elem.attribs.href.split('/')[3].split('.')[0].substring(0, 14), 'YYYYMMDDHHmmss'), 8),
        }));
}

export const route: Route = {
    path: '/tj/news/:type?',
    categories: ['university'],
    example: '/ustb/tj/news/all',
    parameters: { type: '默认为 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '天津学院',
    maintainers: ['henbf'],
    handler,
    description: `| 全部 | 学院新闻 | 学术活动 | 城市建设学院 | 信息工程学院 | 经济学院 | 管理学院 | 材料系 | 机械工程系 | 护理系 | 法律系 | 外语系 | 艺术系 |
  | ---- | -------- | -------- | ------------ | ------------ | -------- | -------- | ------ | ---------- | ------ | ------ | ------ | ------ |
  | all  | xyxw     | xshhd    | csjsxy       | xxgcxy       | jjx      | glxy     | clx    | jxgcx      | hlx    | flx    | wyx    | ysx    |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type') || 'all';
    if (!Object.keys(maps).includes(type)) {
        type = 'all';
    }

    const responseData = {
        title: '北京科技大学天津学院新闻动态',
        link: baseUrl,
        item: null,
    };

    if (type === 'all') {
        const all = await Promise.all(
            Object.values(maps).map(async (link) => {
                const response = await got(baseUrl + link);
                const news = getNews(response.data);
                return news;
            })
        );
        responseData.item = all.flat();
    } else {
        const response = await got(baseUrl + maps[type]);
        const news = getNews(response.data);
        responseData.item = news;
    }

    return responseData;
}
