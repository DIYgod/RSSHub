import { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const urlRoot = 'https://publicoa.sjtu.edu.cn';

export const route: Route = {
    path: '/publicoa',
    categories: ['university'],
    example: '/sjtu/publicoa',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'JAAuthCookie',
                description: 'JAAuthCookie, 登陆后提取自jaccount.sjtu.edu.cn',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '上海交通大学公文系统',
    maintainers: [''],
    handler,
    description: `需要用户认证`,
};

const cookieJar = new CookieJar();

async function handler() {
    if (!config.sjtu?.JAAuthCookie) {
        throw '请先在配置文件中填写上海交通大学教务处的JAAuthCookie';
    }

    cookieJar.setCookieSync(`JAAuthCookie=${config.sjtu.JAAuthCookie}; Domain=.jaccount.sjtu.edu.cn; Path=/`, 'https://jaccount.sjtu.edu.cn');
    async function getPublicOAList() {
        return await ofetch(`${urlRoot}/api/doc/list`, {
            headers: {
                cookie: (await cookieJar.getCookieString(urlRoot)) as string,
            },
        });
    }
    const list: any = await new Promise((resolve) => {
        resolve(
            getPublicOAList().catch(async (error) => {
                if (error.response?.status === 401) {
                    let requestUrl = urlRoot;
                    while (true) {
                        // eslint-disable-next-line no-await-in-loop
                        const res = await ofetch.raw(requestUrl, {
                            headers: {
                                // eslint-disable-next-line no-await-in-loop
                                cookie: (await cookieJar.getCookieString(requestUrl)) as string,
                            },
                            redirect: 'manual',
                        });
                        const setCookies = res.headers.getSetCookie();
                        for (const c of setCookies) {
                            cookieJar.setCookieSync(c, requestUrl);
                        }

                        if (res.status >= 300 && res.status < 400) {
                            const location = res.headers.get('location');
                            if (typeof location === 'string') {
                                requestUrl = new URL(location, requestUrl).href;
                            }
                        } else {
                            break;
                        }
                    }
                    return await getPublicOAList();
                }
            })
        );
    });

    return {
        title: '上海交通大学公文系统',
        item: list.entities.map((item) => ({
            title: item.title,
            author: item.doccode,
            pubDate: timezone(parseDate(item.qfdate), +8),
            link: item.pdfpath,
        })),
    };
}
