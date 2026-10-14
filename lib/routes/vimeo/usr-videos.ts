import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/user/:username/:cat?',
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/vimeo/user/filmsupply/picks',
    parameters: {
        username: 'In this example [https://vimeo.com/filmsupply](https://vimeo.com/filmsupply)  is `filmsupply`',
        cat: "deafult for all latest videos, others categories in this example such as `Docmentary`, `Narrative`, `Drama`. Set `picks` for promote orders, just orderd like web page. When `picks` added, published date won't show up",
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Profile',
    maintainers: ['MisteryMonster'],
    handler,
    description: `::: tip Special category name attention
Some of the categories contain slash like \`3D/CG\` , must change the slash \`/\` to the vertical bar\`|\`.
:::`,
};

async function handler(ctx) {
    const tokenResponse = await got({
        method: 'get',
        url: 'https://vimeo.com/_rv/viewer',
    });
    const vimeoAuthorization = tokenResponse.data.jwt;

    const { username, cat } = ctx.req.param();

    const profileResponse = await got({
        method: 'get',
        url: `https://api.vimeo.com/users/${username}?fields=name,gender,bio,uri,link,categories&fetch_user_profile=1`,
        headers: {
            Authorization: `jwt ${vimeoAuthorization}`,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
    });

    const profileData = profileResponse.data;
    const categories = profileResponse.data.categories;

    let categoryWord;
    if (cat && categories.length > 0) {
        for (const catj of categories) {
            if (decodeURIComponent(cat).replaceAll('|', '/') === catj.name) {
                categoryWord = catj.word;
            }
        }
    }

    let urlFilter = `&filter=category&filter_category=${categoryWord}`;
    if (!cat) {
        urlFilter = '';
    }
    if (!categoryWord && cat && cat !== 'picks') {
        throw new NotFoundError('Unknown Vimeo user category. Use picks, a category listed on the profile, or omit this parameter.');
    }
    const picked = cat && cat === 'picks';

    const videoUrl = `${profileData.uri}/videos?fields=name,uri,description,created_time&include_videos=1&page=1&per_page=10${urlFilter}`;
    const picksUrl = `/users/${username}/profile_sections?fields=videos.data.clip.name,videos.data.clip.uri,videos.data.clip.description,videos.data.clip.created_time&include_videos=1&badge=1&page=1&per_page=10`;

    const contentResponse = await got({
        method: 'get',
        url: `https://api.vimeo.com${picked ? picksUrl : videoUrl}`,
        headers: {
            Authorization: `jwt ${vimeoAuthorization}`,
            Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
    });
    const videos = picked ? contentResponse.data.data[0].videos.data : contentResponse.data.data;

    return {
        title: `${profileData.name} ${categoryWord ? cat.replaceAll('|', '/') : ''} ${picked ? 'picks' : ''} | Vimeo `,
        link: profileData.link,
        description: profileData.bio,

        item: videos.map((item) => {
            const videoDescription = picked ? item.clip.description : item.description;

            return {
                title: picked ? item.clip.name : item.name,
                description: renderDescription({
                    videoUrl: picked ? item.clip.uri.replace('/videos', '') : item.uri.replace('/videos', ''),
                    vdescription: videoDescription ? videoDescription.replaceAll('\n', '<br>') : '',
                }),
                pubDate: !picked && !cat && item.created_time ? parseDate(item.created_time) : undefined,
                link: `https://vimeo.com${picked ? item.clip.uri.replace('videos/', '') : item.uri.replace('videos/', '')}`,
                author: profileData.name,
            };
        }),
    };
}
