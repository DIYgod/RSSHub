import { describe, expect, it } from 'vitest';

import { route as bulletinRoute } from './bulletin';
import { route as difangCaishuiFaguiRoute } from './difang-caishui-fagui';
import { route as faguiJieduRoute } from './fagui-jiedu';
import { route as nashuiPingguRoute } from './nashui-pinggu';
import { route as nashuiTiaozhenRoute } from './nashui-tiaozhen';
import { route as nianduCaishuiFaguiRoute } from './niandu-caishui-fagui';
import { route as shuishouYouhuiRoute } from './shuishou-youhui';
import { route as shuiwuChouhuaRoute } from './shuiwu-chouhua';
import { route as shuiwuJichaAnliRoute } from './shuiwu-jicha-anli';
import { route as shuiwuWendaRoute } from './shuiwu-wenda';

describe('shui5cn routes', () => {
    const testRoute = async (route: any, routeName: string, expectedTitle: string) => {
        const data = (await route.handler({} as any)) as any;

        // 验证基本结构
        expect(data).toBeTruthy();
        expect(data.title).toEqual(expectedTitle);
        expect(data.link).toMatch(/^https:\/\/www\.shui5\.cn\/article\//);
        expect(data.description).toContain('税屋网');
        expect(data.language).toEqual('zh-CN');

        // 验证文章列表
        expect(data.item).toEqual(expect.any(Array));
        expect(data.item.length).toBeGreaterThan(0);
        expect(data.item.length).toBeLessThanOrEqual(30);

        // 验证第一篇文章的结构
        const firstItem = data.item[0];
        expect(firstItem).toHaveProperty('title');
        expect(firstItem).toHaveProperty('link');
        expect(firstItem).toHaveProperty('description');
        expect(firstItem).toHaveProperty('pubDate');
        expect(firstItem).toHaveProperty('author');
        expect(firstItem).toHaveProperty('category');

        // 验证字段类型
        expect(firstItem.title).toEqual(expect.any(String));
        expect(firstItem.link).toMatch(/^https?:\/\//);
        expect(firstItem.description).toEqual(expect.any(String));
        expect(firstItem.author).toEqual(expect.any(String));
        expect(firstItem.category).toEqual(expect.any(Array));
        expect(firstItem.category[0]).toEqual('财税');

        // 验证 description 不为空（除非是错误情况）
        if (!firstItem.description.includes('获取文章内容失败')) {
            expect(firstItem.description.length).toBeGreaterThan(0);
        }
    };

    it('shuishou-youhui (税收优惠)', async () => {
        await testRoute(shuishouYouhuiRoute, 'shuishou-youhui', '税屋网 - 税收优惠');
    }, 120000);

    it('shuiwu-chouhua (税务筹划)', async () => {
        await testRoute(shuiwuChouhuaRoute, 'shuiwu-chouhua', '税屋网 - 税务筹划');
    }, 120000);

    it('shuiwu-jicha-anli (税务稽查案例)', async () => {
        await testRoute(shuiwuJichaAnliRoute, 'shuiwu-jicha-anli', '税屋网 - 税务稽查案例');
    }, 120000);

    it('nashui-pinggu (纳税评估)', async () => {
        await testRoute(nashuiPingguRoute, 'nashui-pinggu', '税屋网 - 纳税评估');
    }, 120000);

    it('nashui-tiaozhen (纳税调整)', async () => {
        await testRoute(nashuiTiaozhenRoute, 'nashui-tiaozhen', '税屋网 - 纳税调整');
    }, 120000);

    it('shuiwu-wenda (税务问答)', async () => {
        await testRoute(shuiwuWendaRoute, 'shuiwu-wenda', '税屋网 - 税务问答');
    }, 120000);

    it('bulletin (公告)', async () => {
        await testRoute(bulletinRoute, 'bulletin', '税屋网 - 公告');
    }, 120000);

    it('difang-caishui-fagui (地方财税法规)', async () => {
        await testRoute(difangCaishuiFaguiRoute, 'difang-caishui-fagui', '税屋网 - 地方财税法规');
    }, 120000);

    it('niandu-caishui-fagui (年度财税法规)', async () => {
        await testRoute(nianduCaishuiFaguiRoute, 'niandu-caishui-fagui', '税屋网 - 年度财税法规');
    }, 120000);

    it('fagui-jiedu (法规解读)', async () => {
        await testRoute(faguiJieduRoute, 'fagui-jiedu', '税屋网 - 法规解读');
    }, 120000);
});
