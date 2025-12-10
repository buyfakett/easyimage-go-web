import { request } from '@/src/utils/request';
import {
  CaptchaResp,
  TestTokenResp,
  TestTokenParams,
} from './types';

/** 测试token是否有效 */
export async function TestToken(params: TestTokenParams) {
  return request.Post<TestTokenResp>(`/api/user/test_token`, params);
}

/** 生成验证码 */
export async function GenerateCaptcha() {
  return request.Get<CaptchaResp>('/api/user/captcha');
}