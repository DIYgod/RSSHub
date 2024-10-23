import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '第一会所',
    url: 'sis001.com',
    description: `:::tip
    第一会所有多个备用网址，本路由默认使用 \`https://www.sis001.com\`，若该网址无法访问，可以通过在路由最后加上 \`?baseUrl=<网址>\` 指定路由访问的网址。如指定备用网址为 \`https://sis001.com\`，则在所有第一会所路由最后加上 \`?baseUrl=https://sis001.com\` 即可，此时路由为 [\`/sis001/forum/322?baseUrl=https://sis001.com\`](https://rsshub.app/sis001/forum/322?baseUrl=https://sis001.com)
    :::`,
};
