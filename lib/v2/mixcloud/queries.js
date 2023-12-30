const queries = {
    stream: {
        query: `query UserStreamQuery(
            $lookup: UserLookup!
          ) {
            user: userLookup(lookup: $lookup) {
              username
              ...UserStreamPage_user
              id
            }
            viewer {
              ...UserStreamPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isExclusive
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            owner {
              id
              username
              isSubscribedTo
              isViewer
              affiliateUsers {
                totalCount
              }
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
          }

          fragment AudioCardAddToButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
          }

          fragment AudioCardBoostButton_cloudcast on Cloudcast {
            id
            isPublic
            owner {
              id
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_cloudcast on Cloudcast {
            id
            isFavorited
            isPublic
            hiddenStats
            favorites {
              totalCount
            }
            slug
            owner {
              id
              isFollowing
              username
              isSelect
              displayName
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardHighlightButton_cloudcast on Cloudcast {
            id
            isPublic
            isHighlighted
            owner {
              isViewer
              id
            }
          }

          fragment AudioCardHighlightButton_viewer on Viewer {
            me {
              id
              hasProFeatures
              highlighted {
                totalCount
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              displayName
              country
              username
              isSubscribedTo
              isViewer
              id
            }
            slug
            isAwaitingAudio
            isDraft
            isPlayable
            streamInfo {
              hlsUrl
              dashUrl
              url
              uuid
            }
            audioLength
            currentPosition
            proportionListened
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusivePreviewOnly
            isExclusive
            isDisabledCopyright
          }

          fragment AudioCardProgress_cloudcast on Cloudcast {
            id
            proportionListened
            audioLength
          }

          fragment AudioCardRepostButton_cloudcast on Cloudcast {
            id
            isReposted
            isExclusive
            isPublic
            reposts {
              totalCount
            }
            owner {
              isViewer
              isSubscribedTo
              id
            }
          }

          fragment AudioCardRepostButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardShareButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
            slug
            description
            audioType
            picture {
              urlRoot
            }
            owner {
              displayName
              isViewer
              username
              id
            }
          }

          fragment AudioCardStats_cloudcast on Cloudcast {
            isExclusive
            isDraft
            hiddenStats
            plays
            publishDate
            qualityScore
            listenerMinutes
            owner {
              isSubscribedTo
              id
            }
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
            ...AudioCardTags_cloudcast
          }

          fragment AudioCardSubLinks_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
            }
            creatorAttributions(first: 2) {
              totalCount
              edges {
                node {
                  id
                  displayName
                  username
                  ...Hovercard_user
                }
              }
            }
          }

          fragment AudioCardTags_cloudcast on Cloudcast {
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
          }

          fragment AudioCardTitle_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            audioQuality
            isLiveRecording
            isExclusive
            owner {
              id
              username
              ...UserBadge_user
            }
            creatorAttributions(first: 2) {
              totalCount
            }
            ...AudioCardSubLinks_cloudcast
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
          }

          fragment AudioCard_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            isAwaitingAudio
            isDraft
            isScheduled
            restrictedReason
            publishDate
            isLiveRecording
            isDisabledCopyright
            owner {
              isViewer
              username
              id
            }
            picture {
              ...UGCImage_picture
            }
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...QuantcastCloudcastTracking_cloudcast
          }

          fragment AudioCard_viewer on Viewer {
            ...AudioCardActions_viewer
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
          }

          fragment ExclusiveCloudcastBadgeContainer_cloudcast on Cloudcast {
            isExclusive
            isExclusivePreviewOnly
            slug
            id
            owner {
              username
              id
            }
          }

          fragment Hovercard_user on User {
            id
          }

          fragment QuantcastCloudcastTracking_cloudcast on Cloudcast {
            owner {
              quantcastTrackingPixel
              id
            }
          }

          fragment ShareAudioCardList_user on User {
            biog
            username
            displayName
            id
            isUploader
            picture {
              urlRoot
            }
          }

          fragment UGCImage_picture on Picture {
            urlRoot
            primaryColor
          }

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserStreamPage_user on User {
            id
            displayName
            username
            ...ShareAudioCardList_user
            stream(first: 10) {
              edges {
                repostedBy
                node {
                  id
                  ...AudioCard_cloudcast
                  __typename
                }
                cursor
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }

          fragment UserStreamPage_viewer on Viewer {
            ...AudioCard_viewer
          }`,
    },
    uploads: {
        query: `query UserUploadsQuery(
            $lookup: UserLookup!
            $orderBy: CloudcastOrderByEnum
          ) {
            user: userLookup(lookup: $lookup) {
              username
              ...UserUploadsPage_user_7FfCv
              id
            }
            viewer {
              ...UserUploadsPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isExclusive
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            owner {
              id
              username
              isSubscribedTo
              isViewer
              affiliateUsers {
                totalCount
              }
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
          }

          fragment AudioCardAddToButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
          }

          fragment AudioCardBoostButton_cloudcast on Cloudcast {
            id
            isPublic
            owner {
              id
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_cloudcast on Cloudcast {
            id
            isFavorited
            isPublic
            hiddenStats
            favorites {
              totalCount
            }
            slug
            owner {
              id
              isFollowing
              username
              isSelect
              displayName
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardHighlightButton_cloudcast on Cloudcast {
            id
            isPublic
            isHighlighted
            owner {
              isViewer
              id
            }
          }

          fragment AudioCardHighlightButton_viewer on Viewer {
            me {
              id
              hasProFeatures
              highlighted {
                totalCount
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              displayName
              country
              username
              isSubscribedTo
              isViewer
              id
            }
            slug
            isAwaitingAudio
            isDraft
            isPlayable
            streamInfo {
              hlsUrl
              dashUrl
              url
              uuid
            }
            audioLength
            currentPosition
            proportionListened
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusivePreviewOnly
            isExclusive
            isDisabledCopyright
          }

          fragment AudioCardProgress_cloudcast on Cloudcast {
            id
            proportionListened
            audioLength
          }

          fragment AudioCardRepostButton_cloudcast on Cloudcast {
            id
            isReposted
            isExclusive
            isPublic
            reposts {
              totalCount
            }
            owner {
              isViewer
              isSubscribedTo
              id
            }
          }

          fragment AudioCardRepostButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardShareButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
            slug
            description
            audioType
            picture {
              urlRoot
            }
            owner {
              displayName
              isViewer
              username
              id
            }
          }

          fragment AudioCardStats_cloudcast on Cloudcast {
            isExclusive
            isDraft
            hiddenStats
            plays
            publishDate
            qualityScore
            listenerMinutes
            owner {
              isSubscribedTo
              id
            }
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
            ...AudioCardTags_cloudcast
          }

          fragment AudioCardSubLinks_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
            }
            creatorAttributions(first: 2) {
              totalCount
              edges {
                node {
                  id
                  displayName
                  username
                  ...Hovercard_user
                }
              }
            }
          }

          fragment AudioCardTags_cloudcast on Cloudcast {
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
          }

          fragment AudioCardTitle_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            audioQuality
            isLiveRecording
            isExclusive
            owner {
              id
              username
              ...UserBadge_user
            }
            creatorAttributions(first: 2) {
              totalCount
            }
            ...AudioCardSubLinks_cloudcast
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
          }

          fragment AudioCard_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            isAwaitingAudio
            isDraft
            isScheduled
            restrictedReason
            publishDate
            isLiveRecording
            isDisabledCopyright
            owner {
              isViewer
              username
              id
            }
            picture {
              ...UGCImage_picture
            }
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...QuantcastCloudcastTracking_cloudcast
          }

          fragment AudioCard_viewer on Viewer {
            ...AudioCardActions_viewer
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
          }

          fragment ExclusiveCloudcastBadgeContainer_cloudcast on Cloudcast {
            isExclusive
            isExclusivePreviewOnly
            slug
            id
            owner {
              username
              id
            }
          }

          fragment Hovercard_user on User {
            id
          }

          fragment QuantcastCloudcastTracking_cloudcast on Cloudcast {
            owner {
              quantcastTrackingPixel
              id
            }
          }

          fragment ShareAudioCardList_user on User {
            biog
            username
            displayName
            id
            isUploader
            picture {
              urlRoot
            }
          }

          fragment UGCImage_picture on Picture {
            urlRoot
            primaryColor
          }

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserUploadsPage_user_7FfCv on User {
            id
            displayName
            username
            isViewer
            ...ShareAudioCardList_user
            uploads(first: 10, isPublic: true, orderBy: $orderBy, audioTypes: [SHOW]) {
              edges {
                node {
                  ...AudioCard_cloudcast
                  id
                  __typename
                }
                cursor
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }

          fragment UserUploadsPage_viewer on Viewer {
            ...AudioCard_viewer
          }`,
    },
    favorites: {
        query: `query UserFavoritesQuery(
            $lookup: UserLookup!
          ) {
            user: userLookup(lookup: $lookup) {
              username
              hiddenFavorites: favorites {
                isHidden
              }
              ...UserFavoritesPage_user
              id
            }
            viewer {
              ...UserFavoritesPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isExclusive
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            owner {
              id
              username
              isSubscribedTo
              isViewer
              affiliateUsers {
                totalCount
              }
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
          }

          fragment AudioCardAddToButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
          }

          fragment AudioCardBoostButton_cloudcast on Cloudcast {
            id
            isPublic
            owner {
              id
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_cloudcast on Cloudcast {
            id
            isFavorited
            isPublic
            hiddenStats
            favorites {
              totalCount
            }
            slug
            owner {
              id
              isFollowing
              username
              isSelect
              displayName
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardHighlightButton_cloudcast on Cloudcast {
            id
            isPublic
            isHighlighted
            owner {
              isViewer
              id
            }
          }

          fragment AudioCardHighlightButton_viewer on Viewer {
            me {
              id
              hasProFeatures
              highlighted {
                totalCount
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              displayName
              country
              username
              isSubscribedTo
              isViewer
              id
            }
            slug
            isAwaitingAudio
            isDraft
            isPlayable
            streamInfo {
              hlsUrl
              dashUrl
              url
              uuid
            }
            audioLength
            currentPosition
            proportionListened
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusivePreviewOnly
            isExclusive
            isDisabledCopyright
          }

          fragment AudioCardProgress_cloudcast on Cloudcast {
            id
            proportionListened
            audioLength
          }

          fragment AudioCardRepostButton_cloudcast on Cloudcast {
            id
            isReposted
            isExclusive
            isPublic
            reposts {
              totalCount
            }
            owner {
              isViewer
              isSubscribedTo
              id
            }
          }

          fragment AudioCardRepostButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardShareButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
            slug
            description
            audioType
            picture {
              urlRoot
            }
            owner {
              displayName
              isViewer
              username
              id
            }
          }

          fragment AudioCardStats_cloudcast on Cloudcast {
            isExclusive
            isDraft
            hiddenStats
            plays
            publishDate
            qualityScore
            listenerMinutes
            owner {
              isSubscribedTo
              id
            }
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
            ...AudioCardTags_cloudcast
          }

          fragment AudioCardSubLinks_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
            }
            creatorAttributions(first: 2) {
              totalCount
              edges {
                node {
                  id
                  displayName
                  username
                  ...Hovercard_user
                }
              }
            }
          }

          fragment AudioCardTags_cloudcast on Cloudcast {
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
          }

          fragment AudioCardTitle_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            audioQuality
            isLiveRecording
            isExclusive
            owner {
              id
              username
              ...UserBadge_user
            }
            creatorAttributions(first: 2) {
              totalCount
            }
            ...AudioCardSubLinks_cloudcast
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
          }

          fragment AudioCard_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            isAwaitingAudio
            isDraft
            isScheduled
            restrictedReason
            publishDate
            isLiveRecording
            isDisabledCopyright
            owner {
              isViewer
              username
              id
            }
            picture {
              ...UGCImage_picture
            }
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...QuantcastCloudcastTracking_cloudcast
          }

          fragment AudioCard_viewer on Viewer {
            ...AudioCardActions_viewer
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
          }

          fragment ExclusiveCloudcastBadgeContainer_cloudcast on Cloudcast {
            isExclusive
            isExclusivePreviewOnly
            slug
            id
            owner {
              username
              id
            }
          }

          fragment Hovercard_user on User {
            id
          }

          fragment QuantcastCloudcastTracking_cloudcast on Cloudcast {
            owner {
              quantcastTrackingPixel
              id
            }
          }

          fragment ShareAudioCardList_user on User {
            biog
            username
            displayName
            id
            isUploader
            picture {
              urlRoot
            }
          }

          fragment UGCImage_picture on Picture {
            urlRoot
            primaryColor
          }

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserFavoritesPage_user on User {
            id
            displayName
            username
            isViewer
            ...ShareAudioCardList_user
            favorites(first: 10) {
              edges {
                node {
                  id
                  ...AudioCard_cloudcast
                  __typename
                }
                cursor
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }

          fragment UserFavoritesPage_viewer on Viewer {
            me {
              id
            }
            ...AudioCard_viewer
          }`,
    },
    listens: {
        query: `query UserListensQuery(
            $lookup: UserLookup!
          ) {
            user: userLookup(lookup: $lookup) {
              username
              hiddenListeningHistory: listeningHistory {
                isHidden
              }
              ...UserListensPage_user
              id
            }
            viewer {
              ...UserListensPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isExclusive
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            owner {
              id
              username
              isSubscribedTo
              isViewer
              affiliateUsers {
                totalCount
              }
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
          }

          fragment AudioCardAddToButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
          }

          fragment AudioCardBoostButton_cloudcast on Cloudcast {
            id
            isPublic
            owner {
              id
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_cloudcast on Cloudcast {
            id
            isFavorited
            isPublic
            hiddenStats
            favorites {
              totalCount
            }
            slug
            owner {
              id
              isFollowing
              username
              isSelect
              displayName
              isViewer
            }
          }

          fragment AudioCardFavoriteButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardHighlightButton_cloudcast on Cloudcast {
            id
            isPublic
            isHighlighted
            owner {
              isViewer
              id
            }
          }

          fragment AudioCardHighlightButton_viewer on Viewer {
            me {
              id
              hasProFeatures
              highlighted {
                totalCount
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              displayName
              country
              username
              isSubscribedTo
              isViewer
              id
            }
            slug
            isAwaitingAudio
            isDraft
            isPlayable
            streamInfo {
              hlsUrl
              dashUrl
              url
              uuid
            }
            audioLength
            currentPosition
            proportionListened
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusivePreviewOnly
            isExclusive
            isDisabledCopyright
          }

          fragment AudioCardProgress_cloudcast on Cloudcast {
            id
            proportionListened
            audioLength
          }

          fragment AudioCardRepostButton_cloudcast on Cloudcast {
            id
            isReposted
            isExclusive
            isPublic
            reposts {
              totalCount
            }
            owner {
              isViewer
              isSubscribedTo
              id
            }
          }

          fragment AudioCardRepostButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment AudioCardShareButton_cloudcast on Cloudcast {
            id
            isUnlisted
            isPublic
            slug
            description
            audioType
            picture {
              urlRoot
            }
            owner {
              displayName
              isViewer
              username
              id
            }
          }

          fragment AudioCardStats_cloudcast on Cloudcast {
            isExclusive
            isDraft
            hiddenStats
            plays
            publishDate
            qualityScore
            listenerMinutes
            owner {
              isSubscribedTo
              id
            }
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
            ...AudioCardTags_cloudcast
          }

          fragment AudioCardSubLinks_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
            }
            creatorAttributions(first: 2) {
              totalCount
              edges {
                node {
                  id
                  displayName
                  username
                  ...Hovercard_user
                }
              }
            }
          }

          fragment AudioCardTags_cloudcast on Cloudcast {
            tags(country: "GLOBAL") {
              tag {
                name
                slug
                id
              }
            }
          }

          fragment AudioCardTitle_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            audioQuality
            isLiveRecording
            isExclusive
            owner {
              id
              username
              ...UserBadge_user
            }
            creatorAttributions(first: 2) {
              totalCount
            }
            ...AudioCardSubLinks_cloudcast
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
          }

          fragment AudioCard_cloudcast on Cloudcast {
            id
            slug
            name
            audioType
            isAwaitingAudio
            isDraft
            isScheduled
            restrictedReason
            publishDate
            isLiveRecording
            isDisabledCopyright
            owner {
              isViewer
              username
              id
            }
            picture {
              ...UGCImage_picture
            }
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...QuantcastCloudcastTracking_cloudcast
          }

          fragment AudioCard_viewer on Viewer {
            ...AudioCardActions_viewer
            me {
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
              id
            }
          }

          fragment ExclusiveCloudcastBadgeContainer_cloudcast on Cloudcast {
            isExclusive
            isExclusivePreviewOnly
            slug
            id
            owner {
              username
              id
            }
          }

          fragment Hovercard_user on User {
            id
          }

          fragment QuantcastCloudcastTracking_cloudcast on Cloudcast {
            owner {
              quantcastTrackingPixel
              id
            }
          }

          fragment ShareAudioCardList_user on User {
            biog
            username
            displayName
            id
            isUploader
            picture {
              urlRoot
            }
          }

          fragment UGCImage_picture on Picture {
            urlRoot
            primaryColor
          }

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserListensPage_user on User {
            id
            isViewer
            displayName
            username
            ...ShareAudioCardList_user
            listeningHistory(first: 10) {
              totalCount
              edges {
                node {
                  id
                  cloudcast {
                    ...AudioCard_cloudcast
                    id
                  }
                  __typename
                }
                cursor
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }

          fragment UserListensPage_viewer on Viewer {
            id
            me {
              id
            }
            ...AudioCard_viewer
          }`,
    },
};

module.exports = {
    queries,
};
