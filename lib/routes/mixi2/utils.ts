import { Category, MixiClient, type Post } from 'mixi2';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import ofetch from '@/utils/ofetch';

export function getClient() {
    const { authToken, authKey } = config.mixi2;

    if (!authToken || !authKey) {
        throw new ConfigNotFoundError('MIXI2_AUTH_TOKEN and MIXI2_AUTH_KEY are required');
    }

    return new MixiClient(`auth_token=${authToken}`, authKey, {
        httpAdapter: ofetch,
    });
}

export function parsePost(post: Post) {
    let description = `<p>${post.text}</p>`;

    for (const media of post.medias ?? []) {
        if (media.category === Category.CATEGORY_POST_IMAGE) {
            description += `<img src="${media.postImage?.largeImageUrl ?? media.postImage?.smallImageUrl}"${media.description ? `alt="${media.description}"` : ''} />`;
        } else if (media.category === Category.CATEGORY_POST_VIDEO) {
            description += `<img src="${media.postVideo?.previewImageUrl}" alt="${media.description}" />`;
        }
    }
    return description;
}

export const CONFIG_OPTIONS = [
    {
        name: 'MIXI2_AUTH_TOKEN',
        description: 'mixi2ログイン後の情報。ブラウザのコンソールでクッキーから `auth_token` の値を取得してください',
    },
    {
        name: 'MIXI2_AUTH_KEY',
        description: 'mixi2ログイン後の情報。ブラウザのコンソールでリクエストヘッダーから `x-auth-key` の値を取得してください',
    },
];
