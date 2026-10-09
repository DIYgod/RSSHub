import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const sections = ['agenda', 'atlante', 'faro', 'chiasmo', 'diritto', 'lingua_italiana', 'parolevalgono', 'webtv'];

export const route: Route = {
    path: '/magazine/:section?',
    categories: ['new-media'],
    example: '/treccani/magazine/atlante',
    parameters: { section: { description: 'Magazine section. Omit for the homepage.', options: sections.map((value) => ({ value, label: value })) } },
    name: 'Magazine articles',
    maintainers: ['DIYgod'],
    description: 'Includes public article summaries. Il Tascabile has its own native feed at <https://www.iltascabile.com/feed/>.',
    radar: [{ source: ['treccani.it/magazine/:section'], target: '/magazine/:section' }],
    handler,
};

function collectStories(value, stories = new Map()) {
    if (!value || typeof value !== 'object') {
        return stories;
    }
    if (value.full_slug?.startsWith('magazine/') && (value.content?.component === 'Articolo' || /\/webtv\/videos\/[^/]+$/.test(value.full_slug))) {
        stories.set(value.full_slug, value);
        return stories;
    }
    for (const child of Object.values(value)) {
        collectStories(child, stories);
    }
    return stories;
}

function getRichText(value): string {
    if (!value) {
        return '';
    }
    return value.text ?? value.content?.map(getRichText).join(value.type === 'doc' ? '\n' : '') ?? '';
}

async function handler(ctx) {
    const section = ctx.req.param('section');
    if (section && !sections.includes(section)) {
        throw new InvalidParameterError(`Unknown magazine section. Supported: ${sections.join(', ')}.`);
    }
    const link = `https://www.treccani.it/magazine/${section ? `${section}/` : ''}`;
    const response = await ofetch(link);
    const $ = load(response);
    const data = JSON.parse($('#__NEXT_DATA__').text());
    const stories = collectStories(data.props.pageProps.story);
    return {
        title: `Treccani Magazine${section ? ` - ${section}` : ''}`,
        link,
        item: stories
            .values()
            .toArray()
            .map((story) => {
                const content = story.content ?? {};
                const image = content.immagine?.[0]?.immagine?.filename;
                const date = story.first_published_at ?? story.published_at;
                return {
                    title: content.titolo || story.name,
                    link: `https://www.treccani.it/${story.full_slug}`,
                    author: content.nomeAutore || undefined,
                    category: story.tag_list,
                    pubDate: date ? parseDate(date) : undefined,
                    description: renderToString(
                        <>
                            {image && <img src={image} alt="" />}
                            <p>{getRichText(content.abstract ?? content.descrizione)}</p>
                            {content.videoId && <iframe src={`https://www.youtube.com/embed/${content.videoId}`} allowfullscreen />}
                        </>
                    ),
                };
            }),
    };
}
