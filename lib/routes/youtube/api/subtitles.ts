import { getSubtitles } from 'youtube-caption-extractor';
import pMap from 'p-map';
import cache from '@/utils/cache';

function pad(n: number, width: number = 2) {
    return String(n).padStart(width, '0');
}

function toSrtTime(seconds: number): string {
    const totalMs = Math.floor(seconds * 1000);
    const hours = Math.floor(totalMs / 3_600_000);
    const minutes = Math.floor((totalMs % 3_600_000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const millis = totalMs % 1000;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
}

export type Subtitle = {
    start: string;
    dur: string;
    text: string;
};

function convertToSrt(segments: Subtitle[]): string {
    return segments
        .map((seg, index) => {
            const start = Number.parseFloat(seg.start);
            const end = start + Number.parseFloat(seg.dur);
            return `${index + 1}
${toSrtTime(start)} --> ${toSrtTime(end)}
${seg.text}
`;
        })
        .join('\n');
}

export const getSubtitlesByVideoId = (videoId: string) =>
    cache.tryGet(`youtube:getSubtitlesByVideoId:${videoId}`, async () => {
        try {
            const subtitles = await getSubtitles({ videoID: videoId });
            const srt = convertToSrt(subtitles);
            return srt;
        } catch {
            // Return empty string if subtitles are not available
            return '';
        }
    });

const createSubtitleDataUrl = (srt: string): string => `data:text/plain;charset=utf-8,${encodeURIComponent(srt)}`;

function createSrtAttachmentFromSrt(srt: string): Array<{ url: string; mime_type: string; title: string }> {
    if (!srt || srt.trim() === '') {
        return [];
    }

    const dataUrl = createSubtitleDataUrl(srt);
    return [
        {
            url: dataUrl,
            mime_type: 'text/srt',
            title: 'Subtitles',
        },
    ];
}

export const getSrtAttachment = async (videoId: string): Promise<Array<{ url: string; mime_type: string; title: string }>> => {
    try {
        const srt = await getSubtitlesByVideoId(videoId);
        return createSrtAttachmentFromSrt(srt);
    } catch {
        return [];
    }
};

export const getSrtAttachmentBatch = async (videoIds: string[]) => {
    const results = await pMap(
        videoIds,
        async (videoId) => {
            const srt = await getSubtitlesByVideoId(videoId);
            return { videoId, srt: createSrtAttachmentFromSrt(srt) };
        },
        { concurrency: 5 }
    );

    return Object.fromEntries(results.map(({ videoId, srt }) => [videoId, srt]));
};
