import { escapeAttribute, escapeText } from 'entities';
import markdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://api.engoo.com/api';
const categoryId = '0225ae09-5d63-41c2-bd75-693985d07d78';
const brandId = '5a4657f2-e151-4c48-9cce-000000000002';
const markdown = markdownIt();

export const route: Route = {
    path: '/daily-news',
    example: '/engoo/daily-news',
    name: 'Daily News',
    categories: ['other'],
    maintainers: ['DIYgod'],
    radar: [{ source: ['engoo.com/app/daily-news'], target: '/daily-news' }],
    handler,
};

function renderText(text) {
    return text.formatted ? markdown.renderInline(text.text) : escapeText(text.text);
}

function getItem(header) {
    const encodedId = Buffer.from(header.master_id.replaceAll('-', ''), 'hex').toString('base64url');
    const slug = header.title_text.text
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-|-$/g, '');
    const link = `https://engoo.com/app/daily-news/article/${slug}/${encodedId}`;
    return cache.tryGet(link, async () => {
        const response = await ofetch(`${apiUrl}/lessons/${header.master_id}/current`);
        const lesson = response.data;
        const sections = lesson.exercises.flatMap((exercise) => exercise.sections).filter((section) => section._type === 'ArticleSection');
        const description = sections
            .flatMap((section) => section.paragraphs)
            .map((paragraph) => `<p>${paragraph.paragraph_sentences.map((sentence) => renderText(sentence.text)).join(' ')}</p>`)
            .join('');
        return {
            title: header.title_text.text,
            link,
            description: `${header.image?.url ? `<img src="${escapeAttribute(header.image.url)}">` : ''}${description}`,
            pubDate: parseDate(header.first_published_at),
            updated: parseDate(header.updated_at),
            author:
                header.authors
                    .map((author) => response.references[author._ref]?.name)
                    .filter(Boolean)
                    .join(', ') || undefined,
        };
    });
}

async function handler(ctx) {
    const response = await ofetch(`${apiUrl}/lesson_headers`, {
        query: {
            category: categoryId,
            direction: 'desc',
            for_brand: brandId,
            order: 'first_published_at',
            page_size: 20,
            published_latest: true,
            type: 'Published',
        },
    });
    const limit = Number(ctx.req.query('limit')) || 20;
    return { title: 'Engoo Daily News', link: 'https://engoo.com/app/daily-news', language: 'en' as const, item: await pMap(response.data.slice(0, limit), getItem, { concurrency: 3 }) };
}
