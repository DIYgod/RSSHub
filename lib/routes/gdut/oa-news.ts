import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import wait from '@/utils/wait';
import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import asyncPool from 'tiny-async-pool';

const site = 'https://oas.gdut.edu.cn/seeyon';
const typeMap = {
    news: {
        id: '-4899485396563308862',
        name: '校内简讯',
        publish: false,
    },
    notice: {
        id: '5854888065150372255',
        name: '校内通知',
        publish: false,
    },
    announcement: {
        id: '5821359576359193913',
        name: '公示公告',
        publish: false,
    },
    tender_result: {
        id: '-1226046021292568614',
        name: '招标结果',
        publish: true,
    },
    tender_invite: {
        id: '-3656117696093796045',
        name: '招标公告',
        publish: true,
    },
};

function getArg(type) {
    return type.publish
        ? JSON.stringify([
              {
                  pageSize: '20',
                  pageNo: 1,
                  listType: '1',
                  spaceType: '',
                  spaceId: '',
                  typeId: type.id,
                  condition: 'publishDepartment',
                  textfield1: '',
                  textfield2: '',
                  myNews: '',
              },
          ])
        : JSON.stringify([
              {
                  pageSize: '20',
                  pageNo: 1,
                  listType: '1',
                  spaceType: '2',
                  spaceId: '',
                  typeId: '',
                  condition: 'publishDepartment',
                  textfield1: '',
                  textfield2: '',
                  myNews: '',
                  fragmentId: type.id,
                  ordinal: '0',
                  panelValue: 'designated_value',
              },
          ]);
}

export const route: Route = {
    path: '/oa_news/:type?',
    radar: [
        {
            source: ['oas.gdut.edu.cn/seeyon'],
            target: '/oa_news/',
        },
    ],
    name: 'Unknown',
    maintainers: ['Jim Kirisame'],
    handler,
    url: 'oas.gdut.edu.cn/seeyon',
};

async function handler(ctx) {
    const typeParam = ctx.req.param('type') ?? 'notice';
    if (typeMap[typeParam] === undefined) {
        throw new Error('通知类型' + typeParam + '未定义');
    }

    const type = typeMap[typeParam];

    // 获取cookie
    const cookieJar = new CookieJar();
    await got(site + '/main.do', {
        cookieJar,
    });

    // 获取文章列表
    const listUrl = '/ajax.do?method=ajaxAction&managerName=newsDataManager';
    const resp = await got.post(site + listUrl, {
        cookieJar,
        form: {
            managerMethod: 'findListDatas',
            arguments: getArg(type),
        },
    });

    if (!resp.data.list) {
        throw new Error('文章列表获取失败，可能是被临时限制了访问，请稍后重试');
    }

    // 构造文章数组
    const articles = [];
    for (const item of resp.data.list) {
        articles.push({
            title: item.title,
            guid: item.id,
            link: site + '/newsData.do?method=newsView&newsId=' + item.id,
            pubDate: timezone(parseDate(item.publishDate1), +8),
            author: item.publishUserDepart,
            category: item.typeName,
        });
    }

    // 获取实际的文章内容
    for await (const data of asyncPool(2, articles, async (data) => {
        const link = data.link;
        data.description = await cache.tryGet(link, async () => {
            // 获取数据
            const response = await got(link, {
                cookieJar,
            });

            const $ = load(response.data);
            const node = $('#content');
            // 清理样式
            node.find('*')
                .filter(function () {
                    return this.type === 'comment' || this.tagName === 'meta' || this.tagName === 'style';
                })
                .remove();
            node.find('*')
                .contents()
                .filter(function () {
                    return this.type === 'comment' || this.tagName === 'meta' || this.tagName === 'style';
                })
                .remove();
            node.find('*').each(function () {
                if (this.attribs.style !== undefined) {
                    const newSty = this.attribs.style
                        .split(';')
                        .filter((s) => {
                            const styBlocklist = ['color:rgb(0,0,0)', 'color:black', 'background:rgb(255,255,255)', 'background:white', 'text-align:left', 'text-align:justify', 'font-style:normal', 'font-weight:normal'];
                            const styPrefixBlocklist = [
                                'font-family',
                                'font-size',
                                'background',
                                'text-autospace',
                                'text-transform',
                                'letter-spacing',
                                'line-height',
                                'padding',
                                'margin',
                                'text-justify',
                                'word-break',
                                'vertical-align',
                                'mso-',
                                '-ms-',
                            ];
                            const sty = s.trim();
                            if (styBlocklist.includes(sty.replaceAll(/\s+/g, ''))) {
                                return false;
                            }
                            for (const prefix of styPrefixBlocklist) {
                                if (sty.startsWith(prefix)) {
                                    return false;
                                }
                            }
                            return true;
                        })
                        .join(';');
                    if (newSty) {
                        this.attribs.style = newSty;
                    } else {
                        delete this.attribs.style;
                    }
                }
                if (this.attribs.class && this.attribs.class.trim().startsWith('Mso')) {
                    delete this.attribs.class;
                }
                if (this.attribs.lang) {
                    delete this.attribs.lang;
                }
                if (this.tagName === 'font' || this.tagName === 'o:p') {
                    $(this).replaceWith(this.childNodes);
                }
                if (this.tagName === 'span' && !this.attribs.style) {
                    $(this).replaceWith(this.childNodes);
                }
            });
            node.find('span').each(function () {
                if (this.childNodes.length === 0) {
                    $(this).remove();
                }
            });

            // 防止太快被Ban
            await wait(500);
            return node.html();
        });
    })) {
        data;
    }

    return {
        title: `广东工业大学新闻通知网 - ` + type.name,
        link: site,
        description: `广东工业大学新闻通知网`,
        item: articles,
    };
}
