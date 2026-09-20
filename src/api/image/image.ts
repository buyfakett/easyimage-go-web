import { request } from '@/src/utils/request';
import { 
  UploadImageParams,
  UploadImageResp,
  DeleteImageParams,
  DeleteImageResp,
  ListImagesParams,
  ListImagesResp,
} from './types';

/** 上传图片 */
export async function Upload(params: UploadImageParams) {
  return request.Put<UploadImageResp>('/api/image/upload', params.file);
}

/** 删除图片 */
export async function Delete(params: DeleteImageParams) {
  return request.Delete<DeleteImageResp>(`/api/image/delete?path=${params.path}`);
}

/** 获取图片列表 */
export async function List(params: ListImagesParams) {
  return request.Get<ListImagesResp>('/api/image/list', {
    params: params
  });
}
