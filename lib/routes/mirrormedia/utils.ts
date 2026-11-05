import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export async function getArticle(item) {
    const article = await cache.tryGet(`mirrormedia:article-details:v1:${item.link}`, async () => {
        const detailResponse = await ofetch(item.link);

        const content = load(detailResponse);

        let blocks = content('article > figure, article > blockquote, article > .order-8');
        if (!blocks.length) {
            blocks = new URL(item.link).pathname.startsWith('/external/')
                ? content(':is([class^=external-article-brief],[class*=external-article-content])')
                : content(':is([class^=brief__BriefContainer],[class^=article-content__Wrapper])');
        }
        blocks.find('[class^=gpt-placeholder], [class^=article-right-arrow]').remove();
        blocks
            .find('div, p')
            .filter((_, element) => /^(?:延伸閱讀|更多三立新聞網報導)/.test(content(element).text().trim()))
            .remove();
        const description = blocks
            .toArray()
            .map((element) => content.html(element))
            .join('');
        if (!description) {
            throw new Error(`Article content was not found at ${item.link}. The site layout may have changed.`);
        }

        const category = (content("meta[name='keywords']").attr('content') ?? '')
            .split(',')
            .map((category) => category.trim())
            .filter(Boolean);
        return { description, category };
    });
    return { ...item, description: article.description, category: [...item.category, ...article.category] };
}
