import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';
import got from '@/utils/got';
import MarkdownIt from 'markdown-it';
import type { Author, Project, Version } from '@/routes/modrinth/api';
import type { Context } from 'hono';

const __dirname = getCurrentPath(import.meta.url);

const customGot = got.extend({
    headers: {
        // https://docs.modrinth.com/#section/User-Agents
        'user-agent': config.trueUA,
    },
});
const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/project/:id/versions/:routeParams?',
    categories: ['game'],
    example: '/modrinth/project/sodium/versions',
    parameters: {
        id: 'Id or slug of the Modrinth project',
        routeParams: 'Extra route params. See the table below for options',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: [
                'modrinth.com/mod/:id/*',
                'modrinth.com/plugin/:id/*',
                'modrinth.com/datapack/:id/*',
                'modrinth.com/shader/:id/*',
                'modrinth.com/resourcepack/:id/*',
                'modrinth.com/modpack/:id/*',
                'modrinth.com/mod/:id',
                'modrinth.com/plugin/:id',
                'modrinth.com/datapack/:id',
                'modrinth.com/shader/:id',
                'modrinth.com/resourcepack/:id',
                'modrinth.com/modpack/:id',
            ],
            target: '/project/:id/versions',
        },
    ],
    name: 'Project versions',
    maintainers: ['SettingDust'],
    handler,
    description: `| Name           | Example                                      |
| -------------- | -------------------------------------------- |
| loaders        | loaders=fabric&loaders=quilt&loaders=forge |
| game_versions | game_versions=1.20.1&game_versions=1.20.2 |
| featured       | featured=true                                |`,
};

async function handler(ctx: Context) {
    const { id, routeParams } = <
        {
            id: string;
            routeParams?: string;
        }
    >ctx.req.param();

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
        const project = await customGot(`https://api.modrinth.com/v2/project/${id}`).json<Project>();
        const versions = await customGot(`https://api.modrinth.com/v2/project/${id}/version`, {
            searchParams: parsedQuery,
        }).json<Version[]>();
        const authors = await customGot(`https://api.modrinth.com/v2/users`, {
            searchParams: {
                ids: JSON.stringify(versions.map((it) => it.author_id)),
            },
        }).json<Author[]>();

        return {
            title: `${project.title} Modrinth versions`,
            description: project.description,
            link: `https://modrinth.com/project/${id}`,
            item: versions.map((it, index) => ({
                title: `${it.name} for ${it.loaders.join('/')} on ${[...new Set([it.game_versions[0], it.game_versions.at(-1)])].join('-')}`,
                link: `https://modrinth.com/project/${id}/version/${it.version_number}`,
                pubDate: parseDate(it.date_published),
                description: art(path.join(__dirname, 'templates/version.art'), {
                    ...it,
                    changelog: md.render(it.changelog),
                }),
                guid: it.id,
                author: authors[index].name,
            })),
        };
    } catch (error: any) {
        if (error?.response?.statusCode === 404) {
            throw new Error(`${error.message}: Project ${id} not found`);
        }
        throw error;
    }
}
