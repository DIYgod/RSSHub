import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/cookbook',
    categories: ['programming'],
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
    example: '/openai/cookbook',
    name: 'Cookbook',
};

async function handler() {
    const rootUrl = 'https://cookbook.openai.com';
    const currentUrl = `${rootUrl}/`;

    try {
        const response = await ofetch(currentUrl);
        const $ = load(response);

        let items = $('[class="min-h-[90vh] mt-4"] .grid a')
            .toArray()
            .map((element) => {
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
                    category: $tags.toArray().map((tag) => $(tag).text().trim()),
                };
            });

        items = (
            await Promise.all(
                items.map((item) =>
                    cache.tryGet(item.link, async () => {
                        try {
                            const detailResponse = await ofetch(item.link);
                            const $ = load(detailResponse);

                            item.description = $(String.raw`article.prose.prose-sm.sm\:prose-base.max-w-none.dark\:prose-invert`).html();
                            return item;
                        } catch {
                            return { ...item, description: '' };
                        }
                    })
                )
            )
        ).filter((item) => item?.description);

        return {
            title: 'OpenAI Cookbook',
            link: currentUrl,
            item: items,
        };
    } catch (error) {
        logger.error(`处理 OpenAI Cookbook 请求时发生错误: ${error}`);
        throw error;
    }
}
