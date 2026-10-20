import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { fetchFeed } from './utils';

const categories = {
    bkspy_gjjl: '本科生培养 - 国际交流',
    bsyjs_zsgz: '研究生培养 - 招生工作',
    bsyjs_xjgl: '研究生培养 - 学籍管理',
    bsyjs_pygl: '研究生培养 - 培养管理',
    bsyjs_xwgl: '研究生培养 - 学位管理',
    bsyjs_dbgg: '研究生培养 - 答辩公告',
    bsyjs_gjjl: '研究生培养 - 国际交流',
    bsyjs_jssw: '研究生培养 - 教师事务',
    bsyjs_notice: '研究生培养 - 通知公告',
    wzypy: '微专业培养',
    jxsj_kcsj_prp: '教学实践 - 科创实践项目 - PRP 项目',
    jxsj_kcsj_zysx: '教学实践 - 科创实践项目 - 专业实习',
    jxsj_xskczz: '教学实践 - 学生科创组织',
    'xsgz-tzgg-djdy': '学生工作 - 通知公告 - 党建德育',
    'xsgz-tzgg-txgz': '学生工作 - 通知公告 - 团学工作',
    'xsgz-tzgg-xssw': '学生工作 - 通知公告 - 学生事务',
    'xsgz-tzgg-zyfz': '学生工作 - 通知公告 - 职业发展',
    'xsgz-gzzd-xssw': '学生工作 - 规章制度 - 学生事务',
    'xsgz-gzzd-zyfz': '学生工作 - 规章制度 - 职业发展',
};

export const route: Route = {
    path: '/cs/rcpy/:category',
    categories: ['university'],
    example: '/sjtu/cs/rcpy/bsyjs_notice',
    parameters: {
        category: '栏目代码，见下表，与官网栏目网址中 .html 前的部分一致',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: Object.entries(categories).map(([code, name]) => ({
        title: `计算机学院 - 人才培养 - ${name}`,
        source: [`www.cs.sjtu.edu.cn/${code}.html`, `cs.sjtu.edu.cn/${code}.html`],
        target: `/cs/rcpy/${code}`,
    })),
    name: '计算机学院 - 人才培养',
    maintainers: ['BeaCox'],
    handler: (ctx) => {
        const category = ctx.req.param('category');
        if (!category || !Object.hasOwn(categories, category)) {
            throw new InvalidParameterError(`Unknown category: ${category}. Valid categories: ${Object.keys(categories).join(', ')}`);
        }
        return fetchFeed(category, `人才培养 - ${categories[category]}`);
    },
    url: 'www.cs.sjtu.edu.cn/rcpy.html',
    description: `订阅「人才培养」下指定栏目的第一页文章。

仅获取未登录时可见的列表和正文。需要 jAccount 登录或无法获取全文的文章保留公开标题、发布日期和原文链接。栏目没有公开条目时无法生成订阅。

| 栏目 | category |
| ---- | -------- |
${Object.entries(categories)
    .map(([code, name]) => `| ${name} | ${code} |`)
    .join('\n')}

「学生工作」下「规章制度」中的党建德育、团学工作，以及「管理服务」中的办事指南、日常管理目前没有公开条目，未纳入订阅。

专业介绍、培养方案、课程信息、通知指南、快速链接、教学成果，以及教学实践中的其他介绍页属于静态介绍、课程目录或链接导航，未纳入订阅。`,
};
