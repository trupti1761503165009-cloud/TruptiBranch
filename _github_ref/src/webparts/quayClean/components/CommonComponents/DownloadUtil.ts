import { logGenerator } from "../../../../Common/Util";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";

export interface IDownloadFileOptions {
    context: any;
    provider: IDataProvider;
    fileRelativeUrl: string;        // /Shared Documents/MasterFiles/AssetsMaster.xlsx
    downloadFileName?: string;      // AssetsMaster.xlsx
    loadingMessage?: string;
    successMessage?: string;
    notFoundMessage?: string;
    errorMessage?: string;
}

export const downloadFileWithToast = async (
    options: IDownloadFileOptions,
    toastService: any
): Promise<void> => {

    const {
        context,
        provider,
        fileRelativeUrl,
        downloadFileName,
        loadingMessage = "Checking file...",
        successMessage = "Download started",
        notFoundMessage = "File not found",
        errorMessage = "Unable to download file"
    } = options;

    const toastId = toastService.loading(loadingMessage);

    try {
        const absoluteUrl =
            context.pageContext.web.absoluteUrl +
            fileRelativeUrl.replace(/^\//, "");

        // 🔍 Check file existence
        const response = await fetch(absoluteUrl, { method: "HEAD" });

        if (!response.ok) {
            toastService.updateLoadingWithError(toastId, notFoundMessage);
            return;
        }

        // ✅ Download
        const link = document.createElement("a");
        link.href = absoluteUrl;
        link.download = downloadFileName || "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toastService.updateLoadingWithSuccess(toastId, successMessage);

    } catch (error: any) {
        toastService.updateLoadingWithError(toastId, errorMessage);

        // ✅ Use existing common logger
        logGenerator(provider, {
            ErrorMethodName: "downloadFileWithToast",
            CustomErrormessage: errorMessage,
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: window.location.pathname
        });
    }
};