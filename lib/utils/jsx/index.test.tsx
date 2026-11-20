import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { describe, expect, it } from 'vitest';

import { createElement, jsx } from '@/utils/jsx';

// plain objects with a `length` and indexed entries, as JSON from an API may contain
const upstream = JSON.parse('{ "name": { "length": 2, "0": "x", "1": "y" }, "names": ["a", [{ "length": 1, "0": "x" }, "b"]], "empty": {} }');

const Name = ({ children }: { children?: unknown }) => <b>{children}</b>;

describe('jsx', () => {
    it('does not walk an object child by its length', () => {
        expect(renderToString(<p>{upstream.name}</p>)).toBe('<p></p>');
        expect(
            renderToString(
                <p>
                    {upstream.name}: <a href={upstream.name}>{upstream.name}</a>
                </p>
            )
        ).toBe('<p>: <a href="[object Object]"></a></p>');
        expect(renderToString(<>{upstream.name}</>)).toBe('');
        expect(renderToString(<p>{upstream.names}</p>)).toBe('<p>ab</p>');
        expect(renderToString(<p>{upstream.empty}</p>)).toBe('<p></p>');
    });

    it('guards children of function components', () => {
        expect(renderToString(<Name>{upstream.name}</Name>)).toBe('<b></b>');
        expect(renderToString(<Name>{['a', upstream.name]}</Name>)).toBe('<b>a</b>');
    });

    it('guards the classic factory', () => {
        expect(createElement).toBe(jsx);
        expect(renderToString(jsx('p', {}, upstream.name, 'a', upstream.names))).toBe('<p>aab</p>');
    });

    it('keeps every other child as it is', () => {
        expect(
            renderToString(
                <div className="a">
                    {'<'}
                    {1}
                    {0}
                    {true}
                    {false}
                    {null}
                    {undefined}
                    {raw('<br>')}
                    {[<i key="i">i</i>, ['x', [raw('&amp;')]]]}
                    <img src="a" />
                </div>
            )
        ).toBe('<div class="a">&lt;10<br><i>i</i>x&amp;<img src="a"/></div>');
        const classic = jsx('p', null, '<', raw('<br>'), jsx('i', {}, 1));
        expect(renderToString(classic)).toBe('<p>&lt;<br><i>1</i></p>');
    });

    it('keeps async children', async () => {
        const rendered = (<p>{Promise.resolve('a')}</p>).toString() as string | Promise<string>;
        expect(await rendered).toEqual(expect.stringContaining('<p>a</p>'));
    });
});
