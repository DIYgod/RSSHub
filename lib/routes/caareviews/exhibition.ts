import { rootUrl, getList, getItems } from './utils';

export default async (ctx) => {
    const url = `${rootUrl}/reviews/exhibition`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    ctx.set('data', {
        title: 'Exhibition Reviews',
        link: url,
        item: items,
    });
};
