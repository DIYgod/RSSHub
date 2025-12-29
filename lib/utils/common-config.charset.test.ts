import { describe, expect, it, vi } from 'vitest';

const html = `<div class="content">
    <ul>
        <li>
            <a href="/1">1</a>
            <div class="description">RSSHub1</div>
            <div class="date">2025-01-01</div>
        </li>
    </ul>
</div>`;

const rawSpy = vi.fn(() =>
    Promise.resolve({
        headers: new Headers({
            'content-type': 'text/html; charset=gbk',
        }),
        _data: html,
    })
);
const ofetchSpy = vi.fn(() => Promise.resolve(Buffer.from(html)));

vi.mock('@/utils/ofetch', () => ({
    default: Object.assign(ofetchSpy, { raw: rawSpy }),
}));

describe('common-config charset', () => {
    it('parses charset from content-type', async () => {
        const buildData = (await import('@/utils/common-config')).default;
        const data = await buildData({
            link: 'http://rsshub.test/buildData',
            url: 'http://rsshub.test/buildData',
            title: `%title%`,
            params: {
                title: 'buildData',
            },
            item: {
                item: '.content li',
                title: `$('a').text() + ' - %title%'`,
                link: `$('a').attr('href')`,
                description: `$('.description').html()`,
                pubDate: `timezone(parseDate($('.date').text(), 'YYYY-MM-DD'), 0)`,
            },
        });

        expect(data.title).toBe('buildData');
        expect(data.item[0].title).toBe('1 - buildData');
    });
});
