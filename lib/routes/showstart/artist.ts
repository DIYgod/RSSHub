// @ts-nocheck
const { TITLE, HOST } = require('./const');
const { fetchPerformerInfo } = require('./service');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const artist = await fetchPerformerInfo({
        performerId: id,
    });
    ctx.set('data', {
        title: `${TITLE} - ${artist.name}`,
        description: artist.content,
        link: `${HOST}/artist/${artist.id}`,
        item: artist.activityList,
    });
};
