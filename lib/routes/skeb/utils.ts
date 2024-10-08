import { DataItem } from '@/types';

export const baseUrl = 'https://skeb.jp';

export function processWorkItem(item: any): DataItem | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    if (item.private === true) {
        return null;
    }

    const imageUrl = item.thumbnail_image_urls?.srcset?.split(',').pop()?.trim().split(' ')[0];
    return {
        title: item.path || '',
        link: `${baseUrl}${item.path || ''}`,
        description: `${imageUrl ? `<img src="${imageUrl}" /><br>` : ''}${item.body || ''}`,
    };
}

export function processCreatorItem(item: any): DataItem | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    return {
        title: item.name || '',
        link: `${baseUrl}/@${item.screen_name || ''}`,
        description: item.avatar_url ? `<img src="${item.avatar_url}" />` : '',
    };
}
