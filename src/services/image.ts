import { UploadImageParams, DeleteImageParams, ListImagesParams } from '@/src/api/image/types';
import { ImageAPI } from '@/src/api/image';
import { Toast } from '@douyinfe/semi-ui-19';

/** 图片服务 */
export const ImageService = {
    /** 获取图片列表 */
    list: async (params: ListImagesParams) => {
        try {
            const resp = await ImageAPI.List(params);
            if (resp.code === 200) {
                return {
                    data: resp.data,
                    total: resp.total,
                };
            }
            Toast.error(resp.msg || '获取列表失败');
            return {data: [], total: 0};
        } catch (err) {
            Toast.error('网络请求异常');
            return {data: [], total: 0};
        }
    },

    /** 上传图片 */
    upload: async (params: UploadImageParams) => {
        try {
            const resp = await ImageAPI.Upload(params);
            if (resp.code === 200) {
                Toast.success('上传成功');
                return {
                    success: true,
                    url: resp.url
                };
            }
            Toast.error(resp.msg || '上传失败');
            return {
                success: false,
                url: ''
            };
        } catch (err) {
            Toast.error('网络请求异常');
            return {
                success: false,
                url: ''
            };
        }
    },

    /** 删除图片 */
    delete: async (params: DeleteImageParams) => {
        try {
            const resp = await ImageAPI.Delete(params);
            if (resp.code === 200) {
                Toast.success('删除成功');
                return true;
            }
            Toast.error(resp.msg || '删除失败');
            return false;
        } catch (err) {
            Toast.error('网络请求异常');
            return false;
        }
    }
};
