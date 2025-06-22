import { describe, it, expect } from 'vitest';
import { runInContainer } from '../../utils/docker';

describe('ebrun', () => {
    it('should return valid RSS feed', async () => {
        const rss = await runInContainer({
            path: '/ebrun',
        });
        expect(rss).toBeDefined();
        expect(rss.title).toBe('亿邦动力 - 电商知识服务平台');
        expect(rss.link).toBe('https://www.ebrun.com');
        expect(rss.description).toBe('亿邦动力最新电商资讯、跨境电商、产业互联网等内容');
        expect(rss.language).toBe('zh-cn');
        // 检查是否有文章项目
        expect(rss.item).toBeDefined();
        expect(Array.isArray(rss.item)).toBe(true);
        expect(rss.item.length).toBeGreaterThan(0);

        // 检查第一个文章项目的结构
        const firstItem = rss.item[0];
        expect(firstItem.title).toBeDefined();
        expect(firstItem.link).toBeDefined();
        expect(firstItem.description).toBeDefined();
        expect(firstItem.pubDate).toBeDefined();

        // 验证链接格式
        expect(firstItem.link).toMatch(/^https?:\/\/.+/);

        // 验证日期格式
        expect(new Date(firstItem.pubDate)).toBeInstanceOf(Date);
        expect(isNaN(new Date(firstItem.pubDate).getTime())).toBe(false);
    }, 30000); // 30秒超时
});