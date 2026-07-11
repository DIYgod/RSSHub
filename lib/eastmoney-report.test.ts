import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route } from './routes/eastmoney/report';

function createCtx({ category = 'strategyreport', routeParams = '' }: { category?: string; routeParams?: string } = {}) {
    return {
        req: {
            param: (name?: string) => {
                if (!name) {
                    return { category, routeParams };
                }

                if (name === 'category') {
                    return category;
                }

                if (name === 'routeParams') {
                    return routeParams;
                }
            },
        },
    } as any;
}

describe('/eastmoney/report', () => {
    it("证明对 ctx.req.param('category') 的字符串结果做对象解构会回退到默认值", () => {
        const mockReq = {
            param: (name?: string) => (name === 'category' ? 'stock' : { category: 'stock' }),
        };

        const { category = 'strategyreport' } = mockReq.param('category') as any;

        expect(category).toBe('strategyreport');
    });

    it('使用 category 与 routeParams 请求东方财富接口并生成 feed', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://reportapi.eastmoney.com/report/jg', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('qType')).toBe('0');
                expect(url.searchParams.get('pageNo')).toBe('2');
                expect(url.searchParams.get('pageSize')).toBe('3');
                expect(url.searchParams.get('beginTime')).toBe('2026-01-01');
                expect(url.searchParams.get('endTime')).toBe('2026-01-31');

                return HttpResponse.json({
                    data: [
                        {
                            encodeUrl: 'encoded-report',
                            infoCode: 'INFO001',
                            orgSName: '东方证券',
                            publishDate: '2026-01-15',
                            researcher: '分析师A',
                            stockName: '平安银行',
                            title: '年度策略',
                        },
                    ],
                });
            }),
            http.get('https://data.eastmoney.com/report/info/INFO001.html', () =>
                HttpResponse.html(`
                    <a class="pdf-link" href="https://pdf.example.com/report.pdf">PDF</a>
                    <div class="ctx-content"><p>报告正文</p></div>
                `)
            )
        );

        const feed = await route.handler(
            createCtx({
                category: 'stock',
                routeParams: 'page=2&pageSize=3&beginDate=2026-01-01&endDate=2026-01-31',
            })
        );

        expect(feed.title).toBe('东方财富网-个股研报');
        expect(feed.link).toBe('https://data.eastmoney.com/report/stock');
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].title).toBe('[东方证券][平安银行]年度策略');
        expect(feed.item[0].link).toBe('https://pdf.example.com/report.pdf');
        expect(feed.item[0].description).toContain('报告正文');
        expect(feed.item[0].author).toBe('分析师A');
    });

    it('在缺少 category 时回退到 strategyreport 默认分类', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://reportapi.eastmoney.com/report/jg', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('qType')).toBe('2');
                expect(url.searchParams.get('pageNo')).toBe('1');
                expect(url.searchParams.get('pageSize')).toBe('20');
                expect(url.searchParams.get('beginTime')).toBe('1900-01-01');
                expect(url.searchParams.get('endTime')).toBe('9999-12-31');

                return HttpResponse.json({
                    data: [
                        {
                            encodeUrl: 'encoded-strategy-report',
                            infoCode: 'INFO002',
                            orgSName: '东方财富证券',
                            publishDate: '2026-02-01',
                            researcher: '分析师B',
                            stockName: '',
                            title: '策略周报',
                        },
                    ],
                });
            }),
            http.get('https://data.eastmoney.com/report/zw_strategy.jshtml', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('encodeUrl')).toBe('encoded-strategy-report');

                return HttpResponse.html(`
                    <a class="pdf-link" href="https://pdf.example.com/strategy.pdf">PDF</a>
                    <div class="ctx-content"><p>策略报告正文</p></div>
                `);
            })
        );

        const feed = await route.handler(createCtx({ category: undefined }));

        expect(feed.title).toBe('东方财富网-策略报告');
        expect(feed.link).toBe('https://data.eastmoney.com/report/strategyreport');
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].title).toBe('[东方财富证券]策略周报');
        expect(feed.item[0].link).toBe('https://pdf.example.com/strategy.pdf');
        expect(feed.item[0].description).toContain('策略报告正文');
    });

    it('在 category 非法时抛出明确错误', async () => {
        await expect(route.handler(createCtx({ category: 'invalid-category' }))).rejects.toThrow('Invalid category: invalid-category. Expected one of brokerreport, industry, macresearch, strategyreport, stock');
    });

    it('在 page 非法时抛出明确错误', async () => {
        await expect(route.handler(createCtx({ routeParams: 'page=0' }))).rejects.toThrow('Invalid page. Expected a positive integer.');
        await expect(route.handler(createCtx({ routeParams: 'page=abc' }))).rejects.toThrow('Invalid page. Expected a positive integer.');
    });

    it('在 pageSize 非法时抛出明确错误', async () => {
        await expect(route.handler(createCtx({ routeParams: 'pageSize=-1' }))).rejects.toThrow('Invalid pageSize. Expected a positive integer.');
        await expect(route.handler(createCtx({ routeParams: 'pageSize=1.5' }))).rejects.toThrow('Invalid pageSize. Expected a positive integer.');
    });

    it('在 beginDate 或 endDate 非法时抛出明确错误', async () => {
        await expect(route.handler(createCtx({ routeParams: 'beginDate=2026-02-30' }))).rejects.toThrow('Invalid beginDate format. Expected YYYY-MM-DD.');
        await expect(route.handler(createCtx({ routeParams: 'endDate=2026/01/31' }))).rejects.toThrow('Invalid endDate format. Expected YYYY-MM-DD.');
    });

    it('在上游返回空数据时生成空 feed', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://reportapi.eastmoney.com/report/jg', () =>
                HttpResponse.json({
                    data: undefined,
                })
            )
        );

        const feed = await route.handler(createCtx());

        expect(feed.title).toBe('东方财富网-策略报告');
        expect(feed.item).toEqual([]);
    });

    it('在详情页缺少 pdf-link 时保留原始详情页链接', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://reportapi.eastmoney.com/report/jg', () =>
                HttpResponse.json({
                    data: [
                        {
                            encodeUrl: 'encoded-no-pdf',
                            infoCode: 'INFO003',
                            orgSName: '东方财富证券',
                            publishDate: '2026-03-01',
                            researcher: '分析师C',
                            stockName: '',
                            title: '无 PDF 策略周报',
                        },
                    ],
                })
            ),
            http.get('https://data.eastmoney.com/report/zw_strategy.jshtml', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('encodeUrl')).toBe('encoded-no-pdf');

                return HttpResponse.html(`
                    <div class="ctx-content"><p>只有正文，没有 PDF</p></div>
                `);
            })
        );

        const feed = await route.handler(createCtx());

        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].link).toBe('https://data.eastmoney.com/report/zw_strategy.jshtml?encodeUrl=encoded-no-pdf');
        expect(feed.item[0].description).toContain('只有正文，没有 PDF');
    });
});
