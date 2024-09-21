export interface ContentsResponse {
    code: number;
    msg: string;
    data: {
        contents: {
            id: number;
            subject: string;
            author: string;
            publish_time: string;
        }[];
        current_term: {
            id: number;
            title: string;
            type: string;
        };
    };
}
