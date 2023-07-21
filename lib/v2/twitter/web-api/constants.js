// https://github.com/zedeus/nitter/issues/919#issuecomment-1619067142
// https://git.sr.ht/~cloutier/bird.makeup/tree/087a8e3e98b642841dde84465c19121fc3b4c6ee/item/src/BirdsiteLive.Twitter/Tools/TwitterAuthenticationInitializer.cs#L36
const tokens = [
    'CjulERsDeqhhjSme66ECg:IQWdVyqFxghAtURHGeGiWAsmCAGmdW3WmbEx6Hck', // iPad
    // valid, but endpoints differ
    // 'IQKbtAYlXLripLGPWd0HUA:GgDYlkSvaPxGxC4X8liwpUoqKwwr3lCADbz8A7ADU', // iPhone
    // '3nVuSoBZnx6U4vzUxf5w:Bcs59EFbbsdF6Sl9Ng71smgStWEGwXXKSjYvPVt7qys', // Android
    // '3rJOl1ODzm9yZy63FACdg:5jPoQ5kQvMJFDYRNE8bQ4rHuds4xJqhvgNJM4awaE8', // Mac
];

const graphQLEndpointsPlain = [
    '/graphql/oUZZZ8Oddwxs8Cd3iW3UEA/UserByScreenName',
    '/graphql/Lxg1V9AiIzzXEiP2c8dRnw/UserByRestId',
    '/graphql/3XDB26fBve-MmjHaWTUZxA/TweetDetail',
    '/graphql/QqZBEqganhHwmU9QscmIug/UserTweets',
    '/graphql/wxoVeDnl0mP7VLhe6mTOdg/UserTweetsAndReplies',
    '/graphql/Az0-KW6F-FyYTc2OJmvUhg/UserMedia',
    '/graphql/kgZtsNyE46T3JaEf2nF9vw/Likes',
    // these endpoints are not available if authenticated as other clients
    // FYI, endpoints for Android: https://gist.github.com/ScamCast/2e40befbd1b61c4a80cda2745d4df1f4
];

const graphQLMap = Object.fromEntries(graphQLEndpointsPlain.map((endpoint) => [endpoint.split('/')[3], endpoint]));

// captured from Twitter web
const featuresMap = {
    UserByScreenName: JSON.stringify({
        hidden_profile_likes_enabled: false,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        subscriptions_verification_info_verified_since_enabled: true,
        highlights_tweets_tab_ui_enabled: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
    }),
    UserByRestId: JSON.stringify({
        hidden_profile_likes_enabled: false,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        highlights_tweets_tab_ui_enabled: true,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
    }),
    UserTweets: JSON.stringify({
        rweb_lists_timeline_redesign_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: false,
        tweet_awards_web_tipping_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_media_download_video_enabled: false,
        responsive_web_enhance_cards_enabled: false,
    }),
};

module.exports = {
    tokens,
    graphQLMap,
    featuresMap,
};
