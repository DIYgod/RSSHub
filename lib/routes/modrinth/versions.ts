// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';
import got from '@/utils/got';

const customGot = got.extend({
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
        /** @type {string | undefined} */
        routeParams,
    } = ctx.req.param();

    /**
     * /@type {{
     *   loaders: string | string[] | undefined
     *   game_versions: string | string[] | undefined
     *   featured: string | undefined
     * }}
     */
    const parsedQuery = new URLSearchParams(routeParams);

    parsedQuery.set('loaders', parsedQuery.has('loaders') ? JSON.stringify(parsedQuery.getAll('loaders')) : '');
    parsedQuery.set('game_versions', parsedQuery.has('game_versions') ? JSON.stringify(parsedQuery.getAll('game_versions')) : '');

    try {
        /** @type {import('./api').Project} */
        const project = await customGot(`https://api.modrinth.com/v2/project/${id}`).json();
        /** @type {import('./api').Version[]} */
        const versions = await customGot(`https://api.modrinth.com/v2/project/${id}/version`, {
            searchParams: parsedQuery,
        }).json();
        /** @type {import('./api').Author[]} */
        const authors = await customGot(`https://api.modrinth.com/v2/users`, {
            searchParams: {
                ids: JSON.stringify(versions.map((it) => it.author_id)),
            },
        }).json();

        ctx.set('data', {
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
        });
    } catch (error) {
        if (error?.response?.statusCode === 404) {
            throw new Error(`${error.message}: Project ${id} not found`);
        }
        throw error;
    }
};
