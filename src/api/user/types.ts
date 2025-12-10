import { CommonResp } from "@/src/api/common.type";

export interface TestTokenParams {
    token: string;
    captcha_id: string;
    captcha: string;
}
export interface TestTokenResp extends CommonResp {}

export interface CaptchaResp extends CommonResp {
    data?: {
        id: string;
        base64_image: string;
    };
}