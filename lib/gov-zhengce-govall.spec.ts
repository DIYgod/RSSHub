import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import type { Data } from '@/types';

import { route } from './routes/gov/zhengce/govall';

const apiUrl = 'https://sousuoht.www.gov.cn/athena/forward/2B22E8E39E850E17F95A016A74FCB6B673336FA8B6FEC0E2955907EF9AEE06BE';
const articleUrl = 'http://www.gov.cn/gongbao/content/2009/content_1322126.htm';

describe('gov.cn information search route', () => {
    it('supports the documented legacy advanced-search parameters', async () => {
        const { default: server } = await import('@/setup.test');
        let requestBody: any;

        server.use(
            http.get('http://sousuo.gov.cn/list.htm', () => HttpResponse.text('<html></html>')),
            http.post(apiUrl, async ({ request }) => {
                requestBody = await request.json();

                expect(request.headers.get('athenaAppKey')).toBeTruthy();
                expect(request.headers.get('athenaAppName')).toBe(encodeURIComponent('国网搜索'));

                return HttpResponse.json({
                    resultCode: {
                        code: 200,
                    },
                    result: {
                        data: {
                            middle: {
                                list: [
                                    {
                                        title: '中华人民共和国国务院令（第<em>555</em>号）<br>　　流动人口计划生育工作条例',
                                        title_no_tag: '中华人民共和国国务院令（第555号）<br>　　流动人口计划生育工作条例',
                                        url: articleUrl,
                                        summary: '搜索接口摘要',
                                        time: '2009-05-30 23:59:59',
                                    },
                                ],
                            },
                        },
                    },
                });
            }),
            http.get(articleUrl, () => HttpResponse.text('<div id="UCAP-CONTENT"><p>文章全文</p></div>'))
        );

        const ctx = {
            req: {
                param: (name: string) => (name === 'advance' ? 'orpro=555&notpro=2&search_field=title' : undefined),
            },
        } as unknown as Context;
        const result = (await route.handler(ctx)) as Data;

        expect(requestBody).toMatchObject({
            code: '17da70961a7',
            dataTypeId: '107',
            orderBy: 'time',
            searchBy: 'title',
            pageNo: 1,
            pageSize: 20,
            isDefaultAdvanced: 1,
            isAdvancedSearch: 1,
            advancedFilters: [
                {
                    fieldName: 'containsAll',
                    searchWord: [],
                },
                {
                    fieldName: 'containsOne',
                    searchWord: ['555'],
                },
                {
                    fieldName: 'none',
                    searchWord: ['2'],
                },
            ],
        });
        expect(result.link).toMatch(/^https:\/\/sousuo\.www\.gov\.cn\/sousuo\/search\.shtml\?/);
        expect(result.item).toEqual([
            {
                title: '中华人民共和国国务院令（第555号） 流动人口计划生育工作条例',
                link: articleUrl,
                description: '<p>文章全文</p>',
                pubDate: new Date('2009-05-30T15:59:59.000Z'),
            },
        ]);
    });

    it('maps legacy keyword and date filters to the Athena request', async () => {
        const { default: server } = await import('@/setup.test');
        let requestBody: any;

        server.use(
            http.post(apiUrl, async ({ request }) => {
                requestBody = await request.json();

                return HttpResponse.json({
                    resultCode: {
                        code: 200,
                    },
                    result: {
                        data: {
                            middle: {
                                list: [],
                            },
                        },
                    },
                });
            })
        );

        const ctx = {
            req: {
                param: (name: string) =>
                    name === 'advance'
                        ? 'allpro=%E5%8C%BB%E7%96%97+%E4%BF%9D%E9%9A%9C&inpro=%E5%AE%8C%E6%95%B4+%E7%9F%AD%E8%AF%AD&orpro=%E5%8C%BB%E4%BF%9D+%E7%A4%BE%E4%BF%9D&notpro=%E6%95%99%E8%82%B2&searchfield=content&pubmintimeYear=2009&pubmintimeMonth=5&pubmaxtimeYear=2009&pubmaxtimeMonth=5'
                        : undefined,
            },
        } as unknown as Context;
        await route.handler(ctx);

        expect(requestBody).toMatchObject({
            searchBy: 'all',
            granularity: 'CUSTOM',
            beginDateTime: Date.UTC(2009, 4, 1) - 8 * 60 * 60 * 1000,
            endDateTime: Date.UTC(2009, 5, 1) - 8 * 60 * 60 * 1000 - 1,
            advancedFilters: [
                {
                    fieldName: 'containsAll',
                    searchWord: ['医疗', '保障', '完整 短语'],
                },
                {
                    fieldName: 'containsOne',
                    searchWord: ['医保', '社保'],
                },
                {
                    fieldName: 'none',
                    searchWord: ['教育'],
                },
            ],
        });
    });

    it('requests the latest items when advanced-search parameters are omitted', async () => {
        const { default: server } = await import('@/setup.test');
        let requestBody: any;

        server.use(
            http.post(apiUrl, async ({ request }) => {
                requestBody = await request.json();

                return HttpResponse.json({
                    resultCode: {
                        code: 200,
                    },
                    result: {
                        data: {
                            middle: {
                                list: [],
                            },
                        },
                    },
                });
            })
        );

        const ctx = {
            req: {
                param: () => {},
            },
        } as unknown as Context;
        const result = (await route.handler(ctx)) as Data;

        expect(requestBody).toMatchObject({
            allData: true,
            pageNo: 1,
            pageSize: 20,
            searchBy: 'all',
        });
        expect(requestBody).not.toHaveProperty('advancedFilters');
        expect(result.link).toContain('allData=true');
    });

    it('uses API content when an article page cannot be fetched', async () => {
        const { default: server } = await import('@/setup.test');
        const unavailableArticleUrl = 'https://www.gov.cn/test/unavailable-article.htm';

        server.use(
            http.post(apiUrl, () =>
                HttpResponse.json({
                    resultCode: {
                        code: 200,
                    },
                    result: {
                        data: {
                            middle: {
                                list: [
                                    {
                                        title: '<em>测试</em><br/>标题',
                                        url: unavailableArticleUrl,
                                        content: '接口正文',
                                    },
                                ],
                            },
                        },
                    },
                })
            ),
            http.get(unavailableArticleUrl, () => new HttpResponse(null, { status: 500 }))
        );

        const ctx = {
            req: {
                param: () => {},
            },
        } as unknown as Context;
        const result = (await route.handler(ctx)) as Data;

        expect(result.item).toEqual([
            {
                title: '测试 标题',
                link: unavailableArticleUrl,
                description: '接口正文',
            },
        ]);
    });

    it('reports an actionable error when the search API fails', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.post(apiUrl, () =>
                HttpResponse.json({
                    resultCode: {
                        code: 1000,
                    },
                })
            )
        );

        const ctx = {
            req: {
                param: () => {},
            },
        } as unknown as Context;

        await expect(route.handler(ctx)).rejects.toThrow('中国政府网搜索接口请求失败，错误代码：1000');
    });
});
