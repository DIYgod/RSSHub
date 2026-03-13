import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import type { Author, Project, Version } from '@/routes/modrinth/api';
import type { Route } from '@/types';
import _ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ofetch = _ofetch.create({
    headers: {
        // https://docs.modrinth.com/#section/User-Agents
        'user-agent': config.trueUA,
    },
});

const md = MarkdownIt({
    html: true,
});

const renderVersion = (version: Version & { changelog?: string }) =>
    renderToString(
        <>
            <p>
                {version.name} - {version.version_number}
            </p>
            <p>
                <b>Loaders: </b>
                {version.loaders?.map((loader) => `${loader} `)}
            </p>
            <p>
                <b>Game Versions: </b>
                {version.game_versions?.map((gameVersion) => `${gameVersion} `)}
            </p>
            {version.changelog ? raw(version.changelog) : null}
            <p>Files:</p>
            {version.files?.map((file) => (
                <p>
                    <a href={file.url}>{file.filename}</a>
                </p>
            ))}
        </>
    );

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
    const { id, routeParams } = ctx.req.param() as {
        id: string;
        routeParams?: string;
    };

    /**
     * /@type {{
     *   loaders: string | string[] | undefined
     *   game_versions: string | string[] | undefined
     *   featured: string | undefined
     * }}
     */
    const parsedQuery = new URLSearchParams(routeParams);

    try {
        const project = await ofetch<Project>(`https://api.modrinth.com/v2/project/${id}`);
        const versions = await ofetch<Version[]>(`https://api.modrinth.com/v2/project/${id}/version`, {
            query: {
                loaders: parsedQuery.has('loaders') ? JSON.stringify(parsedQuery.getAll('loaders')) : '',
                game_versions: parsedQuery.has('game_versions') ? JSON.stringify(parsedQuery.getAll('game_versions')) : '',
            },
        });
        const authors = await ofetch<Author[]>(`https://api.modrinth.com/v2/users`, {
            query: {
                ids: JSON.stringify([...new Set(versions.map((it) => it.author_id))]),
            },
        });
        const groupedAuthors: Record<string, Author> = {};
        for (const author of authors) {
            groupedAuthors[author.id] = author;
        }

        return {
            title: `${project.title} Modrinth versions`,
            description: project.description,
            link: `https://modrinth.com/project/${id}`,
            item: versions.map((it) => ({
                title: `${it.name} for ${it.loaders.join('/')} on ${[...new Set([it.game_versions[0], it.game_versions.at(-1)])].join('-')}`,
                link: `https://modrinth.com/project/${id}/version/${it.version_number}`,
                pubDate: parseDate(it.date_published),
                description: renderVersion({
                    ...it,
                    changelog: md.render(it.changelog),
                }),
                guid: it.id,
                author: groupedAuthors[it.author_id].username,
            })),
        };
    } catch (error: any) {
        if (error?.response?.statusCode === 404) {
            throw new Error(`${error.message}: Project ${id} not found`, { cause: error });
        }
        throw error;
    }
}
