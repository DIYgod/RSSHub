import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const urlRoot = 'https://jwc.sjtu.edu.cn';

class CampusAccessError extends Error {}

async function getFullArticle(link) {
    const response = await got(link);
    if (!response) {
        return null;
    }
    const $ = load(response.body);
    if ($('title').text() === '系统提示' && $('body').text().includes('该栏目内容已设置访问权限，请切换到校内IP访问。')) {
        throw new CampusAccessError(`Article ${link} requires a campus IP address; open the original page from the campus network.`);
    }
    const content = $('.content-con');
    if (content.length === 0) {
        return null;
    }
    return content.html()! + ($('.Newslist2').length ? $('.Newslist2').html() : '')!;
}

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/sjtu/jwc',
    parameters: { type: '默认为 notice' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处通知公告',
    maintainers: ['SeanChao'],
    handler,
    description: `| 新闻中心 | 通知通告 | 教学运行  | 注册学务 | 研究办 | 教改办 | 综合办 | 语言文字 | 工会与支部 | 通识教育 | 面向学生的通知 |
| -------- | -------- | --------- | -------- | ------ | ------ | ------ | -------- | ---------- | -------- | -------------- |
| news     | notice   | operation | affairs  | yjb    | jgb    | zhb    | language | party      | ge       | students       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'notice';
    const config = {
        all: {
            section: '通知通告',
            link: '/xwtg/tztg.htm',
        },
        news: {
            link: '/xwtg/xwzx.htm',
            section: '新闻中心',
        },
        notice: {
            link: '/xwtg/tztg.htm',
            section: '通知通告',
        },
        operation: {
            link: '/xwtg/jxyx.htm',
            section: '教学运行',
        },
        affairs: {
            link: '/xwtg/zcxw.htm',
            section: '注册学务',
        },
        yjb: {
            link: '/xwtg/yjb.htm',
            section: '研究办',
        },
        jgb: {
            link: '/xwtg/jgb.htm',
            section: '教改办',
        },
        zhb: {
            link: '/xwtg/zhb.htm',
            section: '综合办',
        },
        language: {
            link: '/xwtg/yywz.htm',
            section: '语言文字',
        },
        party: {
            link: '/xwtg/ghyzb.htm',
            section: '工会与支部',
        },
        ge: {
            link: '/xwtg/tsjy.htm',
            section: '通识教育',
        },
        students: {
            link: '/index/mxxsdtz.htm',
            section: '面向学生的通知',
        },
    };

    const sectionLink = urlRoot + config[type].link;

    const response = await got({
        method: 'get',
        url: sectionLink,
    });

    const $ = load(response.body);

    const out = await pMap(
        $('body > div.list-box > div.container > div > div.ny_right > div > div.ny_right_con > div > ul').find('li').toArray(),
        async (e) => {
            const info = $(e).find('.wz');
            const relativeLink = info.find('a').attr('href');
            const link = new URL(relativeLink!, sectionLink).href;
            const title = info.find('a > h2').text();
            const timeElement = $(e).find('.sj');
            const day = timeElement.find('h2').text();
            const yearAndMonth = timeElement.find('p').text();
            const pubDate = yearAndMonth && day ? parseDate(`${yearAndMonth}.${day} +0000`, 'YYYY.MM.DD ZZ') : undefined;
            const articlePromise = cache.tryGet(`sjtu:jwc:details:v4:${link}`, async () => ({ description: await getFullArticle(link) }));
            let detailResult;
            try {
                detailResult = await articlePromise;
            } catch (error) {
                if (error instanceof CampusAccessError) {
                    return { title, link, pubDate };
                }
                throw error;
            }
            {
                const details = detailResult;
                return { title, link, pubDate, ...details };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '上海交通大学教务处 ' + config[type].section,
        link: sectionLink,
        item: out,
    };
}
