const queries = {
    stream: {
        query: `query UserStreamQuery($lookup: UserLookup!) {
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
            isLiveRecording
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
              ...UserBadge_user
            }
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
            ...CloudcastHQAudio_cloudcast
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

          fragment CloudcastHQAudio_cloudcast on Cloudcast {
            audioQuality
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
            stream(first: 10) {
              edges {
                cursor
                repostedBy
                node {
                  id
                  ...AudioCard_cloudcast
                  __typename
                }
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
            $audioTypes: [AudioTypeEnum!]
          ) {
            user: userLookup(lookup: $lookup) {
              username
              ...UserUploadsPage_user_3HcCKF
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
            isLiveRecording
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
              ...UserBadge_user
            }
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
            ...CloudcastHQAudio_cloudcast
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

          fragment CloudcastHQAudio_cloudcast on Cloudcast {
            audioQuality
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

          fragment UGCImage_picture on Picture {
            urlRoot
            primaryColor
          }

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserUploadsPage_user_3HcCKF on User {
            id
            displayName
            username
            uploads(
              first: 10
              orderBy: $orderBy
              audioTypes: $audioTypes
              isPublic: true
            ) {
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
        query: `query UserFavoritesQuery($lookup: UserLookup!) {
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
            isLiveRecording
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
              ...UserBadge_user
            }
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
            ...CloudcastHQAudio_cloudcast
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

          fragment CloudcastHQAudio_cloudcast on Cloudcast {
            audioQuality
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
        query: `query UserListensQuery($lookup: UserLookup!) {
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
            isLiveRecording
            isExclusive
            owner {
              id
              displayName
              username
              ...Hovercard_user
              ...UserBadge_user
            }
            ...AudioCardPlayButton_cloudcast
            ...ExclusiveCloudcastBadgeContainer_cloudcast
            ...CloudcastHQAudio_cloudcast
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

          fragment CloudcastHQAudio_cloudcast on Cloudcast {
            audioQuality
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
            listeningHistory(first: 10) {
              totalCount
              edges {
                cursor
                node {
                  id
                  cloudcast {
                    ...AudioCard_cloudcast
                    id
                  }
                  __typename
                }
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
    profile: {
        query: `query UserProfileHeaderQuery($lookup: UserLookup!) {
            user: userLookup(lookup: $lookup) {
              id
              displayName
              username
              isBranded
              isStaff
              isViewer
              followers {
                totalCount
              }
              hasCoverPicture
              hasPremiumFeatures
              hasProFeatures
              picture {
                primaryColor
                ...UGCImage_picture
              }
              coverPicture {
                urlRoot
              }
              ...ProfileNavigation_user
              ...UserBadge_user
              ...ShareUserButton_user
              ...ProfileRegisterUpsellComponent_user
              ...FollowButton_user
            }
            viewer {
              ...ProfileRegisterUpsellComponent_viewer
              ...FollowButton_viewer
              id
            }
          }

          fragment FollowButton_user on User {
            id
            isFollowed
            isFollowing
            isViewer
            followers {
              totalCount
            }
            username
            displayName
          }

          fragment FollowButton_viewer on Viewer {
            me {
              id
            }
          }

          fragment ProfileNavigation_user on User {
            id
            username
            stream {
              totalCount
            }
            favorites {
              totalCount
            }
            listeningHistory {
              totalCount
            }
            uploads(audioTypes: [SHOW]) {
              totalCount
            }
            tracks: uploads(audioTypes: [TRACK]) {
              totalCount
            }
            posts {
              totalCount
            }
            profileNavigation(
              showsAudioTypes: [SHOW]
              tracksAudioTypes: [TRACK]
              streamAudioTypes: [SHOW, TRACK]
            ) {
              menuItems {
                __typename
                ... on NavigationItemInterface {
                  __isNavigationItemInterface: __typename
                  inDropdown
                }
                ... on HideableNavigationItemInterface {
                  __isHideableNavigationItemInterface: __typename
                  hidden
                }
                ... on PlaylistNavigationItem {
                  count
                  playlist {
                    id
                    name
                    slug
                  }
                }
              }
            }
          }

          fragment ProfileRegisterUpsellComponent_user on User {
            id
            displayName
            followers {
              totalCount
            }
          }

          fragment ProfileRegisterUpsellComponent_viewer on Viewer {
            me {
              id
            }
          }

          fragment ShareUserButton_user on User {
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
          }`,
    },
};

module.exports = {
    queries,
};
