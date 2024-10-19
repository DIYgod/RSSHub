import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    description:
        'OpenAI Cookbook 提供了大量使用 OpenAI API 的实用指南和示例代码,涵盖了从基础到高级的各种主题,包括 GPT 模型、嵌入、函数调用、微调等。这里汇集了最新的 API 功能介绍和流行的应用案例,是开发者学习和应用 OpenAI 技术的宝贵资源。',
    maintainers: ['liyaozhong'],
    radar: [
        {
            source: ['cookbook.openai.com/'],
        },
    ],
    url: 'cookbook.openai.com/',
    handler,
};

async function handler() {
    const rootUrl = 'https://cookbook.openai.com';
    const currentUrl = `${rootUrl}/`;

    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    try {
        await page.goto(currentUrl, {
            waitUntil: 'domcontentloaded',
        });

        const response = await page.content();
        page.close();
        const $ = load(response);

        let items = $('a[href^="examples/"]')
            .map((_, element) => {
                const $element = $(element);
                const $title = $element.find('div.font-semibold.text-sm.text-primary.line-clamp-1.overflow-ellipsis');
                const $date = $element.find(String.raw`span.text-xs.text-muted-foreground.md\:w-24.text-end`);
                const $author = $element.find('p:contains("OpenAI")');
                const $tags = $element.find('span[style^="color:"]');

                return {
                    title: $title.text().trim(),
                    link: `${rootUrl}/${$element.attr('href')}`,
                    pubDate: $date.text().trim(),
                    author: $author.text().replace('OpenAI', '').trim(),
                    category: $tags.map((_, tag) => $(tag).text().trim()).get(),
                };
            })
            .get();

        items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        items = items.filter((item, index, self) => index === self.findIndex((t) => t.link === item.link));
        logger.info(`成功提取并排序 ${items.length} 个项目`);

        items = (
            await Promise.all(
                items.map((item) =>
                    cache.tryGet(item.link, async () => {
                        try {
                            const detailPage = await browser.newPage();
                            await detailPage.setRequestInterception(true);
                            detailPage.on('request', (request) => {
                                request.resourceType() === 'document' ? request.continue() : request.abort();
                            });

                            logger.http(`Requesting ${item.link}`);
                            await detailPage.goto(item.link, {
                                waitUntil: 'domcontentloaded',
                            });
                            const detailResponse = await detailPage.content();
                            detailPage.close();

                            const $ = load(detailResponse);
                            let content = '';

                            $(String.raw`article.prose.prose-sm.sm\:prose-base.max-w-none.dark\:prose-invert`).each((_, element) => {
                                const $element = $(element);
                                $element.children().each((_, child) => {
                                    const $child = $(child);
                                    if ($child.is('h3')) {
                                        content += `\n## ${$child.text().trim()}\n\n`;
                                    } else if ($child.is('p')) {
                                        content += `${$child.text().trim()}\n\n`;
                                    } else if ($child.is('ol, ul')) {
                                        $child.find('li').each((_, li) => {
                                            content += `- ${$(li).text().trim()}\n`;
                                        });
                                        content += '\n';
                                    }
                                });
                            });

                            // 清理内容
                            content = content
                                .replaceAll(/<[^>]+>/g, '') // 移除剩余的HTML标签
                                .replaceAll('&quot;', '"') // 处理特殊字符
                                .replaceAll('&amp;', '&')
                                .replaceAll(/\s+/g, ' ') // 移除多余的空白字符
                                .trim();

                            item.description = content;

                            // logger.info(`详细内容获取完成: ${item.link}`);
                            // logger.info(`   ${item.description.slice(0, 300)}...`); // 只记录前300个字符
                            // logger.info(`========================================`);

                            return item;
                        } catch {
                            return { ...item, description: '' };
                        }
                    })
                )
            )
        ).filter((item) => item.description);

        browser.close();

        return {
            title: 'OpenAI Cookbook',
            link: currentUrl,
            item: items,
        };
    } catch (error) {
        logger.error(`处理 OpenAI Cookbook 请求时发生错误: ${error}`);
        browser.close();
        throw error;
    }
}
