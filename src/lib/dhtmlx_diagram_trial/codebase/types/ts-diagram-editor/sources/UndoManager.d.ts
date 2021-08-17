import { DataCollection } from "../../ts-data";
export declare class UndoManager {
    private _data;
    private _state;
    private _position;
    private _inProgress;
    constructor(data: DataCollection);
    push(newState: any): void;
    reset(): void;
    undo(first?: boolean): any;
    redo(): any;
    isUndo(): boolean;
    isRedo(): boolean;
    private _apply;
}
