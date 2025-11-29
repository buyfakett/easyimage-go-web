import React, { useEffect, useState } from 'react';
import {
    Card,
    Spin,
    Button,
    Typography,
    Breadcrumb,
    Empty,
    ImagePreview,
    Modal
} from '@douyinfe/semi-ui-19';
import { IconDelete, IconFolder, IconImage } from '@douyinfe/semi-icons';
import { useSearchParams } from 'react-router-dom';
import { ImageService } from '@/src/services/image';
import { DeleteImageParams } from "@/src/api/image/types";

export default function ImageBrowser() {
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewSrc, setPreviewSrc] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();

    // 从URL参数初始化状态
    const initialDir = searchParams.get('dir') || '';
    const initialView = searchParams.get('view') || 'grid';

    const [dir, setDir] = useState(initialDir);
    const [view, setView] = useState(initialView);

    const fetchList = async (d = '') => {
        setLoading(true);
        setError(null);
        try {
            // 调用service层的list方法
            const result = await ImageService.list({dir: d});
            const items = result?.data || [];
            setList(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error('获取图片列表失败:', err);
            setError(err instanceof Error ? err.message : '未知错误');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(dir);
    }, [dir]);

    // 监听URL参数变化
    useEffect(() => {
        const dirParam = searchParams.get('dir') || '';
        const viewParam = searchParams.get('view') || 'grid';

        if (dirParam !== dir) {
            setDir(dirParam);
        }

        if (viewParam !== view) {
            setView(viewParam);
        }
    }, [searchParams]);

    const enterDir = (sub: string) => {
        const newDir = dir ? `${dir}/${sub}` : sub;
        setDir(newDir);
        // 更新URL参数
        setSearchParams({dir: newDir, view});
    };

    const backDir = () => {
        if (!dir) return;
        const arr = dir.split('/');
        arr.pop();
        const newDir = arr.join('/');
        setDir(newDir);
        // 更新URL参数
        setSearchParams({dir: newDir, view});
    };

    const switchView = (newView: string) => {
        setView(newView);
        // 更新URL参数
        setSearchParams({dir, view: newView});
    };

    const handleDelete = async (item: any) => {
        try {
            const params: DeleteImageParams = {path: item.path};
            const success = await ImageService.delete(params);

            if (success) {
                // 删除成功后刷新列表
                fetchList(dir);
            }
        } catch (err) {
            console.error('删除文件失败:', err);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center">
                <Button onClick={backDir} disabled={!dir} className="mr-4">返回上级</Button>
                <Breadcrumb>
                    <Breadcrumb.Item onClick={() => setDir('')}>根目录</Breadcrumb.Item>
                    {dir.split('/').filter(Boolean).map((d, i) => (
                        <Breadcrumb.Item
                            key={i}
                            onClick={() => {
                                const newPath = dir.split('/').slice(0, i + 1).join('/');
                                setDir(newPath);
                            }}
                            className="cursor-pointer hover:text-blue-500"
                        >
                            {d}
                        </Breadcrumb.Item>
                    ))}
                </Breadcrumb>
            </div>

            <div className="mb-4">
                <Button
                    icon={<IconImage/>}
                    onClick={() => switchView('grid')}
                    theme={view === 'grid' ? 'solid' : 'light'}
                    aria-label="平铺模式"
                />
                <Button
                    icon={<IconFolder/>}
                    onClick={() => switchView('list')}
                    theme={view === 'list' ? 'solid' : 'light'}
                    className="ml-2"
                    aria-label="列表模式"
                />
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    错误: {error}
                    <Button onClick={() => fetchList(dir)} className="ml-4" size="small">重试</Button>
                </div>
            )}

            {loading ? <Spin/> : (
                <>
                    {list.length === 0 && !error ? (
                        <Empty title="暂无数据" description="该目录下没有文件或文件夹"/>
                    ) : (
                        <div className={view === 'grid' ? 'grid grid-cols-6 gap-4' : ''}>
                            {list.map((item) => (
                                <Card
                                    key={item.path}
                                    shadows="hover"
                                    className="relative group"
                                    style={{width: view === 'grid' ? '140px' : '100%', display: 'flex'}}
                                >
                                    {item.type === 'dir' ? (
                                        <div
                                            className="flex items-center w-full h-full"
                                            onClick={(e) => {
                                                // 阻止事件冒泡到卡片级别
                                                e.stopPropagation();
                                                enterDir(item.name);
                                            }}
                                        >
                                            <IconFolder size="large" className="mr-2"/>
                                            <span>{item.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center w-full h-full">
                                            {view === 'grid' ? (
                                                <div className="relative w-full">
                                                    <img
                                                        src={item.url}
                                                        alt={item.name}
                                                        className="w-full h-24 object-contain cursor-pointer"
                                                        onClick={() => {
                                                            setPreviewSrc(item.url);
                                                            setPreviewVisible(true);
                                                        }}
                                                        onError={(e) => {
                                                            // 图片加载失败时隐藏图片
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center w-full">
                                                    <IconImage size="large" className="mr-2"/>
                                                    <Typography.Text
                                                        className="mr-auto cursor-pointer truncate max-w-xs"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPreviewSrc(item.url);
                                                            setPreviewVisible(true);
                                                        }}>{item.name}</Typography.Text>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        icon={<IconDelete/>}
                                        theme="solid"
                                        size="small"
                                        color="danger"
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                                        onClick={() => {
                                            Modal.confirm({
                                                title: "确认删除",
                                                content: `确定要删除 ${item.name} 吗？此操作无法撤销。`,
                                                onOk: () => handleDelete(item),
                                                okText: "确认删除",
                                                cancelText: "取消",
                                                okType: "danger"
                                            });
                                        }}
                                    />
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {previewVisible && (
                <ImagePreview
                    visible={true}
                    src={previewSrc}
                    onClose={() => setPreviewVisible(false)}
                />
            )}

        </div>
    );
}
