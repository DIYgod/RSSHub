import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import crypto from 'node:crypto';
import path from 'node:path';
import { art } from '@/utils/render';
import { getAppreciatedQuery, getProfileProjectsAndSelectionsQuery, getProjectPageQuery } from './queries';

export const route: Route = {
    path: '/:user/:type?',
    categories: ['design', 'popular'],
    view: ViewType.Pictures,
    example: '/behance/mishapetrick',
    parameters: {
        user: 'username',
        type: {
            description: 'type',
            options: [
                { value: 'projects', label: 'projects' },
                { value: 'appreciated', label: 'appreciated' },
            ],
            default: 'projects',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Works',
    maintainers: ['MisteryMonster'],
    handler,
    description: `Behance user's profile URL, like [https://www.behance.net/mishapetrick](https://www.behance.net/mishapetrick) the username will be \`mishapetrick\`。`,
};

const getUserProfile = async (nodes, user) =>
    (await cache.tryGet(`behance:profile:${user}`, () => {
        const profile = nodes.flatMap((item) => item.owners).find((owner) => owner.username === user);

        return Promise.resolve({
            displayName: profile.displayName,
            id: profile.id,
            link: profile.url,
            image: profile.images.size_50.url.replace('/user/50/', '/user/source/'),
        });
    })) as { displayName: string; id: string; link: string; image: string };

async function handler(ctx) {
    const { user, type = 'projects' } = ctx.req.param();

    const uuid = crypto.randomUUID();
    const headers = {
        Cookie: `gk_suid=${Math.random().toString().slice(2, 10)}, gki=; originalReferrer=; bcp=${uuid}`,
        'X-BCP': uuid,
        'X-Requested-With': 'XMLHttpRequest',
    };

    const response = await ofetch('https://www.behance.net/v3/graphql', {
        method: 'POST',
        headers,
        body: {
            query: type === 'projects' ? getProfileProjectsAndSelectionsQuery : getAppreciatedQuery,
            variables: {
                username: user,
                after: '',
            },
        },
    });

    const nodes = type === 'projects' ? response.data.user.profileProjects.nodes : response.data.user.appreciatedProjects.nodes;
    const list = nodes.map((item) => ({
        title: item.name,
        link: item.url,
        author: item.owners.map((owner) => owner.displayName).join(', '),
        image: item.covers.size_202.url.replace('/202/', '/source/'),
        pubDate: item.publishedOn ? parseDate(item.publishedOn, 'X') : undefined,
        category: item.fields?.map((field) => field.label.toLowerCase()),
        projectId: item.id,
    }));

    const profile = await getUserProfile(nodes, user);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch('https://www.behance.net/v3/graphql', {
                    method: 'POST',
                    headers,
                    body: {
                        query: getProjectPageQuery,
                        variables: {
                            projectId: item.projectId,
                        },
                    },
                });
                const project = response.data.project;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: project.description,
                    modules: project.allModules,
                });
                item.category = [...new Set([...(item.category || []), ...(project.tags?.map((tag) => tag.title.toLowerCase()) || [])])];
                item.pubDate = item.pubDate || (project.publishedOn ? parseDate(project.publishedOn, 'X') : undefined);

                return item;
            })
        )
    );

    return {
        title: `${profile.displayName}'s ${type}`,
        link: `https://www.behance.net/${user}/${type}`,
        image: profile.image,
        item: items,
    };
}
