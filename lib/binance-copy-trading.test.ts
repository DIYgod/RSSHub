import { beforeEach, describe, expect, it, vi } from 'vitest';

const ofetchMock = vi.fn();
const tryGetMock = vi.fn();

vi.mock('@/utils/ofetch', () => ({
    default: ofetchMock,
}));

vi.mock('@/utils/cache', () => ({
    default: {
        tryGet: tryGetMock,
    },
}));

vi.mock('@/config', () => ({
    config: {
        trueUA: 'test-user-agent',
    },
}));

const createContext = (portfolioId: string, limit?: string) => {
    const json: Record<string, unknown> = {};

    return {
        req: {
            param: (name: string) => {
                if (name === 'portfolioId') {
                    return portfolioId;
                }
            },
            query: (name: string) => {
                if (name === 'limit') {
                    return limit;
                }
            },
        },
        set: (_key: string, value: unknown) => {
            Object.assign(json, value as Record<string, unknown>);
        },
        get jsonData() {
            return json;
        },
    };
};

describe('/binance/copy-trading/lead/:portfolioId', () => {
    beforeEach(() => {
        vi.resetModules();
        ofetchMock.mockReset();
        tryGetMock.mockReset();
    });

    it('maps orders to feed items with correct title, pubDate, and description', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    nickname: 'TestTrader',
                    description: 'Test description',
                    avatarUrl: 'https://example.com/avatar.png',
                    futuresType: 'UM',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    indexValue: '1785420034257',
                    total: 100,
                    list: [
                        {
                            symbol: 'BTCUSDT',
                            baseAsset: 'BTC',
                            quoteAsset: 'USDT',
                            side: 'BUY',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 10.848,
                            avgPrice: 63153.5,
                            totalPnl: 0,
                            orderTime: 1_785_765_131_745,
                            orderUpdateTime: 1_785_765_131_757,
                        },
                        {
                            symbol: 'BTCUSDT',
                            baseAsset: 'BTC',
                            quoteAsset: 'USDT',
                            side: 'SELL',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 6.99,
                            avgPrice: 62430,
                            totalPnl: -13589.4,
                            orderTime: 1_785_758_904_804,
                            orderUpdateTime: 1_785_758_904_804,
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/copy-trading');
        const ctx = createContext('5075281354358777856');
        const result = (await route.handler(ctx as any)) as any;

        expect(result.title).toBe('TestTrader - Binance Copy Trading');
        expect(result.link).toBe('https://www.binance.com/zh-CN/copy-trading/lead-details/5075281354358777856');
        expect(result.item).toHaveLength(2);

        expect(result.item[0].title).toBe('开多 BTCUSDT @ 63,153.50');
        expect(result.item[0].category).toEqual(['开多']);
        expect(result.item[0].description).toContain('BTCUSDT');
        expect(result.item[0].description).not.toContain('已实现盈亏');
        expect(result.item[0].pubDate).toBeInstanceOf(Date);

        expect(result.item[1].title).toBe('平多 BTCUSDT @ 62,430.00');
        expect(result.item[1].category).toEqual(['平多']);
        expect(result.item[1].description).toContain('已实现盈亏');
        expect(result.item[1].description).toContain('-13,589.40');
    });

    it('shows realized PnL only for sell orders with non-zero PnL', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { nickname: 'Trader', futuresType: 'UM' },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    indexValue: '1',
                    total: 2,
                    list: [
                        {
                            symbol: 'ETHUSDT',
                            baseAsset: 'ETH',
                            quoteAsset: 'USDT',
                            side: 'BUY',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 1,
                            avgPrice: 3000,
                            totalPnl: 0,
                            orderTime: 1_700_000_000_000,
                            orderUpdateTime: 1_700_000_000_000,
                        },
                        {
                            symbol: 'ETHUSDT',
                            baseAsset: 'ETH',
                            quoteAsset: 'USDT',
                            side: 'SELL',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 1,
                            avgPrice: 3500,
                            totalPnl: 500,
                            orderTime: 1_700_000_001_000,
                            orderUpdateTime: 1_700_000_001_000,
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/copy-trading');
        const result = (await route.handler(createContext('123') as any)) as any;

        expect(result.item[0].description).not.toContain('已实现盈亏');
        expect(result.item[1].description).toContain('已实现盈亏');
        expect(result.item[1].description).toContain('500.00');
        expect(result.item[1].description).toContain('#2EBD85');
    });

    it('correctly maps SHORT position sides (SELL+SHORT=开空, BUY+SHORT=平空)', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { nickname: 'Trader', futuresType: 'UM' },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    indexValue: '1',
                    total: 2,
                    list: [
                        {
                            symbol: 'SNDKUSDT',
                            baseAsset: 'SNDK',
                            quoteAsset: 'USDT',
                            side: 'SELL',
                            type: 'MARKET',
                            positionSide: 'SHORT',
                            executedQty: 3.85,
                            avgPrice: 1389.62,
                            totalPnl: 0,
                            orderTime: 1_700_000_000_000,
                            orderUpdateTime: 1_700_000_000_000,
                        },
                        {
                            symbol: 'SNDKUSDT',
                            baseAsset: 'SNDK',
                            quoteAsset: 'USDT',
                            side: 'BUY',
                            type: 'MARKET',
                            positionSide: 'SHORT',
                            executedQty: 3.85,
                            avgPrice: 1389.62,
                            totalPnl: 100,
                            orderTime: 1_700_000_001_000,
                            orderUpdateTime: 1_700_000_001_000,
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/copy-trading');
        const result = (await route.handler(createContext('123') as any)) as any;

        // SELL + SHORT = 开空 (open short)
        expect(result.item[0].title).toBe('开空 SNDKUSDT @ 1,389.62');
        expect(result.item[0].category).toEqual(['开空']);
        expect(result.item[0].description).toContain('卖出开空');

        // BUY + SHORT = 平空 (close short)
        expect(result.item[1].title).toBe('平空 SNDKUSDT @ 1,389.62');
        expect(result.item[1].category).toEqual(['平空']);
        expect(result.item[1].description).toContain('买入平空');
    });

    it('respects limit query parameter', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { nickname: 'Trader', futuresType: 'UM' },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    indexValue: '1',
                    total: 5,
                    list: Array.from({ length: 5 }, (_, index) => ({
                        symbol: 'BTCUSDT',
                        baseAsset: 'BTC',
                        quoteAsset: 'USDT',
                        side: 'BUY',
                        type: 'MARKET',
                        positionSide: 'LONG',
                        executedQty: 1,
                        avgPrice: 60000,
                        totalPnl: 0,
                        orderTime: 1_700_000_000_000 + index,
                        orderUpdateTime: 1_700_000_000_000 + index,
                    })),
                },
            });

        const { route } = await import('@/routes/binance/copy-trading');
        const result = (await route.handler(createContext('123', '2') as any)) as any;

        expect(result.item).toHaveLength(2);
    });

    it('ensures unique guid and link for orders at the same timestamp', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { nickname: 'Trader', futuresType: 'UM' },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    indexValue: '1',
                    total: 3,
                    list: [
                        {
                            symbol: 'BTCUSDT',
                            baseAsset: 'BTC',
                            quoteAsset: 'USDT',
                            side: 'BUY',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 1,
                            avgPrice: 60000,
                            totalPnl: 0,
                            orderTime: 1_700_000_000_000,
                            orderUpdateTime: 1_700_000_000_000,
                        },
                        {
                            symbol: 'ETHUSDT',
                            baseAsset: 'ETH',
                            quoteAsset: 'USDT',
                            side: 'BUY',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 2,
                            avgPrice: 3000,
                            totalPnl: 0,
                            orderTime: 1_700_000_000_000,
                            orderUpdateTime: 1_700_000_000_000,
                        },
                        {
                            symbol: 'ETHUSDT',
                            baseAsset: 'ETH',
                            quoteAsset: 'USDT',
                            side: 'SELL',
                            type: 'MARKET',
                            positionSide: 'LONG',
                            executedQty: 2,
                            avgPrice: 3100,
                            totalPnl: 200,
                            orderTime: 1_700_000_000_000,
                            orderUpdateTime: 1_700_000_000_000,
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/copy-trading');
        const result = (await route.handler(createContext('123') as any)) as any;

        const guids = result.item.map((i) => i.guid);
        const links = result.item.map((i) => i.link);
        expect(new Set(guids).size).toBe(3);
        expect(new Set(links).size).toBe(3);
    });

    it('throws when API returns failure code', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { nickname: 'Trader', futuresType: 'UM' },
            })
            .mockResolvedValueOnce({
                code: '11012005',
                success: false,
                message: 'The system is currently busy',
                data: null,
            });

        const { route } = await import('@/routes/binance/copy-trading');

        await expect(route.handler(createContext('123') as any)).rejects.toThrow('The system is currently busy');
    });

    it('throws when portfolio is not found', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock.mockResolvedValueOnce({
            code: '000000',
            success: true,
            data: null,
        });

        const { route } = await import('@/routes/binance/copy-trading');

        await expect(route.handler(createContext('invalid-id') as any)).rejects.toThrow('not found or not accessible');
    });

    it('caches profile detail via cache.tryGet', async () => {
        tryGetMock.mockResolvedValue({ nickname: 'CachedTrader', futuresType: 'UM', description: 'cached' });
        ofetchMock.mockResolvedValue({
            code: '000000',
            success: true,
            data: { indexValue: '1', total: 0, list: [] },
        });

        const { route } = await import('@/routes/binance/copy-trading');
        const result = (await route.handler(createContext('123') as any)) as any;

        expect(tryGetMock).toHaveBeenCalledWith('binance:copy-trading:detail:123', expect.any(Function));
        expect(result.title).toBe('CachedTrader - Binance Copy Trading');
        expect(ofetchMock).toHaveBeenCalledTimes(1);
    });
});
