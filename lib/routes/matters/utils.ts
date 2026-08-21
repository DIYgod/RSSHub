import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://matters.town';
export const gqlEndpoint = 'https://server.matters.town/graphql';

interface Tag {
    content: string;
}

interface Author {
    displayName: string;
}

interface Article {
    shortHash: string;
    title: string;
    content: string;
    createdAt: string;
    author: Author;
    tags: Tag[];
}

export const parseItem = (node: Article) => ({
    title: node.title,
    description: node.content,
    link: `${baseUrl}/a/${node.shortHash}`,
    author: node.author.displayName,
    pubDate: parseDate(node.createdAt),
    category: node.tags.map((tag) => tag.content),
});
