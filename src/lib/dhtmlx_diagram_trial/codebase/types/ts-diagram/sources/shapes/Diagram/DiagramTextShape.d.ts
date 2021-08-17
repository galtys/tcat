import { VNode } from "../../../../ts-common/dom";
import { ShapesCollection } from "../../../../ts-diagram";
import { IFlowShapeTextConfig, IShape } from "../../types";
import { BaseShape } from "../Base";
export declare class DiagramTextShape extends BaseShape implements IShape {
    config: IFlowShapeTextConfig;
    data: ShapesCollection;
    private _oldText;
    constructor(config: IFlowShapeTextConfig, parameters?: any);
    render(): VNode;
    getMetaInfo(): {
        [key: string]: string;
    }[];
    protected setDefaults(config: IFlowShapeTextConfig, defaults: IFlowShapeTextConfig): IFlowShapeTextConfig;
    protected getContent(): VNode;
}
