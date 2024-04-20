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
            isExclusive
            audioType
            owner {
              username
              isSubscribedTo
              isViewer
              id
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
            ...AudioCardMoreOptions_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
            ...AudioCardMoreOptions_viewer
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

          fragment AudioCardMoreOptions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            viewerAttribution {
              status
              id
            }
            viewerAttributionRequest {
              id
            }
            creatorAttributions(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
            owner {
              id
              username
              isViewer
              hasProFeatures
              viewerIsAffiliate
              displayName
              affiliateUsers {
                totalCount
              }
            }
          }

          fragment AudioCardMoreOptions_viewer on Viewer {
            me {
              id
              hasProFeatures
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              isSubscribedTo
              isViewer
              id
            }
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
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusive
            isDisabledCopyright
            ...AudioCardStaticPlayButton_cloudcast
            ...useAudioPreview_cloudcast
            ...useExclusivePreviewModal_cloudcast
            ...useExclusiveCloudcastModal_cloudcast
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

          fragment AudioCardStaticPlayButton_cloudcast on Cloudcast {
            owner {
              username
              id
            }
            slug
            id
            restrictedReason
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
              ...AudioCardTagsPreviewer_tag
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

          fragment AudioCardTagsPreviewer_tag on CloudcastTag {
            tag {
              name
              slug
              id
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
            ...ImageCloudcast_cloudcast
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...CopyrightSupport_cloudcast
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

          fragment CopyrightSupport_cloudcast on Cloudcast {
            name
            slug
            owner {
              username
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

          fragment ImageCloudcast_cloudcast on Cloudcast {
            name
            picture {
              urlRoot
              primaryColor
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
          }

          fragment useAudioPreview_cloudcast on Cloudcast {
            id
            previewUrl
          }

          fragment useExclusiveCloudcastModal_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              username
              id
            }
          }

          fragment useExclusivePreviewModal_cloudcast on Cloudcast {
            id
            isExclusivePreviewOnly
            owner {
              username
              id
            }
          }`,
    },
    uploads: {
        query: `query UserUploadsQuery(
            $lookup: UserLookup!
            $orderBy: CloudcastOrderByEnum
            $onlyAttributedTo: ID!
            $hasAttributedTo: Boolean!
          ) {
            user: userLookup(lookup: $lookup) {
              username
              ...UserUploadsPage_user_38hcZE
              id
            }
            affiliateUser: user(id: $onlyAttributedTo) @include(if: $hasAttributedTo) {
              ...UserUploadsPageAffiliate_user
              id
            }
            viewer {
              ...UserUploadsPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            isExclusive
            audioType
            owner {
              username
              isSubscribedTo
              isViewer
              id
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
            ...AudioCardMoreOptions_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
            ...AudioCardMoreOptions_viewer
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

          fragment AudioCardMoreOptions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            viewerAttribution {
              status
              id
            }
            viewerAttributionRequest {
              id
            }
            creatorAttributions(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
            owner {
              id
              username
              isViewer
              hasProFeatures
              viewerIsAffiliate
              displayName
              affiliateUsers {
                totalCount
              }
            }
          }

          fragment AudioCardMoreOptions_viewer on Viewer {
            me {
              id
              hasProFeatures
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              isSubscribedTo
              isViewer
              id
            }
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
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusive
            isDisabledCopyright
            ...AudioCardStaticPlayButton_cloudcast
            ...useAudioPreview_cloudcast
            ...useExclusivePreviewModal_cloudcast
            ...useExclusiveCloudcastModal_cloudcast
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

          fragment AudioCardStaticPlayButton_cloudcast on Cloudcast {
            owner {
              username
              id
            }
            slug
            id
            restrictedReason
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
              ...AudioCardTagsPreviewer_tag
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

          fragment AudioCardTagsPreviewer_tag on CloudcastTag {
            tag {
              name
              slug
              id
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
            ...ImageCloudcast_cloudcast
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...CopyrightSupport_cloudcast
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

          fragment CopyrightSupport_cloudcast on Cloudcast {
            name
            slug
            owner {
              username
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

          fragment ImageCloudcast_cloudcast on Cloudcast {
            name
            picture {
              urlRoot
              primaryColor
            }
          }

          fragment ProfileSearchAudioCardList_user on User {
            username
            displayName
            id
            picture {
              urlRoot
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

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserUploadsPageAffiliate_user on User {
            displayName
            username
            id
            picture {
              urlRoot
            }
          }

          fragment UserUploadsPage_user_38hcZE on User {
            id
            displayName
            username
            isViewer
            hasProFeatures
            viewerIsAffiliate
            ...ShareAudioCardList_user
            ...ProfileSearchAudioCardList_user
            uploads(
              first: 10
              isPublic: true
              orderBy: $orderBy
              audioTypes: [SHOW]
              onlyAttributedTo: $onlyAttributedTo
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
              totalCount
            }
          }

          fragment UserUploadsPage_viewer on Viewer {
            ...AudioCard_viewer
          }

          fragment useAudioPreview_cloudcast on Cloudcast {
            id
            previewUrl
          }

          fragment useExclusiveCloudcastModal_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              username
              id
            }
          }

          fragment useExclusivePreviewModal_cloudcast on Cloudcast {
            id
            isExclusivePreviewOnly
            owner {
              username
              id
            }
          }`,
    },
    reposts: {
        query: `query UserRepostsQuery($lookup: UserLookup!) {
            user: userLookup(lookup: $lookup) {
              username
              ...UserRepostsPage_user
              id
            }
            viewer {
              ...UserRepostsPage_viewer
              id
            }
          }

          fragment AudioCardActions_cloudcast on Cloudcast {
            isExclusive
            audioType
            owner {
              username
              isSubscribedTo
              isViewer
              id
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
            ...AudioCardMoreOptions_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
            ...AudioCardMoreOptions_viewer
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

          fragment AudioCardMoreOptions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            viewerAttribution {
              status
              id
            }
            viewerAttributionRequest {
              id
            }
            creatorAttributions(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
            owner {
              id
              username
              isViewer
              hasProFeatures
              viewerIsAffiliate
              displayName
              affiliateUsers {
                totalCount
              }
            }
          }

          fragment AudioCardMoreOptions_viewer on Viewer {
            me {
              id
              hasProFeatures
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              isSubscribedTo
              isViewer
              id
            }
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
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusive
            isDisabledCopyright
            ...AudioCardStaticPlayButton_cloudcast
            ...useAudioPreview_cloudcast
            ...useExclusivePreviewModal_cloudcast
            ...useExclusiveCloudcastModal_cloudcast
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

          fragment AudioCardStaticPlayButton_cloudcast on Cloudcast {
            owner {
              username
              id
            }
            slug
            id
            restrictedReason
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
              ...AudioCardTagsPreviewer_tag
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

          fragment AudioCardTagsPreviewer_tag on CloudcastTag {
            tag {
              name
              slug
              id
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
            ...ImageCloudcast_cloudcast
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...CopyrightSupport_cloudcast
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

          fragment CopyrightSupport_cloudcast on Cloudcast {
            name
            slug
            owner {
              username
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

          fragment ImageCloudcast_cloudcast on Cloudcast {
            name
            picture {
              urlRoot
              primaryColor
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

          fragment UserBadge_user on User {
            hasProFeatures
            isStaff
            hasPremiumFeatures
          }

          fragment UserRepostsPage_user on User {
            id
            displayName
            username
            isViewer
            ...ShareAudioCardList_user
            reposted(first: 10, audioTypes: [SHOW, TRACK]) {
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
              totalCount
            }
          }

          fragment UserRepostsPage_viewer on Viewer {
            ...AudioCard_viewer
          }

          fragment useAudioPreview_cloudcast on Cloudcast {
            id
            previewUrl
          }

          fragment useExclusiveCloudcastModal_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              username
              id
            }
          }

          fragment useExclusivePreviewModal_cloudcast on Cloudcast {
            id
            isExclusivePreviewOnly
            owner {
              username
              id
            }
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
            isExclusive
            audioType
            owner {
              username
              isSubscribedTo
              isViewer
              id
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
            ...AudioCardMoreOptions_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
            ...AudioCardMoreOptions_viewer
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

          fragment AudioCardMoreOptions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            viewerAttribution {
              status
              id
            }
            viewerAttributionRequest {
              id
            }
            creatorAttributions(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
            owner {
              id
              username
              isViewer
              hasProFeatures
              viewerIsAffiliate
              displayName
              affiliateUsers {
                totalCount
              }
            }
          }

          fragment AudioCardMoreOptions_viewer on Viewer {
            me {
              id
              hasProFeatures
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              isSubscribedTo
              isViewer
              id
            }
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
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusive
            isDisabledCopyright
            ...AudioCardStaticPlayButton_cloudcast
            ...useAudioPreview_cloudcast
            ...useExclusivePreviewModal_cloudcast
            ...useExclusiveCloudcastModal_cloudcast
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

          fragment AudioCardStaticPlayButton_cloudcast on Cloudcast {
            owner {
              username
              id
            }
            slug
            id
            restrictedReason
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
              ...AudioCardTagsPreviewer_tag
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

          fragment AudioCardTagsPreviewer_tag on CloudcastTag {
            tag {
              name
              slug
              id
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
            ...ImageCloudcast_cloudcast
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...CopyrightSupport_cloudcast
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

          fragment CopyrightSupport_cloudcast on Cloudcast {
            name
            slug
            owner {
              username
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

          fragment ImageCloudcast_cloudcast on Cloudcast {
            name
            picture {
              urlRoot
              primaryColor
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
          }

          fragment useAudioPreview_cloudcast on Cloudcast {
            id
            previewUrl
          }

          fragment useExclusiveCloudcastModal_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              username
              id
            }
          }

          fragment useExclusivePreviewModal_cloudcast on Cloudcast {
            id
            isExclusivePreviewOnly
            owner {
              username
              id
            }
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
            isExclusive
            audioType
            owner {
              username
              isSubscribedTo
              isViewer
              id
            }
            ...AudioCardFavoriteButton_cloudcast
            ...AudioCardRepostButton_cloudcast
            ...AudioCardShareButton_cloudcast
            ...AudioCardAddToButton_cloudcast
            ...AudioCardHighlightButton_cloudcast
            ...AudioCardBoostButton_cloudcast
            ...AudioCardStats_cloudcast
            ...AudioCardMoreOptions_cloudcast
          }

          fragment AudioCardActions_viewer on Viewer {
            ...AudioCardFavoriteButton_viewer
            ...AudioCardRepostButton_viewer
            ...AudioCardHighlightButton_viewer
            ...AudioCardMoreOptions_viewer
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

          fragment AudioCardMoreOptions_cloudcast on Cloudcast {
            id
            isPublic
            slug
            isUnlisted
            isScheduled
            isDraft
            audioType
            isDisabledCopyright
            viewerAttribution {
              status
              id
            }
            viewerAttributionRequest {
              id
            }
            creatorAttributions(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
            owner {
              id
              username
              isViewer
              hasProFeatures
              viewerIsAffiliate
              displayName
              affiliateUsers {
                totalCount
              }
            }
          }

          fragment AudioCardMoreOptions_viewer on Viewer {
            me {
              id
              hasProFeatures
              uploadLimits {
                tracksPublishRemaining
                showsPublishRemaining
              }
            }
          }

          fragment AudioCardPlayButton_cloudcast on Cloudcast {
            id
            restrictedReason
            owner {
              isSubscribedTo
              isViewer
              id
            }
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
            repeatPlayAmount
            hasPlayCompleted
            seekRestriction
            previewUrl
            isExclusive
            isDisabledCopyright
            ...AudioCardStaticPlayButton_cloudcast
            ...useAudioPreview_cloudcast
            ...useExclusivePreviewModal_cloudcast
            ...useExclusiveCloudcastModal_cloudcast
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

          fragment AudioCardStaticPlayButton_cloudcast on Cloudcast {
            owner {
              username
              id
            }
            slug
            id
            restrictedReason
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
              ...AudioCardTagsPreviewer_tag
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

          fragment AudioCardTagsPreviewer_tag on CloudcastTag {
            tag {
              name
              slug
              id
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
            ...ImageCloudcast_cloudcast
            ...AudioCardTitle_cloudcast
            ...AudioCardProgress_cloudcast
            ...AudioCardActions_cloudcast
            ...CopyrightSupport_cloudcast
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

          fragment CopyrightSupport_cloudcast on Cloudcast {
            name
            slug
            owner {
              username
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

          fragment ImageCloudcast_cloudcast on Cloudcast {
            name
            picture {
              urlRoot
              primaryColor
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
          }

          fragment useAudioPreview_cloudcast on Cloudcast {
            id
            previewUrl
          }

          fragment useExclusiveCloudcastModal_cloudcast on Cloudcast {
            id
            isExclusive
            owner {
              username
              id
            }
          }

          fragment useExclusivePreviewModal_cloudcast on Cloudcast {
            id
            isExclusivePreviewOnly
            owner {
              username
              id
            }
          }`,
    },
};

export { queries };
