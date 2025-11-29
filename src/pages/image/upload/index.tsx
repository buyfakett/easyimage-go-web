import React, { useState, useEffect } from 'react';
import { Card, Typography, Icon, Button, Modal } from '@douyinfe/semi-ui-19';
import { Cropper } from '@douyinfe/semi-ui-19';
import { IconUpload } from '@douyinfe/semi-icons';

const Title = Typography.Title;
import { ImageService } from '@/src/services/image';
import { IMAGE_UPLOAD_CONFIG } from '@/src/config';

interface UploadFile {
    uid: string;
    name: string;
    status: 'ready' | 'uploading' | 'done' | 'error';
    file: File;
    percent?: number;
    url?: string;
}

export default function UploadImagePage() {
    // 待上传文件列表
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    // 是否正在上传
    const [uploading, setUploading] = useState(false);
    // 图片编辑相关状态
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentEditingFile, setCurrentEditingFile] = useState<UploadFile | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
    const [editedImageData, setEditedImageData] = useState<string>('');

    // 生成唯一ID
    const getUid = () => {
        return `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    // 处理文件选择
    const handleFileSelect = (files: File[]) => {
        const newFiles: UploadFile[] = files.map(file => ({
            uid: getUid(),
            name: file.name,
            status: 'ready',
            file
        }));

        // 过滤掉已经存在的文件
        const existingFileNames = new Set(fileList.map(f => f.name));
        const filteredNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));

        setFileList(prev => [...prev, ...filteredNewFiles]);
    };

    // 处理拖拽事件
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const validFiles = Array.from(e.dataTransfer.files)
                .filter(file => {
                    const fileName = file.name.toLowerCase();
                    const hasValidExtension = IMAGE_UPLOAD_CONFIG.supportedExtensions.some(ext => fileName.endsWith(ext));
                    const isImage = IMAGE_UPLOAD_CONFIG.supportedMimeTypes.includes(file.type) || hasValidExtension;
                    const isLtMaxSize = file.size / 1024 / 1024 < IMAGE_UPLOAD_CONFIG.maxSizeMB;

                    if (!isImage) {
                        console.log(`${file.name}: 请上传支持的图片格式!`);
                    } else if (!isLtMaxSize) {
                        console.log(`${file.name}: 图片大小不能超过 ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB!`);
                    }

                    return isImage && isLtMaxSize;
                });

            if (validFiles.length > 0) {
                handleFileSelect(validFiles);
            }
        }
    };

    // 阻止默认拖拽行为
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 点击选择文件
    const handleClickSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = IMAGE_UPLOAD_CONFIG.supportedExtensions.join(',');
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            const validFiles = files.filter(file => {
                const fileName = file.name.toLowerCase();
                const hasValidExtension = IMAGE_UPLOAD_CONFIG.supportedExtensions.some(ext => fileName.endsWith(ext));
                const isImage = IMAGE_UPLOAD_CONFIG.supportedMimeTypes.includes(file.type) || hasValidExtension;
                const isLtMaxSize = file.size / 1024 / 1024 < IMAGE_UPLOAD_CONFIG.maxSizeMB;

                if (!isImage) {
                    alert(`${file.name}: 请上传支持的图片格式!`);
                } else if (!isLtMaxSize) {
                    alert(`${file.name}: 图片大小不能超过 ${IMAGE_UPLOAD_CONFIG.maxSizeMB}MB!`);
                }

                return isImage && isLtMaxSize;
            });

            if (validFiles.length > 0) {
                handleFileSelect(validFiles);
            }
        };
        input.click();
    };

    // 移除文件
    const removeFile = (uid: string) => {
        setFileList(prev => prev.filter(file => file.uid !== uid));
    };

    // 打开图片编辑弹窗
    const openEditModal = (file: UploadFile) => {
        // 先释放之前可能存在的URL
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }

        // 创建新的URL
        const imageUrl = URL.createObjectURL(file.file);
        setCurrentImageUrl(imageUrl);
        setCurrentEditingFile(file);
        setEditedImageData('');
        setIsEditModalVisible(true);
    };

    // 处理图片编辑完成
    const handleEditComplete = async () => {
        if (!currentEditingFile || !editedImageData) return;

        try {
            // 将Base64数据转换为Blob
            const base64Data = editedImageData.split(',')[1];
            const byteString = atob(base64Data);
            const mimeString = editedImageData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], {type: mimeString});
            const newFile = new File([blob], currentEditingFile.name, {type: mimeString});

            // 更新文件列表中的文件
            setFileList(prev => prev.map(file =>
                file.uid === currentEditingFile.uid
                    ? {...file, file: newFile}
                    : file
            ));

            setIsEditModalVisible(false);
        } catch (error) {
            console.error('图片编辑处理失败:', error);
        }
    };

    // 关闭编辑弹窗
    const closeEditModal = () => {
        // 释放URL对象
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
            setCurrentImageUrl('');
        }
        setIsEditModalVisible(false);
        setCurrentEditingFile(null);
        setEditedImageData('');
    };

    // 组件卸载时释放URL对象
    useEffect(() => {
        return () => {
            if (currentImageUrl) {
                try {
                    URL.revokeObjectURL(currentImageUrl);
                } catch (error) {
                    // 对象可能已经被释放
                }
            }
        };
    }, [currentImageUrl]);

    // 上传单个文件（二进制上传）
    const uploadSingleFile = async (fileItem: UploadFile) => {
        return new Promise<boolean>(async (resolve) => {
            try {
                // 更新文件状态为上传中
                setFileList(prev => prev.map(file =>
                    file.uid === fileItem.uid ? {...file, status: 'uploading', percent: 0} : file
                ));

                // 创建FormData对象进行二进制上传
                const formData = new FormData();
                formData.append('file', fileItem.file);

                console.log('准备上传图片:', fileItem.name);
                console.log('FormData内容:', formData.get('file'));
                console.log('文件大小:', fileItem.file.size, '类型:', fileItem.file.type);

                // 模拟进度更新
                setFileList(prev => prev.map(file =>
                    file.uid === fileItem.uid ? {...file, percent: 50} : file
                ));

                // 使用ImageService.upload方法上传，确保与API保持一致
                try {
                    // 创建正确的参数格式
                    const uploadParams = {
                        file: formData
                    };

                    // 调用service层方法，统一处理
                    const result = await ImageService.upload(uploadParams);
                    if (result.success) {
                        console.log('上传成功');
                        setFileList(prev => prev.map(file =>
                            file.uid === fileItem.uid ? {...file, percent: 100, status: 'done', url: result.url} : file
                        ));
                        resolve(true);
                        return;
                    } else {
                        console.error('上传失败');
                    }
                } catch (error) {
                    console.error('上传请求异常:', error);
                }

                // 失败处理
                setFileList(prev => prev.map(file =>
                    file.uid === fileItem.uid ? {...file, status: 'error'} : file
                ));
                resolve(false);
                return;
            } catch (error) {
                // 更新状态为错误
                setFileList(prev => prev.map(file =>
                    file.uid === fileItem.uid ? {...file, status: 'error'} : file
                ));
                console.error('上传过程中发生错误:', error);
                resolve(false);
            }
        });
    };

    // 开始上传所有待上传文件
    const handleStartUpload = async () => {
        // 筛选出待上传的文件
        const readyFiles = fileList.filter(file => file.status === 'ready');

        if (readyFiles.length === 0) {
            console.log('没有待上传的文件');
            return;
        }

        setUploading(true);
        let allSuccess = true;

        // 逐个上传文件
        for (const file of readyFiles) {
            const success = await uploadSingleFile(file);
            if (!success) {
                allSuccess = false;
            }
        }

        setUploading(false);
    };

    // 重试上传单个文件
    const retryUpload = async (fileItem: UploadFile) => {
        // 直接调用上传方法重试
        await uploadSingleFile(fileItem);
    };

    return (
        <div style={{padding: 24}}>
            <Card title={<Title>图片上传</Title>} style={{maxWidth: 800, margin: '0 auto'}}>
                {/* 待上传区域 */}
                <div
                    style={{
                        border: '2px dashed #d9d9d9',
                        borderRadius: 6,
                        padding: 40,
                        cursor: 'pointer',
                        transition: 'border-color 0.3s',
                        marginBottom: 24
                    }}
                    onClick={handleClickSelect}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#40a9ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                    }}
                >
                    <p style={{textAlign: 'center', marginBottom: 12}}>
                        <IconUpload size="extra-large" style={{marginBottom: 12, fontSize: 48}} />
                    </p>
                    <p style={{textAlign: 'center', marginBottom: 8, fontSize: 16}}>
                        点击或拖拽图片到此区域
                    </p>
                    <p style={{textAlign: 'center', fontSize: 14, color: '#666'}}>
                        支持 {IMAGE_UPLOAD_CONFIG.supportedExtensions.map(ext => ext.toUpperCase().replace('.', '')).join('/')} 格式图片，大小不超过 {IMAGE_UPLOAD_CONFIG.maxSizeMB}MB
                    </p>
                </div>

                {/* 文件列表 */}
                {fileList.length > 0 && (
                    <div style={{marginBottom: 24}}>
                        <Title style={{marginBottom: 16}}>待上传文件</Title>
                        <div style={{maxHeight: 400, overflowY: 'auto'}}>
                            {fileList.map(file => (
                                <div
                                    key={file.uid}
                                    style={{
                                        padding: 12,
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 4,
                                        marginBottom: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{flex: 1, minWidth: 200}}>
                                        <div style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
                                            <Icon type="file-image" style={{marginRight: 8}} svg/>
                                            <span style={{fontWeight: 500}}>{file.name}</span>
                                            <span style={{marginLeft: 8, color: '#888', fontSize: 12}}>
                        {(file.file.size / 1024).toFixed(1)} KB
                      </span>
                                        </div>
                                        {file.status === 'uploading' && file.percent !== undefined && (
                                            <div style={{
                                                width: '100%',
                                                height: 6,
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 3,
                                                overflow: 'hidden'
                                            }}>
                                                <div
                                                    style={{
                                                        width: `${file.percent}%`,
                                                        height: '100%',
                                                        backgroundColor: '#40a9ff',
                                                        transition: 'width 0.3s'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {file.status === 'error' && (
                                            <div style={{color: '#ff4d4f', fontSize: 12, marginTop: 4}}>上传失败</div>
                                        )}
                                        {file.status === 'done' && (
                                            <div style={{color: '#52c41a', fontSize: 12, marginTop: 4}}>上传成功</div>
                                        )}
                                        {file.status === 'done' && file.url && (
                                            <div style={{marginTop: 8}}>
                                                <div style={{fontSize: 12, color: '#666', marginBottom: 4}}>图片URL：
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#1890ff',
                                                            wordBreak: 'break-all',
                                                            flex: 1
                                                        }}
                                                    >
                                                        {file.url}
                                                    </a>
                                                    <img
                                                        src={file.url}
                                                        alt={file.name}
                                                        style={{
                                                            width: 80,
                                                            height: 80,
                                                            objectFit: 'cover',
                                                            borderRadius: 4
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{display: 'flex', gap: 8}}>
                                        {file.status === 'ready' && (
                                            <Button
                                                size="small"
                                                onClick={() => openEditModal(file)}
                                            >
                                                编辑
                                            </Button>
                                        )}
                                        {file.status === 'error' && (
                                            <Button
                                                size="small"
                                                type="primary"
                                                onClick={() => retryUpload(file)}
                                            >
                                                重试
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => removeFile(file.uid)}
                                            disabled={file.status === 'uploading'}
                                        >
                                            移除
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 上传按钮 */}
                <Button
                    type="primary"
                    onClick={handleStartUpload}
                    disabled={uploading || fileList.filter(f => f.status === 'ready').length === 0}
                    loading={uploading}
                    style={{width: '100%', height: 40, fontSize: 16}}
                >
                    {uploading ? '上传中...' : '开始上传'}
                </Button>

                {/* 图片编辑弹窗 */}
                <Modal
                    title="编辑图片"
                    visible={isEditModalVisible}
                    onCancel={closeEditModal}
                    footer={[
                        <Button key="cancel" onClick={closeEditModal}>
                            取消
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleEditComplete}>
                            完成
                        </Button>
                    ]}
                    style={{width: '800px'}}
                >
                    {currentImageUrl && (
                        <Cropper
                            src={currentImageUrl}
                            aspectRatio={1}
                            minCropBoxHeight={100}
                            onCropComplete={(croppedCanvas: HTMLCanvasElement) => {
                                setEditedImageData(croppedCanvas.toDataURL('image/png'));
                            }}
                        />
                    )}
                </Modal>
            </Card>
        </div>
    );
};
