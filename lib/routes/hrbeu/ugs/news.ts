import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://ugs.hrbeu.edu.cn';

const authorMap = {
    gztz: {
        all: '/2821',
    },
    jwc: {
        all: '/jwc',
        jxap: '/2847',
        ksgl: '/2895',
        xjgl: '/2902',
        wytk: '/2897',
        cjgl: '/2901',
    },
    sjjxyjlc: {
        all: '/3206',
        syjx: '/2847',
        sysjs: '/sysjs',
        xwsx: '/2909',
        xwlw: '/2910',
        kcsj: '/2911',
        cxcy: '/2913',
        xjjl: '/xjjl',
    },
    jypgc: {
        all: '/3207',
        jxyjyjxcg: '/2916',
        zljk: '/2917',
    },
    zyjsc: {
        all: '/3208',
        zyyjcjs: '/2914',
        cgsyb: '/2925',
        jxmsyyxzjjs: '/2918',
        ktjs: '/2919',
        syjx: '/2920',
    },
    gjdxswhszjd: {
        all: '/3209',
    },
    jsjxfzzx: {
        all: '/3210',
        jspx: '/2915',
    },
    zhbgs: {
        all: '/3211',
        lxkc: '/lxkc',
    },
};

export const route: Route = {
    path: '/ugs/news/:author?/:category?',
    categories: ['university'],
    example: '/hrbeu/ugs/news/jwc/jxap',
    parameters: { author: '发布部门，默认为 `gztz`', category: '分类，默认为 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ugs.hrbeu.edu.cn/:author/list.htm'],
            target: '/ugs/news/:author',
        },
    ],
    name: '本科生院工作通知',
    maintainers: ['XYenon'],
    handler,
    description: `author 列表：

| 教务处 | 实践教学与交流处 | 教育评估处 | 专业建设处 | 国家大学生文化素质基地 | 教师教学发展中心 | 综合办公室 | 工作通知 |
| ------ | ---------------- | ---------- | ---------- | ---------------------- | ---------------- | ---------- | -------- |
| jwc    | sjjxyjlzx        | jypgc      | zyjsc      | gjdxswhszjd            | jsjxfzzx         | zhbgs      | gztz     |

  category 列表：

  \`all\` 为全部

  教务处：

| 教学安排 | 考试管理 | 学籍管理 | 外语统考 | 成绩管理 |
| -------- | -------- | -------- | -------- | -------- |
| jxap     | ksgl     | xjgl     | wytk     | cjgl     |

  实践教学与交流处：

| 实验教学 | 实验室建设 | 校外实习 | 学位论文 | 课程设计 | 创新创业 | 校际交流 |
| -------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| syjx     | sysjs      | xwsx     | xwlw     | kcsj     | cxcy     | xjjl     |

  教育评估处：

| 教学研究与教学成果 | 质量监控 |
| ------------------ | -------- |
| jxyjyjxcg          | zljk     |

  专业建设处：

| 专业与教材建设 | 陈赓实验班 | 教学名师与优秀主讲教师 | 课程建设 | 双语教学 |
| -------------- | ---------- | ---------------------- | -------- | -------- |
| zyyjcjs        | cgsyb      | jxmsyyxzjjs            | kcjs     | syjx     |

  国家大学生文化素质基地：无

  教师教学发展中心：

| 教师培训 |
| -------- |
| jspx     |

  综合办公室：

| 联系课程 |
| -------- |
| lxkc     |

  工作通知：无`,
};

async function handler(ctx) {
    const author = ctx.req.param('author') || 'gztz';
    const category = ctx.req.param('category') || 'all';
    const link = baseUrl + authorMap[author][category] + '/list.htm';
    const response = await got(link, {
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(response.data);

    const list = $('.wp_article_list_table .border9')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('a').attr('title'),
                link: new URL(e.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(e.find('.date').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('.htm')) {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.description = $('.wp_articlecontent').html().trim();
                } else {
                    item.description = '此链接为文件，请点击下载';
                }
                return item;
            })
        )
    );

    return {
        title: '哈尔滨工程大学本科生院工作通知',
        link,
        item: out,
    };
}
