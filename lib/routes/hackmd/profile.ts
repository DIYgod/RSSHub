// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const path = ctx.req.param('path');

    const response = await got({
        method: 'get',
        url: `https://hackmd.io/api/@${path}/overview`,
    });
    const data = response.data;

    const profile = data.user || data.team;
    ctx.set('data', {
        title: `${profile.name}'s Profile`,
        link: `https://hackmd.io/@${path}`,
        description: `${profile.name}'s profile on HackMD`,
        item: data.notes.map((note) => ({
            title: note.title,
            description: `<pre>${note.content}</pre>`,
            pubDate: new Date(note.publishedAt).toUTCString(),
            link: `https://hackmd.io/@${path}/${note.permalink || note.shortId}`,
        })),
    });
};
