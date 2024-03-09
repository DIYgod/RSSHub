import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Twitter',
    url: 'twitter.com',
    description: `Specify options (in the format of query string) in parameter \`routeParams\` to control some extra features for Tweets

| Key                            | Description                                                                                                                          | Accepts                | Defaults to                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------------- |
| \`readable\`                     | Enable readable layout                                                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`authorNameBold\`               | Display author name in bold                                                                                                          | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showAuthorInTitle\`            | Show author name in title                                                                                                            | \`0\`/\`1\`/\`true\`/\`false\` | \`false\` (\`true\` in \`/twitter/followings\`) |
| \`showAuthorInDesc\`             | Show author name in description (RSS body)                                                                                           | \`0\`/\`1\`/\`true\`/\`false\` | \`false\` (\`true\` in \`/twitter/followings\`) |
| \`showQuotedAuthorAvatarInDesc\` | Show avatar of quoted Tweet's author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showAuthorAvatarInDesc\`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)                | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showEmojiForRetweetAndReply\`  | Use "🔁" instead of "RT", "↩️" & "💬" instead of "Re"                                                                                | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showSymbolForRetweetAndReply\` | Use " RT " instead of "", " Re " instead of ""                                                                                       | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`                                    |
| \`showRetweetTextInTitle\`       | Show quote comments in title (if \`false\`, only the retweeted tweet will be shown in the title)                                       | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`                                    |
| \`addLinkForPics\`               | Add clickable links for Tweet pictures                                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showTimestampInDescription\`   | Show timestamp in description                                                                                                        | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`showQuotedInTitle\`            | Show quoted tweet in title                                                                                                           | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`widthOfPics\`                  | Width of Tweet pictures                                                                                                              | Unspecified/Integer    | Unspecified                               |
| \`heightOfPics\`                 | Height of Tweet pictures                                                                                                             | Unspecified/Integer    | Unspecified                               |
| \`sizeOfAuthorAvatar\`           | Size of author's avatar                                                                                                              | Integer                | \`48\`                                      |
| \`sizeOfQuotedAuthorAvatar\`     | Size of quoted tweet's author's avatar                                                                                               | Integer                | \`24\`                                      |
| \`excludeReplies\`               | Exclude replies, only available in \`/twitter/user\`                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`includeRts\`                   | Include retweets, only available in \`/twitter/user\`                                                                                  | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`                                    |
| \`forceWebApi\`                  | Force using Web API even if Developer API is configured, only available in \`/twitter/user\` and \`/twitter/keyword\`                    | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`                                   |
| \`count\`                        | \`count\` parameter passed to Twitter API, only available in \`/twitter/user\`                                                           | Unspecified/Integer    | Unspecified                               |

Specify different option values than default values to improve readability. The URL

\`\`\`
https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150
\`\`\`

generates

<img loading="lazy" src="/img/readable-twitter.png" alt="Readable Twitter RSS of Durov" />`,
};
