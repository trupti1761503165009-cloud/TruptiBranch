// Utility functions for DMS

/**
 * Format a date to a readable string
 */
export const MicrosoftOfficeDocumentType: string[] = ["doc", "docx", "rtf", "xls", "xlsx", "ppt", "pptx", "ods"];

export function formatDate(date: Date, format: "short" | "long" = "short"): string {
  if (format === "short") {
    return date.toLocaleDateString();
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get time difference in human-readable format
 */
export function getTimeDifference(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffSeconds = Math.ceil(diffTime / 1000);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString();
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate: Date): boolean {
  return dueDate < new Date();
}

/**
 * Get days until deadline
 */
export function daysUntilDeadline(dueDate: Date): number {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse comma-separated string into array
 */
export function parseCommaSeparated(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert status string to display format
 */
export function formatStatus(status: string): string {
  return status.replace(/([A-Z])/g, " $1").trim();
}

/**
 * Get color for status badge
 */
export function getStatusColor(
  status: string
): { background: string; text: string } {
  const colors: Record<
    string,
    { background: string; text: string }
  > = {
    Draft: { background: "#fff3cd", text: "#856404" },
    SubmittedForReview: { background: "#cfe2ff", text: "#0078d4" },
    Reviewed: { background: "#cfe2ff", text: "#0078d4" },
    ApprovalPending: { background: "#fff3cd", text: "#856404" },
    Approved: { background: "#d1e7dd", text: "#155724" },
    SignaturePending: { background: "#fff3cd", text: "#856404" },
    Final: { background: "#d1e7dd", text: "#155724" },
    Pending: { background: "#fff3cd", text: "#856404" },
    InProgress: { background: "#cfe2ff", text: "#0078d4" },
    Completed: { background: "#d1e7dd", text: "#155724" },
    Rejected: { background: "#f8d7da", text: "#721c24" },
  };

  return colors[status] || { background: "#e9ecef", text: "#6c757d" };
}

/**
 * Get color for priority badge
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    High: "#da3633",
    Medium: "#fbbc04",
    Low: "#34a853",
  };
  return colors[priority] || "#6c757d";
}

/**
 * Clone object deeply
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sort array by multiple fields
 */
export function sortByMultiple<T>(
  array: T[],
  fields: Array<{ field: keyof T; ascending?: boolean }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { field, ascending = true } of fields) {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Filter array by multiple conditions
 */
export function filterByMultiple<T>(
  array: T[],
  conditions: Array<(item: T) => boolean>
): T[] {
  return array.filter((item) => conditions.every((condition) => condition(item)));
}

/**
 * Group array items by property
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Retry promise with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Convert array to CSV string
 */
export function arrayToCSV(
  array: any[],
  headers: string[]
): string {
  const csvRows = [headers.join(",")];

  for (const obj of array) {
    const csvRow = headers.map((header) => {
      const value = obj[header];
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(csvRow.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csv: string,
  filename: string = "export.csv"
): void {
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = filename;
  link.click();
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Merge objects (shallow)
 */
export function merge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return Object.assign({}, target, ...sources);
}

/**
 * Get error message from error object
 */
export function getErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  return "An unknown error occurred";
}

/**
 * Validate document status workflow
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    Draft: ["SubmittedForReview"],
    SubmittedForReview: ["Reviewed", "Draft"],
    Reviewed: ["ApprovalPending", "SubmittedForReview"],
    ApprovalPending: ["Approved", "Reviewed"],
    Approved: ["SignaturePending"],
    SignaturePending: ["Final"],
    Final: [],
  };

  return (validTransitions[currentStatus] || []).includes(newStatus);
}

// -------------------------------
// File type icon helpers (shared)
// -------------------------------

export const GetImgUrlByFileExtension = (extension: string): string => {
  let imgType = 'genericfile.png';
  const normalized = String(extension || '').toLowerCase().trim();
  imgType = `${normalized}.svg`;

  switch (normalized) {
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'gif':
    case 'png':
      imgType = 'photo.png';
      break;
    case 'ppt':
    case 'doc':
    case 'xls':
      imgType = `${normalized}x.svg`;
      break;
    case 'pptx':
    case 'docx':
    case 'xlsx':
      imgType = `${normalized}.svg`;
      break;
    case 'folder':
      imgType = 'folder.svg';
      break;
    case 'pdf':
      imgType = 'pdf.svg';
      break;
    default:
      // keep the computed `${normalized}.svg` for known Office types, otherwise fallback.
      imgType = `${normalized}.svg`;
      break;
  }

  return `https://res-1.cdn.office.net/files/fabric-cdn-prod_20221209.001/assets/item-types/16/${imgType}`;
};

export const getFileTypeIcon = (fileName: string): string => {
  const parts = String(fileName || '').split('.');
  const ext = parts.length > 1 ? String(parts.pop() || '') : String(fileName || '');
  return GetImgUrlByFileExtension(ext);
};

export const getHeight = (topHeight: number): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight =
      document.getElementsByClassName("ms-DetailsList")[0].clientHeight;
    const fullHeight = Math.round(window.innerHeight) - topHeight;
    return detailListHeight < fullHeight ? detailListHeight + 20 : fullHeight;
  } else {
    return Math.round(window.innerHeight) - topHeight;
  }
};

export const setHeightdefault = (): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight =
      document.getElementsByClassName("ms-DetailsList")[0].clientHeight;

    return detailListHeight;
  } else {
    return Math.round(window.innerHeight);
  }
};

export const getHeightById = (topHeight: number, divId: string): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight = document
      .getElementById(divId)
      ?.getElementsByClassName("ms-DetailsList")[0].clientHeight;
    const fullHeight = Math.round(window.innerHeight) - topHeight;
    const detailHeight = !!detailListHeight ? detailListHeight : 0;
    return detailHeight < fullHeight ? detailHeight + 20 : fullHeight;
  } else {
    return Math.round(window.innerHeight) - topHeight;
  }
};
export const _getPagedonclick = (
  currentPage: number,
  pageSize: number,
  items: any[]
) => {
  let fromNo;
  let toNo;
  let pagedItems;
  let oddItems = items.length % pageSize;
  let totalPage;
  if (oddItems > 0) {
    totalPage = items.length / pageSize;
    totalPage = totalPage.toString().split(".", 2);
    totalPage = totalPage[1];
    if (totalPage >= "5") {
      let page = items.length / pageSize;
      totalPage = Math.round(page);
    } else {
      let page = items.length / pageSize;
      totalPage = Math.round(Number(page)) + 1;
    }
  } else {
    totalPage = items.length / pageSize;
  }
  if (currentPage == 1) {
    pagedItems = items.slice(0, pageSize);
  } else {
    const roundupPage = Math.ceil(currentPage - 1);
    pagedItems = items.slice(
      roundupPage * pageSize,
      roundupPage * pageSize + pageSize
    );
  }
  if (currentPage == 1) {
    fromNo = 1;
    toNo = totalPage == 1 ? items.length : pageSize;
  } else {
    if (currentPage - 1 == 1) {
      fromNo = pageSize + (currentPage - 1);
    } else {
      fromNo = pageSize * (currentPage - 1) + 1;
    }
    let setToNo = pageSize * currentPage;
    if (setToNo > items.length) {
      toNo = items.length;
    } else {
      toNo = pageSize * currentPage;
    }
  }

  return { pagedItems, fromNo, toNo, totalPage };
};
export const onDetailListHeaderRender = (
  headerProps: any,
  defaultRender: any
) => {
  return defaultRender({
    ...headerProps,
    styles: {
      root: {
        selectors: {
          ".ms-DetailsHeader-cell": {
            whiteSpace: "normal",
            textOverflow: "clip",
            lineHeight: "normal",
            background: "#1300a6",
            color: "#fff",
            fontSize: "13px",
          },
          ".ms-DetailsHeader-cell:hover": {
            background: "#213577",
            color: "#fff",
            fontSize: "13px",
          }, // Hover class
          ".ms-DetailsHeader-cellTitle": {
            height: "100%",
            alignItems: "center",
          },
        },
      },
    },
  });
};