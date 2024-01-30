const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { value: config } = require('@/config');
const got = require('@/utils/got').extend({
    headers: {
        // https://docs.modrinth.com/#section/User-Agents
        'user-agent': config.trueUA,
    },
});
const markdownIt = require('markdown-it')({
    html: true,
});

module.exports = async (
    /** @type {import('koa').Context} */
    ctx
) => {
    const {
        /** @type string */
        id,
    } = ctx.params;
    let {
        /** @type {string | string[] | undefined} */
        loaders,
        /** @type {string | string[] | undefined} */
        game_versions,
    } = ctx.query;
    const { featured } = ctx.query;

    if (typeof loaders === 'string') {
        loaders = [loaders];
    }
    if (typeof game_versions === 'string') {
        game_versions = [game_versions];
    }

    try {
        /** @type {import('./api').Project} */
        const project = await got(`https://api.modrinth.com/v2/project/${id}`).json();
        /** @type {import('./api').Version[]} */
        const versions = await got(`https://api.modrinth.com/v2/project/${id}/version`, {
            searchParams: {
                loaders: loaders ? JSON.stringify(loaders) : undefined,
                game_versions: game_versions ? JSON.stringify(game_versions) : undefined,
                featured,
            },
        }).json();
        /** @type {import('./api').Author[]} */
        const authors = await got(`https://api.modrinth.com/v2/users`, {
            searchParams: {
                ids: JSON.stringify(versions.map((it) => it.author_id)),
            },
        }).json();

        ctx.state.data = {
            title: `${project.title} Modrinth versions`,
            description: project.description,
            link: `https://modrinth.com/project/${id}`,
            item: versions.map((it, index) => ({
                title: `${it.name} for ${it.loaders.join('/')} on ${[...new Set([it.game_versions[0], it.game_versions.at(-1)])].join('-')}`,
                link: `https://modrinth.com/project/${id}/version/${it.version_number}`,
                pubDate: parseDate(it.date_published),
                description: art(path.join(__dirname, 'templates/version.art'), {
                    ...it,
                    changelog: markdownIt.render(it.changelog),
                }),
                guid: it.id,
                author: authors[index].name,
            })),
        };
    } catch (error) {
        if (error?.response?.statusCode === 404) {
            throw new Error(`${error.message}: Project ${id} not found`);
        }
        throw error;
    }
};
