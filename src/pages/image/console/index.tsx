import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Breadcrumb,
    Button,
    Empty,
    ImagePreview,
    Input,
    Modal,
    Select,
    Toast,
    Tooltip,
    Typography,
} from '@douyinfe/semi-ui-19';
import {
    IconArrowLeft,
    IconCopy,
    IconDelete,
    IconFolder,
    IconGridView,
    IconHome,
    IconImage,
    IconListView,
    IconRefresh,
    IconSearch,
    IconUpload,
} from '@douyinfe/semi-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImageService } from '@/src/services/image';
import { DeleteImageParams, ImageItem } from '@/src/api/image/types';
import { APP_LOGIN_REDIRECT_URI, APP_NAME } from '@/src/config';

type ViewMode = 'grid' | 'list';
type SortOrder = 'name-asc' | 'name-desc';

const surfaceStyle: React.CSSProperties = {
    background: 'var(--semi-color-bg-0)',
    borderColor: 'var(--semi-color-border)',
};

const getImageType = (name: string) => {
    const extension = name.split('.').pop();
    return extension && extension !== name ? extension.toUpperCase() : '图片';
};

interface ImageThumbnailProps {
    item: ImageItem;
    mode: ViewMode;
    onOpen: () => void;
}

function ImageThumbnail({item, mode, onOpen}: ImageThumbnailProps) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className="flex h-full w-full items-center justify-center text-(--semi-color-text-2)">
                <IconImage size="extra-large"/>
            </div>
        );
    }

    return (
        <img
            src={item.url}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className={
                mode === 'grid'
                    ? 'h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]'
                    : 'h-full w-full object-cover'
            }
            onClick={(event) => {
                event.stopPropagation();
                onOpen();
            }}
            onError={() => setFailed(true)}
        />
    );
}

interface BrowserSkeletonProps {
    mode: ViewMode;
}

