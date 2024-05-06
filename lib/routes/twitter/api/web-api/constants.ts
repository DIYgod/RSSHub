const baseUrl = 'https://twitter.com/i/api';

const graphQLEndpointsPlain = [
    '/graphql/eS7LO5Jy3xgmd3dbL044EA/UserTweets',
    '/graphql/k5XapwcSikNsEsILW5FvgA/UserByScreenName',
    '/graphql/k3YiLNE_MAy5J-NANLERdg/HomeTimeline',
    '/graphql/3GeIaLmNhTm1YsUmxR57tg/UserTweetsAndReplies',
    '/graphql/TOU4gQw8wXIqpSzA4TYKgg/UserMedia',
    '/graphql/B8I_QCljDBVfin21TTWMqA/Likes',
    '/graphql/tD8zKvQzwY3kdx5yz6YmOw/UserByRestId',
    '/graphql/flaR-PUMshxFWZWPNpq4zA/SearchTimeline',
    '/graphql/TOTgqavWmxywKv5IbMMK1w/ListLatestTweetsTimeline',
    '/graphql/zJvfJs3gSbrVhC0MKjt_OQ/TweetDetail',
];

const gqlMap = Object.fromEntries(graphQLEndpointsPlain.map((endpoint) => [endpoint.split('/')[3].replace(/V2$|Query$|QueryV2$/, ''), endpoint]));

const gqlFeatureUser = {
    hidden_profile_likes_enabled: true,
    hidden_profile_subscriptions_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    subscriptions_verification_info_is_identity_verified_enabled: true,
    subscriptions_verification_info_verified_since_enabled: true,
    highlights_tweets_tab_ui_enabled: true,
    responsive_web_twitter_article_notes_tab_enabled: true,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
};
const gqlFeatureFeed = {
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    tweetypie_unmention_optimization_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_enhance_cards_enabled: false,
};

const TweetDetailFeatures = {
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_preview_enabled: false,
    tweetypie_unmention_optimization_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    tweet_with_visibility_results_prefer_gql_media_interstitial_enabled: true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_enhance_cards_enabled: false,
};
const gqlFeatures = {
    UserByScreenName: gqlFeatureUser,
    UserByRestId: gqlFeatureUser,
    UserTweets: gqlFeatureFeed,
    UserTweetsAndReplies: gqlFeatureFeed,
    UserMedia: gqlFeatureFeed,
    SearchTimeline: gqlFeatureFeed,
    ListLatestTweetsTimeline: gqlFeatureFeed,
    HomeTimeline: gqlFeatureFeed,
    TweetDetail: TweetDetailFeatures,
    Likes: gqlFeatureFeed,
};

const timelineParams = {
    include_can_media_tag: 1,
    include_cards: 1,
    include_entities: 1,
    include_profile_interstitial_type: 0,
    include_quote_count: 0,
    include_reply_count: 0,
    include_user_entities: 0,
    include_ext_reply_count: 0,
    include_ext_media_color: 0,
    cards_platform: 'Web-13',
    tweet_mode: 'extended',
    send_error_codes: 1,
    simple_quoted_tweet: 1,
};

const bearerToken = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

export { baseUrl, gqlMap, gqlFeatures, timelineParams, bearerToken };
