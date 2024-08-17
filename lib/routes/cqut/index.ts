import { Route } from "@/types";
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

const host = 'https://www.cqut.edu.cn';
const typeMap = {
    notify: '/tzgg/xxtz1.htm',
    department: '/tzgg/bmtz.htm',
    choice: '/tzgg/bmtz'
};
const departmentMap = {
    educational: '/jwtz.htm',
    scientific: '/kytz.htm',
    graduate: '/yjsytz.htm',
    student: '/xsgztz.htm',
    informatization: '/xxhtz.htm',
    employement: '/zzjytz.htm',
    logisstics: '/jjhqtz.htm',
    // 创新创业通知页面为 "cxcy.htm" 而不是 "cxcytz.htm"
    innovate: '/cxcy.htm',
    library: '/tsgtz.htm',
    security: '/bwctz.htm',
    industry: '/cxytz.htm'
};
const titleMap = {
    notify: '学校通知',
    department: '部门通知'
};
const suffixMap = {
    educational: '教务通知',
    scientific: '科研通知',
    graduate: '研究生院通知',
    student: '学生工作通知',
    informatization: '信息化通知',
    employement: '招生就业通知',
    logisstics: '基建后勤通知',
    innovate: '创新通知',
    library: '图书馆通知',
    security: '保卫处通知',
    industry: '产学研通知'
};

export const route: Route = {
    path: '/inform/:type/:department?',
    categories: ['university'],
    example: '/cqut/inform/department/educational',
    parameters: { type: '通知类型，默认为学校通知', department:'部门，默认为空，仅部门通知有效' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['A-normal'],
    handler,
    description: `| 学校通知 | 部门通知 |
  | -------- | ------------ |
  | notify   |  department  |


  | 教务通知 | 科研通知 | 研究生院通知 | 学生工作通知 | 信息化通知 | 招生就业通知 | 基建后勤通知 | 创新通知 | 图书馆通知 | 保卫处通知 | 产学研通知 |
  | ----------- | ---------- | -------- | ------- | --------------- | ----------- | ---------- | -------- | ------- | -------- | -------- |
  | educational | scientific | graduate | student | informatization | employement | logisstics | innovate | library | security | industry |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'notify';
    const department = type === 'department' ? ctx.req.param('department') ?? '' : '';
    const link = department === '' ? host+typeMap[type] : host + typeMap['choice'] + departmentMap[department];
    const title = '重庆理工' + department === '' ? titleMap[type] : suffixMap[department];
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('div[class="sub_list075 ul-inline"] ul').find('li');
    const items = await Promise.all(
        list.map(async (i, item) => {
            const pageUrl = host + $(item).find('a').attr('href');
            const { desc } = await cache.tryGet(pageUrl, async()=> {
                const page = await got.get(pageUrl);
                const $ = load(page.data);
                return {                
                    desc: $('.Section0').html(),
                };
            });
            return {
                title: $(item).find('.title').text(),
                link: pageUrl,
                description: desc
            };
        })
    );
    return {
        title,
        link,
        item: items
    };
}
