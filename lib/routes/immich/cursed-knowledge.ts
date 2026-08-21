import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cursed-knowledge',
    categories: ['blog'],
    example: '/immich/cursed-knowledge',
    radar: [
        {
            source: ['immich.app/cursed-knowledge', 'immich.app'],
            target: '/cursed-knowledge',
        },
    ],
    name: 'Cursed Knowledge',
    maintainers: ['TonyRL'],
    handler,
};

const ghType = {
    pr: 'pull',
    issue: 'issues',
    discussion: 'discussions',
};

const parseGithubLink = (arg: string) => {
    const number = arg.match(/(?:number: )?([\d_]+)/)?.[1].replaceAll('_', '');
    const type = arg.match(/type: '(\w+)'/)?.[1] ?? 'pr';
    return `https://github.com/immich-app/immich/${ghType[type]}/${number}`;
};

const matchString = (entry: string, key: string) => {
    const m = entry.match(new RegExp(`${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`));
    return (m?.[1] ?? m?.[2])?.replaceAll(/\\(.)/g, '$1');
};

async function handler() {
    const baseUrl = 'https://immich.app';
    const link = `${baseUrl}/cursed-knowledge/`;

    const [source, feed] = await Promise.all([
        ofetch('https://raw.githubusercontent.com/immich-app/static-pages/main/apps/root.immich.app/src/routes/cursed-knowledge/+page.svelte'),
        ofetch(`${baseUrl}/blog/feed.json`, { responseType: 'json' }),
    ]);

    const entries = source
        .slice(source.indexOf('const items'))
        .split(/\n {4}(?:withBlog\()?\{\n/)
        .slice(1);

    const items = entries.map((entry) => {
        const blogId = entry.match(/id: '([^']+)'/)?.[1];
        const blogPost = blogId && feed.items.find((post) => post.id.endsWith(blogId));
        const gh = entry.match(/link: asGithubLink\(([^)]*)\)/);
        const date = entry.match(/new Date\((\d+), (\d+), (\d+)\)/);
        const title = matchString(entry, 'title');

        return {
            title,
            description: matchString(entry, 'description'),
            link: (gh ? parseGithubLink(gh[1]) : undefined) ?? entry.match(/href: '([^']+)'/)?.[1] ?? blogPost?.url,
            guid: `${link}#${title}`,
            pubDate: date ? parseDate(`${date[1]}-${Number(date[2]) + 1}-${date[3]}`, 'YYYY-M-D') : blogPost ? parseDate(blogPost.date_published) : undefined,
        };
    });

    return {
        title: 'Cursed Knowledge | Immich',
        description: 'Cursed knowledge we have learned as a result of building Immich that we wish we never knew.',
        image: `${baseUrl}/favicon.ico`,
        link,
        item: items,
    };
}
