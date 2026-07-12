import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route } from './routes/eastmoney/report';

function createCtx({ category, query = {} }: { category?: string; query?: Record<string, string | undefined> } = {}) {
    return {
        req: {
            param: (name?: string) => {
                if (name === 'category') {
                    return category;
                }
            },
            query: (name?: string) => (name ? query[name] : undefined),
        },
    } as any;
}

describe('/eastmoney/report', () => {
    it('请求个股研报接口并生成 feed', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.post('https://reportapi.eastmoney.com/report/list2', async ({ request }) => {
                const body = await request.json();
                expect(body).toEqual({
                    beginTime: '2026-01-01',
                    endTime: '2026-01-31',
                    pageNo: 1,
                    pageSize: 20,
                });

                return HttpResponse.json({
                    data: [
                        {
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
                query: {
                    beginDate: '2026-01-01',
                    endDate: '2026-01-31',
                },
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

                return HttpResponse.json({
                    data: [
                        {
                            encodeUrl: 'encoded-strategy-report',
                            orgSName: '东方财富证券',
                            publishDate: '2026-02-01',
                            researcher: '分析师B',
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

        const feed = await route.handler(createCtx());

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

    it('在 beginDate 或 endDate 非法时抛出明确错误', async () => {
        await expect(route.handler(createCtx({ query: { beginDate: '2026-02-30' } }))).rejects.toThrow('Invalid beginDate format. Expected YYYY-MM-DD.');
        await expect(route.handler(createCtx({ query: { endDate: '2026/01/31' } }))).rejects.toThrow('Invalid endDate format. Expected YYYY-MM-DD.');
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
                            orgSName: '东方财富证券',
                            publishDate: '2026-03-01',
                            researcher: '分析师C',
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
