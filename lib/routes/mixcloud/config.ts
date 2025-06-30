export const MIXCLOUD_CONFIG = {
    host: 'https://www.mixcloud.com',
    imageBaseURL: 'https://thumbnailer.mixcloud.com/unsafe/480x480/',
    graphqlURL: 'https://app.mixcloud.com/graphql',
    decryptionKey: 'IFYOUWANTTHEARTISTSTOGETPAIDDONOTDOWNLOADFROMMIXCLOUD',
    headers: {
        Referer: 'https://www.mixcloud.com',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
};

export const TYPE_CONFIG = {
    uploads: 'uploads',
    reposts: 'reposted',
    favorites: 'favorites',
    listens: 'listeningHistory',
    stream: 'stream',
    playlist: 'items',
};

export const TYPE_NAMES = {
    uploads: 'Shows',
    reposts: 'Reposts',
    favorites: 'Favorites',
    listens: 'History',
    stream: 'Stream',
    playlist: 'Playlist',
};

export const CLOUDCAST_FIELDS = `
  id
  slug
  name
  description
  publishDate
  audioLength
  picture(width: 1024, height: 1024) {
    url
  }
  owner {
    displayName
    username
    url
  }
  streamInfo {
    url
    hlsUrl
    dashUrl
  }
  favorites {
    totalCount
  }
  reposts {
    totalCount
  }
  plays
  tags {
    tag {
      name
    }
  }
  featuringArtistList
  isExclusive
  restrictedReason
  comments(first: 100) {
    edges {
      node {
        comment
        created
        user {
          displayName
          username
        }
      }
    }
    totalCount
  }
`;

export function getObjectFields(type: string): { objectType: string; objectFields: string } {
    if (type === 'playlist') {
        return {
            objectType: 'playlist',
            objectFields: `
        name
        description
        picture {
          urlRoot
        }
        items(first: 100) {
          edges {
            node {
              cloudcast {
                ${CLOUDCAST_FIELDS}
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      `,
        };
    } else {
        const nodeTemplate = type === 'listens' ? `node { cloudcast { ${CLOUDCAST_FIELDS} } }` : `node { ${CLOUDCAST_FIELDS} }`;

        return {
            objectType: 'user',
            objectFields: `
        displayName
        biog
        picture {
          urlRoot
        }
        ${TYPE_CONFIG[type]}(first: 100) {
          edges {
            ${nodeTemplate}
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      `,
        };
    }
}
