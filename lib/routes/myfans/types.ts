export interface UserProfile {
    about: string;
    active: boolean;
    avatar_url: string;
    banner_url: string;
    id: string | null;
    is_following: boolean;
    likes_count: number;
    name: string;
    username: string;
    is_official_creator: boolean;
    is_official: boolean;
    label: null;
    back_number_post_images_count: number;
    back_number_post_videos_count: number;
    cant_receive_message: boolean;
    current_back_number_plan: null;
    followers_count: number;
    followings_count: number;
    has_approved_user_identification: boolean;
    is_bought_back_number: boolean;
    is_followed: boolean;
    is_subscribed: boolean;
    limited_posts_count: number;
    link_instagram_id: string;
    link_instagram_url: null;
    link_tiktok_id: string;
    link_tiktok_url: null;
    link_twitter_id: string;
    link_twitter_url: string;
    link_youtube_url: string;
    post_images_count: number;
    post_videos_count: number;
    posts_count: number;
    sns_link1: string;
    sns_link2: string;
}

export interface Post {
    id: string;
    kind: string;
    status: string;
    status_label: null;
    body: string | null;
    bookmarked: boolean;
    humanized_publish_start_at: string;
    deleted_at_i18n: null;
    liked: boolean;
    likes_count: number;
    user: UserProfile;
    post_images: Array<{
        file_url: string;
        square_thumbnail_url: string;
        raw_image_height: number;
        raw_image_width: number;
    }>;
    visible: boolean;
    publish_end_at: null;
    published_at: string;
    publish_start_at: string | null;
    pinned_at: string | null;
    attachment: null;
    plan: null;
    current_single_plan: {
        id: string;
        amount: number;
        auto_message_body: string;
    } | null;
    plans: Array<{
        id: string;
        product_name: string;
        monthly_price: number;
        status: null;
        is_limited_access: boolean;
        disallow_new_subscriber: boolean;
        active_discount: {
            id: string;
            discount_rate: number;
            start_at: string | null;
            end_at: string | null;
            limited_number: null;
            status: string;
        } | null;
    }>;
    video_processing: boolean | null;
    video_duration: {
        hours: string | null;
        minutes: string;
        seconds: string;
    } | null;
    free: boolean;
    limited: boolean;
    available: boolean;
    metadata: {
        video: {
            duration: number;
            resolutions: string[];
        };
        image: {
            count: number;
        };
    };
    thumbnail_url: string;
}
