import { ImageResult, MetadataResponse, TagResponse, TagsResponse, RepositoriesResponse, RepositoryResult } from './types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

export const getMetadata = (namespace: string): Promise<MetadataResponse> =>
    cache.tryGet(`dockerhub:metadata:${namespace}`, async () => {
        const response = await ofetch<MetadataResponse>(`https://hub.docker.com/v2/repositories/${namespace}`);
        return response;
    }) as Promise<MetadataResponse>;

export const getRepositories = (owner: string, page_size: number): Promise<RepositoriesResponse> => ofetch<RepositoriesResponse>(`https://hub.docker.com/v2/repositories/${owner}?page_size=${page_size}`);

export const getTag = (namespace: string, tag: string): Promise<TagResponse> => ofetch<TagResponse>(`https://hub.docker.com/v2/repositories/${namespace}/tags/${tag}`);

export const getTags = (namespace: string, page_size: number): Promise<TagsResponse> => ofetch<TagsResponse>(`https://hub.docker.com/v2/repositories/${namespace}/tags?page_size=${page_size}`);

export const getOwnerLink = (owner: string): string => `https://hub.docker.com/u/${owner}`;

export const getRepositoryLink = (owner: string, image: string): string => (owner === 'library' ? `https://hub.docker.com/_/${image}` : `https://hub.docker.com/r/${owner}/${image}`);

export const getLayerLink = (owner: string, image: string, tag: string, digest: string): string => {
    const namespace = `${owner}/${image}`;
    const imageDigest = digest.replace(':', '-');
    return `https://hub.docker.com/layers/${namespace}/${tag}/images/${imageDigest}`;
};

export const sortedImages = (images: ImageResult[]): ImageResult[] => {
    const sorted = images.sort((a, b) => imageDescription(a).localeCompare(imageDescription(b)));
    return sorted;
};

export const getPubDate = (item: TagResponse | RepositoryResult): Date => parseDate(item.last_updated);

export const getGuid = (namespace: string, item: TagResponse): string => {
    const entries = sortedImages(item.images).map((image) => imageDescription(image));
    const text = md5(entries.join('|'));
    return `${namespace}:${item.name}@${text}`;
};

export const getArchitecture = (image: ImageResult): string => {
    const variant = image.variant ? `/${image.variant}` : '';
    return `${image.os}/${image.architecture}${variant}`;
};

const imageDescription = (image: ImageResult): string => {
    const description = `${getArchitecture(image)},${image.digest}`;
    return description;
};

export default {
    getMetadata,
    getRepositories,
    getTag,
    getTags,
    getOwnerLink,
    getRepositoryLink,
    getLayerLink,
    getPubDate,
    getGuid,
    sortedImages,
    getArchitecture,
};
