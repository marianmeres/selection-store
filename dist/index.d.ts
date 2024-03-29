export declare const createSelectionStore: <T>(items: T[], selected?: number[], multiple?: boolean) => {
    subscribe: (cb: import("@marianmeres/store").Subscribe<{
        items: T[];
        selected: number[];
        selection: T[];
    }>) => import("@marianmeres/store").Unsubscribe;
    get: () => {
        items: T[];
        selected: number[];
        selection: T[];
    };
    select: (indexOrItem: number | T | T[] | number[], resetSelected?: boolean) => any;
    unselect: (indexOrItem?: number | T | T[] | number[]) => any;
    findIndexBy: (propName: string, propValue: any) => number;
    reset: (items?: T[]) => any;
};
