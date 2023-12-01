const { TITLE, HOST } = require('./const');
const { fetchPerformerInfo } = require('./service');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const artist = await fetchPerformerInfo({
        performerId: id,
    });
    ctx.state.data = {
        title: `${TITLE} - ${artist.name}`,
        description: artist.content,
        link: `${HOST}/artist/${artist.id}`,
        item: artist.activityList,
    };
};
