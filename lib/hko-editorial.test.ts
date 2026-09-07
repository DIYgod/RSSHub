import { describe, expect, it } from 'vitest';

import { getLanguage, parseDataset, rewriteRelativeUrls } from './hko-editorial';

describe('HKO editorial helpers', () => {
    it('selects a supported language and rejects unsupported languages', () => {
        expect(getLanguage(undefined)).toBe('en');
        expect(getLanguage('tc')).toBe('tc');
        expect(() => getLanguage('zh-HK')).toThrow('Supported languages are en, tc, and sc.');
        expect(() => getLanguage('constructor')).toThrow('Supported languages are en, tc, and sc.');
    });

    it('parses HKO JavaScript datasets', () => {
        expect(parseDataset('var blog = [{"en_title":"Title"}];', 'blog')).toEqual([{ en_title: 'Title' }]);
        expect(() => parseDataset('const blog = [];', 'blog')).toThrow('Unable to parse the HKO editorial dataset.');
    });

    it('rewrites relative article links and media URLs', () => {
        expect(rewriteRelativeUrls('<p><a href="/tc/article">Article</a><img src="images/article.jpg"></p>')).toBe(
            '<p><a href="https://www.hko.gov.hk/tc/article">Article</a><img src="https://www.hko.gov.hk/images/article.jpg"></p>'
        );
    });
});