function BrowserSkeleton({mode}: BrowserSkeletonProps) {
    if (mode === 'list') {
        return (
            <div className="overflow-hidden rounded-lg border" style={surfaceStyle}>
                {Array.from({length: 7}).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                        style={{borderColor: 'var(--semi-color-border)'}}
                    >
                        <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-(--semi-color-fill-0)"/>
                        <div className="h-4 w-1/3 animate-pulse rounded bg-(--semi-color-fill-0)"/>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {Array.from({length: 10}).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-lg border" style={surfaceStyle}>
                    <div className="aspect-[4/3] animate-pulse bg-(--semi-color-fill-0)"/>
                    <div className="space-y-2 p-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-(--semi-color-fill-0)"/>
                        <div className="h-3 w-1/4 animate-pulse rounded bg-(--semi-color-fill-0)"/>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ImageBrowser() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestIdRef = useRef(0);

    const dir = searchParams.get('dir') || '';
    const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';

    const [list, setList] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [query, setQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('name-asc');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    useEffect(() => {
        document.title = `图片浏览 - ${APP_NAME}`;
    }, []);

    useEffect(() => {
        const requestId = ++requestIdRef.current;

        setLoading(true);
        setError(null);

        ImageService.list({dir})
            .then((result) => {
                if (requestId !== requestIdRef.current) return;

                const items = result?.data || [];
                setList(Array.isArray(items) ? items : []);
            })
            .catch((err) => {
                if (requestId !== requestIdRef.current) return;
                console.error('获取图片列表失败:', err);
                setError(err instanceof Error ? err.message : '未知错误');
            })
            .finally(() => {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                }
            });
    }, [dir, reloadKey]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const direction = sortOrder === 'name-desc' ? -1 : 1;

        return list
            .filter((item) => !normalizedQuery || item.name.toLocaleLowerCase().includes(normalizedQuery))
            .sort((first, second) => {
                const firstIsDirectory = first.type === 'dir';
                const secondIsDirectory = second.type === 'dir';

                if (firstIsDirectory !== secondIsDirectory) {
                    return firstIsDirectory ? -1 : 1;
                }

                return first.name.localeCompare(second.name, 'zh-CN', {
                    numeric: true,
                    sensitivity: 'base',
                }) * direction;
            });
    }, [list, query, sortOrder]);

    const previewImages = useMemo(
        () => filteredItems.filter((item) => item.type !== 'dir'),
        [filteredItems],
    );

    const directoryCount = list.filter((item) => item.type === 'dir').length;
    const imageCount = list.length - directoryCount;
    const hasActiveFilter = Boolean(query.trim());

    const updateBrowseParams = (nextDir: string, nextView: ViewMode = view) => {
        const nextParams = new URLSearchParams();

        if (nextDir) {
            nextParams.set('dir', nextDir);
        }
        if (nextView === 'list') {
            nextParams.set('view', 'list');
        }

        setSearchParams(nextParams);
    };

    const enterDirectory = (name: string) => {
        const nextDir = dir ? `${dir}/${name}` : name;
        setQuery('');
        updateBrowseParams(nextDir);
    };

    const goBack = () => {
        if (!dir) return;

        const segments = dir.split('/').filter(Boolean);
        segments.pop();
        setQuery('');
        updateBrowseParams(segments.join('/'));
    };

    const goToDirectory = (nextDir: string) => {
        setQuery('');
        updateBrowseParams(nextDir);
    };

    const switchView = (nextView: ViewMode) => {
        updateBrowseParams(dir, nextView);
    };

    const openPreview = (item: ImageItem) => {
        const index = previewImages.findIndex((image) => image.path === item.path);

        if (index >= 0) {
            setPreviewIndex(index);
            setPreviewVisible(true);
        }
    };

    const handleDelete = async (item: ImageItem) => {
        const params: DeleteImageParams = {path: item.path};
        const success = await ImageService.delete(params);

        if (success) {
            setList((currentList) => currentList.filter((currentItem) => currentItem.path !== item.path));
            setPreviewVisible(false);
        }
    };

    const handleCopyLink = async (item: ImageItem) => {
        try {
            await navigator.clipboard.writeText(item.url);
            Toast.success('图片链接已复制');
        } catch (err) {
            console.error('复制图片链接失败:', err);
            Toast.error('复制失败');
        }
    };

    const renderActions = (item: ImageItem) => (
        <div
            className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            onClick={(event) => event.stopPropagation()}
        >
            {item.type !== 'dir' && (
                <Tooltip content="复制链接">
                    <Button
                        icon={<IconCopy/>}
                        theme="borderless"
                        type="tertiary"
                        size="small"
                        aria-label={`复制 ${item.name} 的链接`}
                        onClick={() => handleCopyLink(item)}
                    />
                </Tooltip>
            )}
            <Tooltip content="删除">
                <Button
                    icon={<IconDelete/>}
                    theme="borderless"
                    type="danger"
                    size="small"
                    aria-label={`删除 ${item.name}`}
                    onClick={() => {
                        Modal.confirm({
                            title: '确认删除',
                            content: `确定要删除 ${item.name} 吗？此操作无法撤销。`,
                            onOk: () => handleDelete(item),
                            okText: '确认删除',
                            cancelText: '取消',
                            okType: 'danger',
                        });
                    }}
                />
            </Tooltip>
        </div>
    );

    const renderGrid = () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {filteredItems.map((item) => {
                const isDirectory = item.type === 'dir';

                return (
                    <article
                        key={item.path}
                        className="group relative overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={surfaceStyle}
                    >
                        <div
                            role="button"
                            tabIndex={0}
                            aria-label={isDirectory ? `打开文件夹 ${item.name}` : `预览图片 ${item.name}`}
                            className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-(--semi-color-fill-0)"
                            onClick={() => (isDirectory ? enterDirectory(item.name) : openPreview(item))}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    if (isDirectory) {
                                        enterDirectory(item.name);
                                    } else {
                                        openPreview(item);
                                    }
                                }
                            }}
                        >
                            {isDirectory ? (
                                <div
                                    className="flex h-full w-full items-center justify-center text-(--semi-color-primary)">
                                    <IconFolder size="extra-large"/>
                                </div>
                            ) : (
                                <ImageThumbnail item={item} mode="grid" onOpen={() => openPreview(item)}/>
                            )}

                            <span
                                className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-medium"
                                style={{
                                    background: 'color-mix(in srgb, var(--semi-color-bg-0) 88%, transparent)',
                                    color: 'var(--semi-color-text-1)',
                                    backdropFilter: 'blur(6px)',
                                }}
                            >
                                {isDirectory ? '文件夹' : getImageType(item.name)}
                            </span>
                        </div>

                        <div className="absolute right-2 top-2 z-10">{renderActions(item)}</div>

                        <div className="min-w-0 px-3 py-3">
                            <Typography.Text
                                ellipsis={{showTooltip: true}}
                                className="block font-medium"
                                style={{display: 'block'}}
                            >
                                {item.name}
                            </Typography.Text>
                            <Typography.Text
                                type="tertiary"
                                size="small"
                                style={{display: 'block', marginTop: 2}}
                            >
                                {isDirectory ? '文件夹' : '图片文件'}
                            </Typography.Text>
                        </div>
                    </article>
                );
            })}
        </div>
    );

    const renderList = () => (
        <div className="overflow-hidden rounded-lg border" style={surfaceStyle}>
            {filteredItems.map((item) => {
                const isDirectory = item.type === 'dir';

                return (
                    <div
                        key={item.path}
                        role="button"
                        tabIndex={0}
                        aria-label={isDirectory ? `打开文件夹 ${item.name}` : `预览图片 ${item.name}`}
                        className="group grid min-h-18 cursor-pointer grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b px-3 py-2 transition-colors last:border-b-0 hover:bg-(--semi-color-fill-0) md:grid-cols-[64px_minmax(0,1fr)_120px_120px] md:px-4"
                        style={{borderColor: 'var(--semi-color-border)'}}
                        onClick={() => (isDirectory ? enterDirectory(item.name) : openPreview(item))}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                if (isDirectory) {
                                    enterDirectory(item.name);
                                } else {
                                    openPreview(item);
                                }
                            }
                        }}
                    >
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-(--semi-color-fill-0) md:h-14 md:w-14">
                            {isDirectory ? (
                                <div
                                    className="flex h-full w-full items-center justify-center text-(--semi-color-primary)">
                                    <IconFolder size="large"/>
                                </div>
                            ) : (
                                <ImageThumbnail item={item} mode="list" onOpen={() => openPreview(item)}/>
                            )}
                        </div>

                        <div className="min-w-0">
                            <Typography.Text ellipsis={{showTooltip: true}} className="block font-medium">
                                {item.name}
                            </Typography.Text>
                            <Typography.Text
                                type="tertiary"
                                size="small"
                                className="md:hidden"
                                style={{display: 'block', marginTop: 2}}
                            >
                                {isDirectory ? '文件夹' : getImageType(item.name)}
                            </Typography.Text>
                        </div>

                        <Typography.Text type="tertiary" size="small" className="hidden md:block">
                            {isDirectory ? '文件夹' : getImageType(item.name)}
                        </Typography.Text>

                        <div className="flex justify-end">{renderActions(item)}</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-full w-full bg-(--semi-color-tertiary-light-default)">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Typography.Title heading={3} className="!mb-1">
                            图片浏览
                        </Typography.Title>
                        <Typography.Text type="tertiary">
                            {loading
                                ? '正在加载当前目录'
                                : `共 ${list.length} 项，${directoryCount} 个文件夹，${imageCount} 张图片`}
                        </Typography.Text>
                    </div>
                    <Button
                        icon={<IconUpload/>}
                        theme="solid"
                        onClick={() => navigate(APP_LOGIN_REDIRECT_URI)}
                    >
                        上传图片
                    </Button>
                </header>

                <div
                    className="mt-5 flex min-h-12 flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
                    style={surfaceStyle}
                >
                    <Tooltip content="返回上级">
                        <Button
                            icon={<IconArrowLeft/>}
                            theme="borderless"
                            type="tertiary"
                            disabled={!dir}
                            aria-label="返回上级"
                            onClick={goBack}
                        />
                    </Tooltip>

                    <div className="min-w-0 flex-1">
                        <Breadcrumb
                            aria-label="当前目录"
                            className="min-w-0"
                            showTooltip={{width: 220}}
                        >
                            <Breadcrumb.Item
                                icon={<IconHome/>}
                                onClick={() => goToDirectory('')}
                                className="cursor-pointer"
                            >
                                根目录
                            </Breadcrumb.Item>
                            {dir.split('/').filter(Boolean).map((segment, index) => (
                                <Breadcrumb.Item
                                    key={`${segment}-${index}`}
                                    onClick={() =>
                                        goToDirectory(dir.split('/').slice(0, index + 1).join('/'))
                                    }
                                    className="cursor-pointer"
                                >
                                    {segment}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                    </div>
                </div>

                <div
                    className="mt-3 flex flex-col gap-3 rounded-lg border p-3 lg:flex-row lg:items-center"
                    style={surfaceStyle}
                >
                    <Input
                        prefix={<IconSearch/>}
                        placeholder="搜索当前目录"
                        value={query}
                        showClear
                        className="w-full lg:max-w-sm"
                        onChange={setQuery}
                    />

                    <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                        <Select
                            value={sortOrder}
                            className="w-32"
                            aria-label="排序方式"
                            onChange={(value) => setSortOrder(value as SortOrder)}
                            optionList={[
                                {value: 'name-asc', label: '名称升序'},
                                {value: 'name-desc', label: '名称降序'},
                            ]}
                        />

                        <Tooltip content="刷新">
                            <Button
                                icon={<IconRefresh/>}
                                theme="borderless"
                                type="tertiary"
                                loading={loading}
                                aria-label="刷新"
                                onClick={() => setReloadKey((currentKey) => currentKey + 1)}
                            />
                        </Tooltip>

                        <div
                            className="flex rounded-md border p-0.5"
                            style={{borderColor: 'var(--semi-color-border)'}}
                        >
                            <Tooltip content="网格视图">
                                <Button
                                    icon={<IconGridView/>}
                                    theme={view === 'grid' ? 'solid' : 'borderless'}
                                    type="tertiary"
                                    size="small"
                                    aria-label="网格视图"
                                    aria-pressed={view === 'grid'}
                                    onClick={() => switchView('grid')}
                                />
                            </Tooltip>
                            <Tooltip content="列表视图">
                                <Button
                                    icon={<IconListView/>}
                                    theme={view === 'list' ? 'solid' : 'borderless'}
                                    type="tertiary"
                                    size="small"
                                    aria-label="列表视图"
                                    aria-pressed={view === 'list'}
                                    onClick={() => switchView('list')}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {error && (
                    <div
                        className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-(--semi-color-danger-light-default) px-4 py-3 text-(--semi-color-danger)">
                        <Typography.Text type="danger">加载失败：{error}</Typography.Text>
                        <Button
                            size="small"
                            type="danger"
                            onClick={() => setReloadKey((currentKey) => currentKey + 1)}
                        >
                            重试
                        </Button>
                    </div>
                )}

                <div className="mt-4" aria-live="polite">
                    {loading ? (
                        <BrowserSkeleton mode={view}/>
                    ) : filteredItems.length === 0 ? (
                        <div
                            className="flex min-h-72 items-center justify-center rounded-lg border"
                            style={surfaceStyle}
                        >
                            <Empty
                                title={hasActiveFilter ? '没有匹配结果' : '目录为空'}
                                description={
                                    hasActiveFilter
                                        ? '请尝试其他搜索关键词'
                                        : '当前目录下没有图片或文件夹'
                                }
                            />
                        </div>
                    ) : (
                        <>
                            {hasActiveFilter && (
                                <Typography.Text type="tertiary" className="mb-3 block">
                                    找到 {filteredItems.length} 项
                                </Typography.Text>
                            )}
                            {view === 'grid' ? renderGrid() : renderList()}
                        </>
                    )}
                </div>
            </div>

            {previewVisible && previewImages.length > 0 && (
                <ImagePreview
                    visible
                    src={previewImages.map((item) => item.url)}
                    currentIndex={previewIndex}
                    onChange={setPreviewIndex}
                    onClose={() => setPreviewVisible(false)}
                    setDownloadName={(src) => {
                        const index = previewImages.findIndex((item) => item.url === src);
                        return index >= 0
                            ? previewImages[index].name
                            : decodeURIComponent(src.split('/').pop() || 'image');
                    }}
                />
            )}
        </div>
    );
}
