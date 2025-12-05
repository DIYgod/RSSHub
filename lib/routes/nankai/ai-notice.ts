import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ai/:type?',
    categories: ['university'],
    example: '/nankai/ai/zxdt',
    parameters: { type: '栏目类型（若为空则默认为"最新动态"）' },
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
            source: ['ai.nankai.edu.cn', 'ai.nankai.edu.cn/xwzx/:type.htm'],
            target: '/ai/:type?',
        },
    ],
    name: '人工智能学院',
    maintainers: ['LMark'],
    description: `| 最新动态 | 学院公告 | 学生之窗 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 就业信息 | 国际交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- | ---------- | ---------- | -------- | -------- |
| zxdt     | xygg     | xszc     | kyxx     | bksjx      | dtyd     | yjszs      | yjsjx      | jyxx     | gjjl     |`,
    url: 'ai.nankai.edu.cn',
    handler: async (ctx) => {
        // 从 URL 参数中获取通知分类
        const { type = 'zxdt' } = ctx.req.param();
        const baseUrl = 'https://ai.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/xwzx/${type}.htm`);
        const $ = load(response);

        // 获取分类名称映射
        const categoryMap: Record<string, string> = {
            zxdt: '最新动态',
            xygg: '学院公告',
            xszc: '学生之窗',
            kyxx: '科研信息',
            bksjx: '本科生教学',
            dtyd: '党团园地',
            yjszs: '研究生招生',
            yjsjx: '研究生教学',
            jyxx: '就业信息',
            gjjl: '国际交流',
        };

        const categoryName = categoryMap[type] || '最新动态';

        // 解析新闻列表
        const list = $('.gage-list-news table tr')
            .slice(1) // 跳过表头
            .toArray()
            .map((tr) => {
                const $tr = $(tr);
                const cells = $tr.find('td');

                if (cells.length < 3) {
                    return null;
                }

                const titleCell = cells.eq(0);
                const sourceCell = cells.eq(1);
                const dateCell = cells.eq(2);

                // 提取标题和链接
                const $titleLink = titleCell.find('a');
                const title = $titleLink.text().trim();
                let link = $titleLink.attr('href') || '';

                // 处理相对链接
                link = link && !link.startsWith('http') ? `${baseUrl}/${link}` : link;

                // 提取日期
                const dateStr = dateCell.text().trim();
                const pubDate = dateStr.includes('/') ? timezone(parseDate(dateStr, 'YYYY/MM/DD'), +8) : timezone(parseDate(dateStr), +8);

                // 提取来源
                const source = sourceCell.text().trim();

                return {
                    title,
                    link,
                    pubDate,
                    author: source || '人工智能学院',
                    description: '', // 初始化description属性
                };
            })
            .filter((item) => item && item.link && item.title); // 过滤掉空项目和没有链接的项目

        // 获取每篇文章的详细内容
        const items = await Promise.all(
            list.map((item) =>
                item
                    ? cache.tryGet(item.link, async () => {
                          try {
                              const { data: response } = await got(item.link);
                              const $ = load(response);

                              const $description = $('.v_news_content');

                              // 处理相对链接，转换为绝对链接
                              if ($description.length > 0) {
                                  // 处理图片
                                  $description.find('img').each((i, el) => {
                                      const $el = $(el);
                                      let src = $el.attr('src');

                                      if (src && !src.startsWith('http')) {
                                          src = `${baseUrl}${src}`;
                                          $el.attr('src', src);
                                      }
                                  });
                              }

                              item.description = $description.html() || item.title;
                          } catch {
                              // 如果获取详细内容失败，返回基本信息
                              item.description = item.title + ' (获取详细内容失败)';
                          }
                          return item;
                      })
                    : null
            )
        );

        return {
            // 源标题
            title: `南开大学人工智能学院-${categoryName}`,
            // 源链接
            link: `${baseUrl}/xwzx/${type}.htm`,
            // 源文章
            item: items,
        };
    },
};
