import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageError } from "@/components/PageError";
import { isDynamicImportError } from "@/components/ErrorBoundary";
import { recoverFromChunkLoadError } from "@/lib/chunk-recovery";

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  // 1. 状态与展示内容解析
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const isImportError = isDynamicImportError(error);
  const emoji = is404 ? "👽" : "😵";
  const title = is404
    ? "页面走丢了"
    : isImportError
      ? "应用资源需要刷新"
      : "出现了一点小问题";
  const message = is404
    ? "您访问的页面可能被外星人抓走了"
    : isImportError
      ? "浏览器仍在使用旧版缓存，修复后会保留您的歌单和设置"
      : isRouteErrorResponse(error)
        ? error.data?.message || error.statusText
        : error instanceof Error
          ? error.message
          : String(error || "发生了未知错误");

  return (
    <PageError
      className="h-dvh w-full bg-background"
      title={title}
      message={message}
      icon={emoji}
    >
      <Button
        variant="outline"
        className="flex-1 h-11 rounded-xl"
        onClick={() => navigate(-1)}
      >
        返回
      </Button>
      <Button
        className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20"
        onClick={() => {
          if (isImportError) {
            void recoverFromChunkLoadError();
            return;
          }
          navigate("/", { replace: true });
        }}
      >
        {isImportError ? "修复并重新加载" : "首页"}
      </Button>
    </PageError>
  );
}
