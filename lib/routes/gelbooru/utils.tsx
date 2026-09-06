import { renderToString } from 'hono/jsx/dom/server';

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

    return renderDescription({
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

const renderDescription = ({ id, source, owner, tags, link, isHttp, sourceHost, contentURL, isVideo, score }): string =>
    renderToString(
        <>
            <div>{isVideo ? <video controls preload="metadata" src={contentURL}></video> : <img src={contentURL} />}</div>
            <h2>
                Info of <a href={link}>#{id}</a>:{' '}
            </h2>
            <p>
                {isHttp ? <a href={source}>Source</a> : <span>Source: {source}</span>} ({sourceHost})
            </p>
            <p>
                Upload by: <a href={`https://gelbooru.com/index.php?page=post&s=list&tags=user:${owner}`}>{owner}</a>
            </p>
            <p>Score: {score}</p>
            <p>
                Tags: <p>{tags}</p>
            </p>
        </>
    );

export function getAPIKeys() {
    return {
        apiKey: config.gelbooru.apiKey || '',
        userId: config.gelbooru.userId || '',
    };
}
