import { IEventSystem } from "../../ts-common/events";
import { DataCollection } from "../../ts-data";
import { DataEvents, IItemConfig, IShapeCollectionConfig } from "./types";
export declare class ShapesCollection extends DataCollection {
    config: IShapeCollectionConfig;
    private _roots;
    private _orgMode;
    private _orgTypes;
    constructor(config: IShapeCollectionConfig, events: IEventSystem<DataEvents>);
    getNearId(id: string): string;
    mapVisible(handler: any): any[];
    getRoots(): string[];
    protected _removeNested(obj: any): void;
    protected _eachBranch(item: IItemConfig, handler: any, stack: any[]): void;
    protected _parse_data(data: any[]): void;
    protected _mark_chains(): void;
    protected _addLevel(shape: any, level?: number): void;
}
