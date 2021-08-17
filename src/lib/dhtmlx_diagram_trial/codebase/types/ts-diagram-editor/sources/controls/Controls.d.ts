import { IEventSystem } from "../../../ts-common/events";
import { DataEvents, Diagram, DiagramEvents, IItemConfig, SelectionEvents } from "../../../ts-diagram";
import { Connect } from "./connect";
import { BlockSelection } from "../BlockSelection";
import { DiagramEditorEvents, ICoords } from "../types";
export declare function getLength(from: IItemConfig, to: IItemConfig): number;
export declare class Controls {
    connect: Connect;
    private _events;
    private _diagram;
    private _blockSelection;
    private _resize;
    private _diagramSize;
    private _isOrgType;
    constructor(events: IEventSystem<DataEvents | SelectionEvents | DiagramEvents | DiagramEditorEvents>, diagram: Diagram, blockSelection: BlockSelection);
    render(item: IItemConfig, size: any): any;
    setNearShape(shape: IItemConfig): void;
    toggleNearShape(shape: IItemConfig): void;
    getPoint(x: number, y: number): ICoords;
    onMove(_e: any, mov: ICoords, p: any): void;
    onUp(): void;
    private _rotate;
    private _gripClick;
}
