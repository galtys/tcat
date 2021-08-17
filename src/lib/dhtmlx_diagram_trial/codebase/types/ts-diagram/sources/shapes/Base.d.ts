import { ICoords, IItemConfig, ILinkConfig, IShape, IBoxSize } from "../types";
export declare class BaseShape implements IShape {
    config: IItemConfig | ILinkConfig;
    id: string;
    constructor(config: IItemConfig | ILinkConfig, parameters?: any);
    isConnector(): boolean;
    canResize(): boolean;
    getCenter(): ICoords;
    getBox(): IBoxSize;
    getMetaInfo(): any[];
    move(x: number, y: number): void;
    resize(width: number, height: number): void;
    rotate(angle: number): void;
    update(config: IItemConfig | ILinkConfig): void;
    render(): string;
    getPoint(x: number, y: number): ICoords;
    setCss(value: string): void;
    protected getCss(): string;
    protected setDefaults(config: IItemConfig | ILinkConfig, defaults?: IItemConfig): IItemConfig | ILinkConfig;
    protected getCoords(config: IItemConfig | ILinkConfig): ICoords;
}
