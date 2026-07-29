import type { Route } from '@/types';

import { ProcessItems } from '../utils';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['anime'],
    example: '/dlsite/home/new',
    parameters: {
        path: 'Path, `/home/new` by default, as Release Calendar',
    },
    description: `::: tip
To subscribe to this route, you can first visit the site and specify filters, and then fill in the field after \`https://www.dlsite.com/\` in the URL of the corresponding page at the path of the route. Here are 2 examples.

If you subscribe to [Voice / ASMR works Release date - New to Old](https://www.dlsite.com/home/works/type/=/work_type_category/audio/order/release_d), at the URL of the corresponding page \`https://www.dlsite.com/home/works/type/=/work_type_category/audio/order/release_d\` and after \`https://www.dlsite.com/\` is \`home/works/type/=/work_type_category/audio/order/release_d\`, which can be seen as the path. In this case the route is [\`/dlsite/home/works/type/=/work_type_category/audio/order/release_d\`](https://rsshub.app/dlsite/home/works/type/=/work_type_category/audio/order/release_d)

If you subscribe to [Discounted works Latest Discounts - Newest to Oldest](https://www.dlsite.com/home/works/discount/=/order/cstart_d), at the URL of the corresponding page \`https://www.dlsite.com/home/works/discount/=/order/cstart_d\` and after \`https://www.dlsite.com/\` is \`home/works/discount/=/order/cstart_d\`, which can be seen as the path. In this case the route is [\`/dlsite/home/works/discount/=/order/cstart_d\`](https://rsshub.app/dlsite/home/works/discount/=/order/cstart_d)
:::`,
    name: 'General',
    maintainers: ['nczitzk'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    return await ProcessItems(ctx);
}
