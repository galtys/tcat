import { VNode } from "../../../../ts-common/dom";
import { IDiagramCustomShape, ICustomShapeConfig } from "../../types";
import { BaseShape } from "../Base";
export declare class DiagramCustomShape extends BaseShape implements IDiagramCustomShape {
    config: ICustomShapeConfig;
    shapes: any;
    private _properties;
    constructor(config: ICustomShapeConfig, parameters?: any);
    getMetaInfo(): {
        [key: string]: string;
    }[];
    render(): VNode;
    protected setDefaults(config: ICustomShapeConfig, defaults?: ICustomShapeConfig): ICustomShapeConfig;
    private _getMetaInfoStructure;
    private _getBaseMetaInfoStructure;
    private _getCustomContent;
    private _normalizeConfigText;
    private _getShapeFromFunction;
}
