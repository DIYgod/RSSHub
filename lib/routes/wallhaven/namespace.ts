import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'wallhaven',
    url: 'wallhaven.cc',
    description: `::: tip
When parameter **Need Details** is set to \`true\` \`yes\` \`t\` \`y\`, RSS will add the title, uploader, upload time, and category information of each image, which can support the filtering function of RSS reader.

However, the number of requests to the site increases a lot when it is turned on, which causes the site to return \`Response code 429 (Too Many Requests)\`. So you need to specify a smaller \`limit\` parameter, i.e. add \`?limit=<the number of posts for a request>\` after the route, here is an example.

For example [Latest Wallpapers](https://wallhaven.cc/latest), the route turning on **Need Details** is [/wallhaven/latest/true](https://rsshub.app/wallhaven/latest/true), and then specify a smaller \`limit\`. We can get [/wallhaven/latest/true?limit=5](https://rsshub.app/wallhaven/latest/true?limit=5).
:::`,
    lang: 'en',
};
