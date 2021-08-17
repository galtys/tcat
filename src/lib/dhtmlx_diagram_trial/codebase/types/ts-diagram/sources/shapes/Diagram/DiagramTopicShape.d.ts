import { VNode } from "../../../../ts-common/dom";
import { ShapesCollection } from "../../../../ts-diagram";
import { IShape } from "../../types";
import { BaseShape } from "../Base";
export declare class DiagramTopicShape extends BaseShape implements IShape {
    config: any;
    data: ShapesCollection;
    private _oldText;
    constructor(config: any, parameters?: any);
    render(): VNode;
    getMetaInfo(): {
        [key: string]: string;
    }[];
    protected setDefaults(config: any, defaults: any): any;
}
