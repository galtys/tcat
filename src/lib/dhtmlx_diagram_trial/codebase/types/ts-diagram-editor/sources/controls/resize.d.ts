import { Diagram, IItemConfig, ILinkConfig } from "../../../ts-diagram";
import { Controls } from "./Controls";
export declare class Resize {
    private _diagram;
    private _controls;
    private _isOrgType;
    constructor(controls: Controls, diagram: Diagram);
    getPoints(item: IItemConfig, size: any): any;
}
export declare function getConnectorPoints(item: ILinkConfig, scale: number): any[];
export declare function getRectPoints(item: IItemConfig, scale: number): any[];
