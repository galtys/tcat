import { IEventSystem } from "../../../ts-common/events";
import { DataCollection } from "../../../ts-data";
import { SelectionEvents } from "../types";
export declare class Selection {
    events: IEventSystem<SelectionEvents>;
    private _selected;
    private _data;
    constructor(_config: any, data?: DataCollection, events?: IEventSystem<any>);
    getId(): string;
    getItem(): any;
    remove(id?: string): boolean;
    add(id: string): void;
}
