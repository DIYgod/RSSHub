const baseUrl = 'https://x.com/i/api';

const graphQLEndpointsPlain = [
    '/graphql/E3opETHurmVJflFsUBVuUQ/UserTweets',
    '/graphql/Yka-W8dz7RaEuQNkroPkYw/UserByScreenName',
    '/graphql/HJFjzBgCs16TqxewQOeLNg/HomeTimeline',
    '/graphql/DiTkXJgLqBBxCs7zaYsbtA/HomeLatestTimeline',
    '/graphql/bt4TKuFz4T7Ckk-VvQVSow/UserTweetsAndReplies',
    '/graphql/dexO_2tohK86JDudXXG3Yw/UserMedia',
    '/graphql/Qw77dDjp9xCpUY-AXwt-yQ/UserByRestId',
    '/graphql/UN1i3zUiCWa-6r-Uaho4fw/SearchTimeline',
    '/graphql/Pa45JvqZuKcW1plybfgBlQ/ListLatestTweetsTimeline',
    '/graphql/QuBlQ6SxNAQCt6-kBiCXCQ/TweetDetail',
];

const gqlMap = Object.fromEntries(graphQLEndpointsPlain.map((endpoint) => [endpoint.split('/')[3].replace(/V2$|Query$|QueryV2$/, ''), endpoint]));

const thirdPartySupportedAPI = ['UserByScreenName', 'UserByRestId', 'UserTweets', 'UserTweetsAndReplies', 'ListLatestTweetsTimeline', 'SearchTimeline'];

const gqlFeatureUser = {
    hidden_profile_subscriptions_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    subscriptions_verification_info_is_identity_verified_enabled: true,
    subscriptions_verification_info_verified_since_enabled: true,
    highlights_tweets_tab_ui_enabled: true,
    responsive_web_twitter_article_notes_tab_enabled: true,
    subscriptions_feature_can_gift_premium: true,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
};
const gqlFeatureFeed = {
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_preview_enabled: true,
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
    articles_preview_enabled: true,
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
    HomeLatestTimeline: TweetDetailFeatures,
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

export { baseUrl, bearerToken, gqlFeatures, gqlMap, thirdPartySupportedAPI, timelineParams };
