export declare const meta: {
    grid: {
        id: string;
        type: string;
        label: string;
        validate: string;
        options: {
            id: string;
            value: number;
            icon: () => any;
            validate: string;
        }[];
    };
    arrange: {
        id: string;
        type: string;
        label: string;
        validate: string;
        options: ({
            id: string;
            value: string;
            label: string;
            validate: string;
            icon?: undefined;
        } | {
            id: string;
            value: string;
            label: string;
            validate: string;
            icon: () => any;
        })[];
    };
    position: {
        id: string;
        type: string;
        label: string;
        validate: string;
        options: {
            id: string;
            value: string;
            label: string;
            validate: string;
        }[];
    };
    size: {
        id: string;
        type: string;
        label: string;
        options: {
            id: string;
            value: string;
            label: string;
            validate: string;
        }[];
    };
    color: {
        id: string;
        type: string;
        label: string;
    };
    title: {
        id: string;
        type: string;
        label: string;
    };
    text: {
        id: string;
        type: string;
        label: string;
    };
    img: {
        id: string;
        type: string;
        label: string;
    };
    fill: {
        id: string;
        type: string;
        label: string;
    };
    textProps: {
        id: string;
        type: string;
        label: string;
    };
    strokeProps: {
        id: string;
        type: string;
        label: string;
    };
};
export declare function getMeta(properties: any): any[];
