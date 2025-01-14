import { FilterOptions } from "dashboard/common/filter";

export const isObjectValuesEmpty = (obj: Record<string, string | number>) =>
    Object.values(obj).every((value) =>
        typeof value === "string" ? !value.trim().length : !value
    );

export const filterParams = (
    obj: Record<string, string | number>
): Record<string, string | number> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) =>
            typeof value === "string"
                ? value.trim().length > 0
                : value !== null && value !== undefined
        )
    );
};

export const createStringifySearchQuery = (obj: Record<string, string | number>): string => {
    const filteredObj = filterParams(obj);

    if (Object.keys(filteredObj).length === 0) {
        return "";
    }

    return Object.entries(filteredObj)
        .map(([key, value], index) => {
            return `${index > 0 ? "+" : ""}${value}.${key}`;
        })
        .join("");
};

export const createStringifyFilterQuery = (filterArray: FilterOptions[]): string => {
    return filterArray
        .map(({ column, value }, index) => {
            if (value.includes("-")) {
                const [wordFrom, wordTo] = value.split("-");
                return `${index > 0 ? "+" : ""}${wordFrom}.${wordTo}.${column}`;
            }
            return `${value.trim()}.${column}`;
        })
        .join("+");
};

export function debounce<T extends (...args: any[]) => any>(
    callee: T,
    timeoutMs: number
): (...args: Parameters<T>) => void {
    let lastCall: number | null = null;
    let lastCallTimer: NodeJS.Timeout | null = null;

    return function perform(...args: Parameters<T>): void {
        if (lastCall !== null && Date.now() - lastCall <= timeoutMs) {
            if (lastCallTimer) {
                clearTimeout(lastCallTimer);
            }
        }

        lastCall = Date.now();

        lastCallTimer = setTimeout(() => {
            callee(...args);
        }, timeoutMs);
    };
}
