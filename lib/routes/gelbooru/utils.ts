import path from 'node:path';
import { art } from '@/utils/render';
import { config } from '@/config';

export function renderDesc(post, link, quality: 'sample' | 'orig') {
    const { id, source, owner, file_url: fileUrl, tags, score } = post;
    const isHttp = /^https?:\/\//.test(source);
    const sourceHost = isHttp ? new URL(source).host : source || 'unknown';
    const imgQualityMap = { sample: 'sample_url', orig: 'file_url' };

    // 判断是否是视频链接
    const videoExtList = ['mp4', 'webm'];
    const fileExt = fileUrl.slice(fileUrl.lastIndexOf('.') + 1);
    const isVideo = videoExtList.includes(fileExt);
    // 如果是视频则始终使用 fileUrl（原文件）
    let contentURL = post[imgQualityMap[quality]] || fileUrl;
    if (isVideo) {
        contentURL = fileUrl;
    }

    return art(path.join(__dirname, 'templates/description.art'), {
        id,
        source,
        owner,
        tags,
        link,
        isHttp,
        sourceHost,
        contentURL,
        isVideo,
        score: score || 0,
    });
}

export function getAPIKeys() {
    return {
        apiKey: config.gelbooru.apiKey || '',
        userId: config.gelbooru.userId || '',
    };
}
