// @ts-nocheck
import buildData from '@/utils/common-config';

export default async (ctx) => {
    const link = 'http://www.aiea.org/0504';
    const period = ctx.req.param('period') ?? '';

    let nth_child = 'n';
    switch (period) {
        case 'upcoming':
            nth_child = '1';
            break;

        case 'past':
            nth_child = '2';
            break;

        case 'both':
            nth_child = 'n';
            break;

        default:
            break;
    }

    ctx.set(
        'data',
        await buildData({
            link,
            url: link,
            title: `%title%`,
            params: {
                title: 'AIEA Seminars',
            },
            item: {
                item: `.seminar-contents .seminar-partWrap:nth-child(${nth_child}) > .seminar-list`,
                title: `$('.seminar-list-title > span').text()`,
                link: `$('a[href^="/0504"]').attr('href')`,
                description: `$('.seminar-list .txt > .title').text()`,
            },
        })
    );
};
