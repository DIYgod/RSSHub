import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
// import logger from '@/utils/logger';

export const route: Route = {
    path: '/yjsy/news/:type',
    categories: ['university'],
    example: '/ustb/yjsy/news/all',
    parameters: { type: '文章类别' },
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
            source: ['gs.ustb.edu.cn/:type'],
        },
    ],
    name: '研究生院',
    maintainers: ['DA1Y1'],
    handler,
    description: `| 北京科技大学研究生院 | 土木与资源工程学院 | 能源与环境工程学院 | 冶金与生态工程学院 | 材料科学与工程学院 | 机械工程学院 | 自动化学院 | 计算机与通信工程学院 | 数理学院 | 化学与生物工程学院 | 经济管理学院 | 文法学院 | 马克思主义学院 | 外国语学院 | 国家材料服役安全科学中心 | 新金属材料国家重点实验室 | 工程技术研究院 | 钢铁共性技术协同创新中心 | 钢铁冶金新技术国家重点实验室 | 新材料技术研究院 | 科技史与文化遗产研究院 | 顺德研究生院 |
| -------------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------ | ---------- | -------------------- | -------- | ------------------ | ------------ | -------- | -------------- | ---------- | ------------------------ | ------------------------ | -------------- | ------------------------ | ---------------------------- | ---------------- | ---------------------- | ------------ |
| all                  | cres               | seee               | metall             | mse                | me           | saee       | scce                 | shuli    | huasheng           | sem          | wenfa    | marx           | sfs        | ncms                     | skl                      | iet            | cicst                    | slam                         | adma             | ihmm                   | sd           |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const struct = {
        all: {
            selector: {
                list: '.plist li',
            },
            timeSelector: {
                list: '.datatime',
            },
            titleSelector: {
                list: '.adaptitle',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://gs.ustb.edu.cn/index.php/cms/item-list-category-1049?role=3',
            link: 'http://gs.ustb.edu.cn/index.php/cms/item-list-category-1049?role=3',
            name: '最新通知 - 北京科技大学研究生院',
        },
        cres: {
            selector: {
                list: '.centerright_center li',
            },
            timeSelector: {
                list: '.fright',
            },
            titleSelector: {
                list: '.fleft',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://cres.ustb.edu.cn/n44/n47/',
            link: 'http://cres.ustb.edu.cn/n44/n47/',
            name: '通知公告 - 土木与资源工程学院 - 北京科技大学研究生院',
        },
        seee: {
            selector: {
                list: '.list_left2 li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://seee.ustb.edu.cn/xinwengonggao/tongzhigonggao/',
            link: 'http://seee.ustb.edu.cn/xinwengonggao/tongzhigonggao/',
            name: '通知公告 - 能源与环境工程学院 - 北京科技大学研究生院',
        },
        metall: {
            selector: {
                list: '#news-list-title li',
            },
            timeSelector: {
                list: '.date-size',
            },
            titleSelector: {
                list: '.info-size',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://metall.ustb.edu.cn/gg/index.htm',
            link: 'https://metall.ustb.edu.cn/gg/index.htm',
            name: '通知公告 - 冶金与生态工程学院 - 北京科技大学研究生院',
        },
        mse: {
            selector: {
                list: '.ky li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://mse.ustb.edu.cn/xueyuangonggao/',
            link: 'http://mse.ustb.edu.cn/xueyuangonggao/',
            name: '学院公告 - 材料科学与工程学院 - 北京科技大学研究生院',
        },
        me: {
            selector: {
                list: '.list li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://me.ustb.edu.cn/xinwengonggao/tongzhigonggao/',
            link: 'http://me.ustb.edu.cn/xinwengonggao/tongzhigonggao/',
            name: '通知公告 - 机械工程学院 -北京科技大学研究生院',
        },
        saee: {
            selector: {
                list: '.sidebar_b a:gt(1):lt(15)',
            },
            timeSelector: {
                list: '.list_time',
            },
            titleSelector: {
                list: '.list_timu',
            },
            linkSelector: {
                list: 'a',
            },
            url: 'http://saee.ustb.edu.cn/gonggaogongshi/',
            link: 'http://saee.ustb.edu.cn/gonggaogongshi/',
            name: '通知公告 - 自动化学院 - 北京科技大学研究生院',
        },
        scce: {
            selector: {
                list: '.lead li',
            },
            timeSelector: {
                list: '.practice_list_right',
            },
            titleSelector: {
                list: '.practice_list_left',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://scce.ustb.edu.cn/xinwentongzhi/tongzhigonggao/',
            link: 'http://scce.ustb.edu.cn/xinwentongzhi/tongzhigonggao/',
            name: '通知公告 - 计算机与通信工程学院 - 北京科技大学研究生院',
        },
        shuli: {
            selector: {
                list: '.jy-lb li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li p',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://shuli.ustb.edu.cn/tongzhigonggao/',
            link: 'http://shuli.ustb.edu.cn/tongzhigonggao/',
            name: '通知公告 - 数理学院 - 北京科技大学研究生院',
        },
        huasheng: {
            selector: {
                list: '.main_r li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li p',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://huasheng.ustb.edu.cn/tongzhigonggao/',
            link: 'http://huasheng.ustb.edu.cn/tongzhigonggao/',
            name: '通知公告 - 化学与生物工程学院 - 北京科技大学研究生院',
        },
        sem: {
            selector: {
                list: '.sub_002 li',
            },
            timeSelector: {
                list: '.time',
            },
            titleSelector: {
                list: '.title',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://sem.ustb.edu.cn/xwzx/tzgg/index.htm',
            link: 'https://sem.ustb.edu.cn/xwzx/tzgg/index.htm',
            name: '通知公告 - 经济管理学院 - 北京科技大学研究生院',
        },
        wenfa: {
            selector: {
                list: '.list-content-box .specialDate_fontBox',
            },
            timeSelector: {
                list: '.specialTime',
            },
            titleSelector: {
                list: '.specialTime_a',
            },
            linkSelector: {
                list: 'div a',
            },
            url: 'https://wenfa.ustb.edu.cn/tzgg2/tzgg/index.htm',
            link: 'https://wenfa.ustb.edu.cn/tzgg2/tzgg/index.htm',
            name: '通知公告 - 文法学院 - 北京科技大学研究生院',
        },
        marx: {
            selector: {
                list: '.list_l li',
            },
            timeSelector: {
                list: '.time2',
            },
            titleSelector: {
                list: '.list_title',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://marx.ustb.edu.cn/tongzhigonggao/',
            link: 'http://marx.ustb.edu.cn/tongzhigonggao/',
            name: '通知公告 - 马克思主义学院 - 北京科技大学研究生院',
        },
        sfs: {
            selector: {
                list: '.list-unstyled li',
            },
            timeSelector: {
                list: '',
            },
            titleSelector: {
                list: '.text-overflow',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://sfs.ustb.edu.cn/cn/xinwenzhongxin/tongzhigonggao1/',
            link: 'http://sfs.ustb.edu.cn/cn/xinwenzhongxin/tongzhigonggao1/',
            name: '通知公告 - 外国语学院 - 北京科技大学研究生院',
        },
        ncms: {
            selector: {
                list: '.list_l li',
            },
            timeSelector: {
                list: '.right',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://ncms.ustb.edu.cn/tongzhigonggao/',
            link: 'http://ncms.ustb.edu.cn/tongzhigonggao/',
            name: '通知公告 - 国家材料服役安全科学中心 - 北京科技大学研究生院',
        },
        skl: {
            selector: {
                list: '.cultureStudent_top li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li p',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://skl.ustb.edu.cn/xwzx/tzgg/index.htm',
            link: 'https://skl.ustb.edu.cn/xwzx/tzgg/index.htm',
            name: '通知公告 - 新金属材料国家重点实验室 - 北京科技大学研究生院',
        },
        iet: {
            selector: {
                list: 'table tr td table tr td .liststyle:lt(20)',
            },
            timeSelector: {
                list: '.notestyle',
            },
            titleSelector: {
                list: 'td a',
            },
            linkSelector: {
                list: 'td a',
            },
            url: 'http://iet.ustb.edu.cn/articlelist.asp?cateID=1',
            link: 'http://iet.ustb.edu.cn/articlelist.asp?cateID=1',
            name: '通知公告 - 工程技术研究院 - 北京科技大学研究生院',
        },
        cicst: {
            selector: {
                list: '.h_newsbox li',
            },
            timeSelector: {
                list: '.time',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://cicst.ustb.edu.cn/tongzhigonggao/',
            link: 'http://cicst.ustb.edu.cn/tongzhigonggao/',
            name: '通知公告 - 钢铁共性技术协同创新中心 - 北京科技大学研究生院',
        },
        slam: {
            selector: {
                list: '.list li',
            },
            timeSelector: {
                list: 'li p',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'http://slam.ustb.edu.cn/slam//smvc/ListBs-articleList/SNM2015072600000000000011',
            link: 'http://slam.ustb.edu.cn/slam//',
            name: '通知公告 - 钢铁冶金新技术国家重点实验室 - 北京科技大学研究生院',
        },
        adma: {
            selector: {
                list: '.articleList li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://adma.ustb.edu.cn/tzgg/index.htm',
            link: 'https://adma.ustb.edu.cn/tzgg/index.htm',
            name: '通知公告 - 新材料技术研究院 - 北京科技大学研究生院',
        },
        ihmm: {
            selector: {
                list: '.listbox li',
            },
            timeSelector: {
                list: '',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://ihmm.ustb.edu.cn/gg/index.htm',
            link: 'https://ihmm.ustb.edu.cn/gg/index.htm',
            name: '公告 - 科技史与文化遗产研究院 - 北京科技大学研究生院',
        },
        sd: {
            selector: {
                list: '.news_list li',
            },
            timeSelector: {
                list: 'li span',
            },
            titleSelector: {
                list: 'li a',
            },
            linkSelector: {
                list: 'li a',
            },
            url: 'https://sd.ustb.edu.cn/tzgg/index.htm',
            link: 'https://sd.ustb.edu.cn/tzgg/index.htm',
            name: '通知公告 - 顺德研究生院 -  北京科技大学研究生院',
        },
    };

    // 请求
    const url = struct[type].url;
    const response = await got({
        method: 'get',
        responseType: 'buffer', // 转码
        url,
    });

    // 获取response
    const data = type === 'iet' ? iconv.decode(response.data, 'gb2312') : response.data;
    const $ = load(data);
    // logger.info("data:" + data);

    // 获取响应中有用的部分
    const list = $(struct[type].selector.list);
    // logger.info("list:" + list);

    // 处理返回
    return {
        title: struct[type].name,
        link: struct[type].link,
        description: '北京科技大学研究生院',
        item: list.toArray().map((item) => {
            item = $(item);
            // logger.info("item:" + item);

            // time
            let time = item.find($(struct[type].timeSelector.list)).text();
            let date;
            if (time !== '') {
                if (time.includes('[')) {
                    time = time.slice(1, 11);
                }
                date = parseDate(time);
            }
            // logger.info("date:" + date);

            // link
            let link = item.find($(struct[type].linkSelector.list)).attr('href');
            if (link === undefined) {
                link = item.attr('href');
            }
            // logger.info("link:" + link);

            // title
            let title = item.find($(struct[type].titleSelector.list)).clone().children().remove().end().text();
            if (title === '') {
                title = item.find($(struct[type].titleSelector.list)).text();
            }
            // logger.info("title:" + title);
            // logger.info("=====");

            // return
            return date === undefined
                ? {
                      title,
                      description: title,
                      link,
                  }
                : {
                      title,
                      description: title,
                      link,
                      pubDate: date,
                  };
        }),
    };
}
