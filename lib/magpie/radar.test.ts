import { describe, expect, it } from 'vitest';

import { matchRadar, subdomainsOf } from './radar';

const rule = (source: string[], target: string) => ({ title: target, source, target });
const url = (path: string) => new URL(`https://example.com${path}`);

describe('magpie radar', () => {
    it('fills a target from the path', () => {
        const matches = matchRadar(new URL('https://github.com/DIYgod/RSSHub/issues'), [rule(['/:user/:repo/issues', '/:user/:repo'], '/github/issue/:user/:repo')]);
        expect(matches).toEqual([{ title: '/github/issue/:user/:repo', path: '/github/issue/DIYgod/RSSHub', missing: [] }]);
    });

    it('takes a trailing slash and literal parts in any case', () => {
        const matches = matchRadar(new URL('https://example.com/Topics/42/'), [rule(['/topics/:id'], '/example/topic/:id')]);
        expect(matches[0].path).toBe('/example/topic/42');
    });

    it('leaves out an optional parameter the URL does not give, and reports a required one', () => {
        const matches = matchRadar(new URL('https://github.com/DIYgod/RSSHub/pulls'), [
            rule(['/:user/:repo/:type'], '/github/comments/:user/:repo/:number?'),
            rule(['/:user/:repo/:type'], '/github/file/:user/:repo/:branch/:filepath'),
        ]);
        expect(matches.map(({ path, missing }) => ({ path, missing }))).toEqual([
            { path: '/github/comments/DIYgod/RSSHub', missing: [] },
            { path: '/github/file/DIYgod/RSSHub/:branch/:filepath', missing: ['branch', 'filepath'] },
        ]);
    });

    it('matches optional segments, file names, globs and custom patterns', () => {
        expect(matchRadar(url('/news'), [rule(['/news/:category?'], '/example/news/:category?')])[0].path).toBe('/example/news');
        expect(matchRadar(url('/news/tech'), [rule(['/news/:category?'], '/example/news/:category?')])[0].path).toBe('/example/news/tech');
        expect(matchRadar(url('/post/123.html'), [rule(['/post/:id.html'], '/example/post/:id')])[0].path).toBe('/example/post/123');
        expect(matchRadar(url('/docs/a/b/c'), [rule(['/docs/*path'], '/example/docs/:path')])[0].path).toBe('/example/docs/a/b/c');
        expect(matchRadar(url('/wiki/a/b'), [rule(['/wiki/:page{.+}'], '/example/wiki/:page')])[0].path).toBe('/example/wiki/a/b');
        expect(matchRadar(url('/other'), [rule(['/news/:category?'], '/example/news/:category?')])).toEqual([]);
    });

    it('matches the query and the hash', () => {
        const search = rule(['/search?q=:keyword'], '/example/search/:keyword');
        expect(matchRadar(new URL('https://example.com/search?page=2&q=rss%20hub'), [search])[0].path).toBe('/example/search/rss%20hub');
        expect(matchRadar(new URL('https://example.com/search'), [search])).toEqual([]);
        expect(matchRadar(new URL('https://example.com/#/channel/7'), [rule(['/#/channel/:id'], '/example/channel/:id')])[0].path).toBe('/example/channel/7');
    });

    it('answers each feed once', () => {
        const matches = matchRadar(new URL('https://example.com/u/1'), [rule(['/u/:id'], '/example/user/:id'), rule(['/u/:id', '/user/:id'], '/example/user/:id')]);
        expect(matches).toHaveLength(1);
    });

    it('reads the bare domain and www as one', () => {
        expect(subdomainsOf('.')).toEqual(['.', 'www']);
        expect(subdomainsOf('www')).toEqual(['www', '.']);
        expect(subdomainsOf('space')).toEqual(['space']);
    });
});
