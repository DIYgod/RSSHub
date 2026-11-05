import { describe, expect, it } from 'vitest';

import { createCatalog, describe as describeEntry } from './catalog';

const route = (fields: Record<string, unknown>) => ({ maintainers: [], handler: () => null, example: '', ...fields }) as never;

const namespaces = {
    github: {
        name: 'GitHub',
        url: 'github.com',
        routes: {
            '/issue/:user/:repo/:state?': route({
                path: '/issue/:user/:repo/:state?',
                name: 'Repo Issues',
                example: '/github/issue/DIYgod/RSSHub/open',
                parameters: {
                    user: 'GitHub username',
                    repo: 'GitHub repo name',
                    state: { description: 'the state of the issues', default: 'open', options: [{ value: 'open', label: 'Open' }] },
                },
                features: { requireConfig: [{ name: 'GITHUB_ACCESS_TOKEN', optional: true, description: '' }] },
            }),
            '/trending/:since': route({ path: '/trending/:since', name: 'Trending', example: '/github/trending/daily' }),
        },
    },
    sspai: {
        name: '少数派 sspai',
        url: 'sspai.com',
        routes: {
            '/index': route({ path: '/index', name: '首页', example: '/sspai/index' }),
        },
    },
    blog: {
        name: 'Some Blog',
        url: 'blog.example',
        routes: {
            '/posts': route({ path: '/posts', name: 'Posts', example: '/blog/posts', description: 'Mirrors its GitHub issue tracker too' }),
        },
    },
};

describe('magpie catalog', () => {
    const catalog = createCatalog(namespaces as never);

    it('indexes every route', () => {
        expect(catalog.entries).toHaveLength(4);
    });

    it('ranks a route matching every term by its name first, and leaves out passing mentions', () => {
        const found = catalog.search('github issue', 5);
        expect(found.map((entry) => entry.path)).toEqual(['/github/issue/:user/:repo/:state?']);
    });

    it('finds routes by a domain or a name in another script', () => {
        expect(catalog.search('https://sspai.com', 5).map((entry) => entry.path)).toEqual(['/sspai/index']);
        expect(catalog.search('少数派', 5).map((entry) => entry.path)).toEqual(['/sspai/index']);
    });

    it('answers nothing for nothing', () => {
        expect(catalog.search('', 5)).toEqual([]);
        expect(catalog.search('nothing-like-this', 5)).toEqual([]);
    });

    it('describes a route with what building its path takes', () => {
        const [entry] = catalog.search('github issue', 1);
        expect(describeEntry(entry, 1)).toBe(
            [
                '1. GitHub › Repo Issues',
                '   path: /github/issue/:user/:repo/:state?',
                '   example: /github/issue/DIYgod/RSSHub/open',
                '   parameters:',
                '   - user: GitHub username',
                '   - repo: GitHub repo name',
                '   - state [optional; default open; one of open (Open)]: the state of the issues',
                '   needs config: GITHUB_ACCESS_TOKEN (optional)',
            ].join('\n')
        );
    });
});
