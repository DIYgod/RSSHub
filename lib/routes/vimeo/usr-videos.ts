import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/user/:username/:cat?',
    categories: ['social-media', 'popular'],
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
    const tokenresponse = await got({
        method: 'get',
        url: 'https://vimeo.com/_rv/viewer',
    });
    const VimeoAuthorization = tokenresponse.data.jwt;

    const { username, cat } = ctx.req.param();

    const profileresponse = await got({
        method: 'get',
        url: `https://api.vimeo.com/users/${username}?fields=name,gender,bio,uri,link,categories&fetch_user_profile=1`,
        headers: {
            Authorization: `jwt ${VimeoAuthorization}`,
        },
    });

    const profilesjs = profileresponse.data;
    const catjs = profileresponse.data.categories;

    let catword;
    if (cat && catjs.length > 0) {
        for (const catj of catjs) {
            if (decodeURIComponent(cat).replaceAll('|', '/') === catj.name) {
                catword = catj.word;
            }
        }
    }

    let urlfilter = `&filter=category&filter_category=${catword}`;
    if (!cat) {
        urlfilter = '';
    }
    if (!catword && cat && cat !== 'picks') {
        return '';
    }
    const picked = cat && cat === 'picks';

    const Vimeocat = `${profilesjs.uri}/videos?fields=name,uri,description,created_time&include_videos=1&page=1&per_page=10${urlfilter}`;
    const Vimeoallpicks = `/users/${username}/profile_sections?fields=videos.data.clip.name,videos.data.clip.uri,videos.data.clip.description,videos.data.clip.created_time&include_videos=1&badge=1&page=1&per_page=10`;

    const contentresponse = await got({
        method: 'get',
        url: `https://api.vimeo.com${picked ? Vimeoallpicks : Vimeocat}`,
        headers: {
            Authorization: `jwt ${VimeoAuthorization}`,
        },
    });
    const vimeojs = picked ? contentresponse.data.data[0].videos.data : contentresponse.data.data;

    return {
        title: `${profilesjs.name} ${catword ? cat.replace('|', '/') : ''} ${picked ? 'picks' : ''} | Vimeo `,
        link: profilesjs.link,
        description: profilesjs.bio,

        item: vimeojs.map((item) => {
            const vdescription = picked ? item.clip.description : item.description;

            return {
                title: picked ? item.clip.name : item.name,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    videoUrl: picked ? item.clip.uri.replace('/videos', '') : item.uri.replace('/videos', ''),
                    vdescription: vdescription ? vdescription.replaceAll('\n', '<br>') : '',
                }),
                pubDate: parseDate(picked || cat ? '' : item.created_time),
                link: `https://vimeo.com${picked ? item.clip.uri.replace('videos/', '') : item.uri.replace('videos/', '')}`,
                author: profilesjs.name,
            };
        }),
    };
}
