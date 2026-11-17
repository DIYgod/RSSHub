import Original from 'markdown-it';
import { describe, expect, it } from 'vitest';

import MarkdownIt from '@/utils/markdown-it';

const md = MarkdownIt({ html: true });

// 148 columns and 442 rows that consist of `|`: 65416 omitted cells, just under markdown-it's limit per table
const table = '|a'.repeat(148) + '\n' + '|:-:'.repeat(148) + '\n' + '|\n'.repeat(442) + '\n';
const cells = (html: string) => html.split('<td').length - 1;

// counts the lines that quotes look ahead over and that do not start with `>`
const lookAhead = (text: string, factory: typeof MarkdownIt = MarkdownIt) => {
    const counted = factory();
    let lines = 0;
    counted.block.ruler.before(
        'fence',
        'count',
        (state) => {
            if (state.parentType === 'blockquote') {
                lines++;
            }
            return false;
        },
        { alt: ['blockquote'] }
    );
    return { html: counted.render(text), lines };
};
const quotes = (n: number) => 'a\n>>\n'.repeat(n);
const strip = (html: string) => html.replaceAll(/<[^>]*>|\s/g, '');

describe('markdown-it', () => {
    it.each([
        '',
        '# title\n\ntext with *emphasis*, `code` and <b>html</b>\n\n- a\n- b\n\n> quote',
        // omitted, surplus and empty cells
        '| Week | Letters | Replies |\n|:----:|:-------:|--------:|\n| 1 | 12 | 3 |\n| 2 | 31 |\n| 3 |\n| 4 | 1 | 2 | 3 |\n||||\n\ntext',
        'a|b\n-|-\nc|d\ne',
        '|a|b|c|\n|-|-|-|\n|1\n|2\n|3',
        '> |a|b|\n> |-|-|\n> |c|\n\n- |a|b|\n  |-|-|\n  |c|\n\ntext\n|a|b|\n|-|-|\n|c|',
        // not tables
        '|a|b|\n|-|\n|c|',
        '|a|b|',
        '|a|b|\n',
        // a table in which every cell is written, however short
        '|a'.repeat(30) + '\n' + '|-'.repeat(30) + '\n' + ('|'.repeat(31) + '\n').repeat(30) + '\n',
        'The [archive][archive], the [list] and ![an image][list], then the [archive] again and [nothing].\n\n[archive]: https://example.org/archive "All issues"\n[list]: https://example.org/list',
        '[[a]] [b [a]] [a][] [a]: [a](b)\n\n[a]: https://example.org/',
        // quotes, nested, lazy and in lists
        'text\n\n> quote\n> second line\n>> nested\n> back\nlazy\n\n- > in a list\n  > two\n\n> # heading\n> - item\n>\n> ```\n> code\n> ```\n\n',
        '> ' + 'a long quote\n> '.repeat(3000) + '\n\ntext\n',
    ])('renders ordinary text as markdown-it does: %#', (text) => {
        expect(md.render(text)).toBe(Original({ html: true }).render(text));
        expect(md.render(text.repeat(50))).toBe(Original({ html: true }).render(text.repeat(50)));
    });

    it('passes the preset and the options on', () => {
        expect(MarkdownIt().render('<b>a</b> https://example.org')).toBe(Original().render('<b>a</b> https://example.org'));
        expect(MarkdownIt({ linkify: true, breaks: true }).render('https://example.org\na')).toBe(Original({ linkify: true, breaks: true }).render('https://example.org\na'));
        expect(MarkdownIt('commonmark').render('|a|\n|-|\n|b|')).toBe(Original('commonmark').render('|a|\n|-|\n|b|'));
        expect(MarkdownIt('zero', { html: true }).render('# a')).toBe(Original('zero', { html: true }).render('# a'));
    });

    it('does not add more table cells than the text has characters', () => {
        for (const text of [
            table,
            table.repeat(20),
            table.replaceAll(/^/gm, '> ').repeat(20),
            table
                .replaceAll(/^(?=.)/gm, '  ')
                .replace('  ', '- ')
                .repeat(20),
        ]) {
            const html = md.render(text);
            expect(cells(html)).toBeGreaterThan(0);
            expect(cells(html)).toBeLessThanOrEqual(text.length);
        }
    });

    it('limits the table cells of a long text', () => {
        const row = '|'.repeat(149) + '\n';
        for (const text of [table.repeat(80), table + row.repeat(5000)]) {
            const html = md.render(text);
            expect(cells(html)).toBeGreaterThan(65536 - 148);
            expect(cells(html)).toBeLessThanOrEqual(65536);
        }
    });

    it('keeps the rows after the last cell as text', () => {
        const html = md.render('|a|b|c|d|e|f|g|h|\n|-|-|-|-|-|-|-|-|\n' + '|x\n'.repeat(20));
        // 96 characters, 8 columns
        expect(cells(html)).toBe(96);
        expect(html).toContain('</table>\n<p>' + '|x\n'.repeat(8).trim() + '</p>');
    });

    it('starts anew for every text', () => {
        expect(md.render(table)).toBe(md.render(table));
        expect(md.render('|a|b|\n|-|-|\n|c|')).toBe(Original().render('|a|b|\n|-|-|\n|c|'));
    });

    it.each([
        ['links', '[a] '],
        ['images', '![a] '],
    ])('does not let the uses of a reference copy more than the text is long: %s', (_, use) => {
        for (const [length, uses] of [
            [256, 64],
            [30000, 7500],
        ]) {
            const url = 'http://x/' + 'b'.repeat(length);
            const text = `[a]: ${url} "${'c'.repeat(length)}"\n\n` + use.repeat(uses);
            const html = md.render(text);
            const limit = Math.max(text.length, 16384);
            expect(html.split(url).length - 1).toBe(Math.floor(limit / (url.length + length)));
            expect(html).toContain(use.repeat(uses - Math.floor(limit / (url.length + length))).trim() + '</p>');
        }
    });

    it('limits the lines that the quotes of a text look ahead over', () => {
        for (const n of [2000, 25000]) {
            const { lines } = lookAhead(quotes(n));
            expect(lines).toBeGreaterThan(0);
            // looked ahead over once to count them, then by markdown-it
            expect(lines).toBeLessThanOrEqual(2 * 64 * 2 * n);
        }
        // without the limit
        expect(lookAhead(quotes(500), Original).lines).toBeGreaterThan((500 * 500) / 4);
    });

    it('keeps the text of quotes after the limit', () => {
        const text = quotes(2000) + '> ' + 'last quote\n> '.repeat(10);
        expect(strip(lookAhead(text).html)).toBe(strip(Original().render(text)));
        expect(lookAhead(text).html).toContain('<p>last quote');
    });

    it('limits what parse() returns as well', () => {
        expect(md.parse(table.repeat(20), {}).length).toBeLessThan(4 * table.length * 20);
    });
});
