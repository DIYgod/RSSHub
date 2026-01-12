import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'E-Hentai',
    description: `For RSS content, specify options in the \`routeParams\` parameter in query string format to control additional functionality

| Key          | Meaning                                                                         | Accepted keys  | Default value |
| ------------ | ------------------------------------------------------------------------------- | -------------- | ------------- |
| bittorrent   | Whether include a link to the latest torrent                                    | 0/1/true/false | false         |
| embed_thumb | Whether the cover image is embedded in the RSS feed rather than given as a link | 0/1/true/false | false         |`,
    lang: 'en',
};
