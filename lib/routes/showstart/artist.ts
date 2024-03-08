import { Route } from '@/types';
import { TITLE, HOST } from './const';
import { fetchPerformerInfo } from './service';

export const route: Route = {
    path: '/artist/:id',
    categories: ['game'],
    example: '/showstart/artist/301783',
    parameters: { id: '音乐人 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.showstart.com/artist/:id'],
    },
    name: '音乐人 - 演出更新',
    maintainers: ['lchtao26'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const artist = await fetchPerformerInfo({
        performerId: id,
    });
    return {
        title: `${TITLE} - ${artist.name}`,
        description: artist.content,
        link: `${HOST}/artist/${artist.id}`,
        item: artist.activityList,
    };
}
