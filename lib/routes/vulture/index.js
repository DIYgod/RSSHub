import utils from './utils/js';

export default async (ctx) => {
    const url = `https://www.vulture.com/news/${ctx.params.tag}/`;
    const tagsToExclude = ctx.params.excludetags;

    let title = `Vulture - tag ${ctx.params.tag}`;
    if (tagsToExclude !== undefined) {
        title += ' - excluding tags ';
        title += tagsToExclude.split(',').join(', ');
    }

    ctx.state.data = await utils.getData(ctx, url, title, tagsToExclude);
};
