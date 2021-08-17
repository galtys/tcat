import { Diagram, IItemConfig, ILinkConfig } from "../../../ts-diagram";
import { Controls } from "./Controls";
export declare class Connect {
    private _diagram;
    private _nearShape;
    private _nearPoint;
    private _connector;
    private _controls;
    private _isOrgType;
    constructor(controls: Controls, diagram: Diagram);
    getItemId(): string;
    getPoints(item: IItemConfig, size: any): any;
    _getConnectionPoints(points: any, scale: any): any;
    createConnector: (point: any) => void;
    setNearShape(shape: IItemConfig): void;
    toggleNearShape(shape: IItemConfig): void;
    removeNearShape(): void;
    moveConnector(_e: any, item: ILinkConfig, mov: any, p: any): void;
    onUp(): void;
    private _setNearPoint;
    private _removeNearPoint;
    private _findNearShape;
}
export declare function getConnectPoints(item: IItemConfig, grip: number): {
    dx: number;
    dy: number;
    x: number;
    y: number;
    id: string;
    side: string;
}[];
