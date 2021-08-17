import { VNode } from "../../../ts-common/dom";
import { IFlowShapeConfig, IOrgChartConfig, ICustomShapeConfig } from "../types";
export declare function getCircleTpl(config: IFlowShapeConfig | IOrgChartConfig | ICustomShapeConfig, index?: number): VNode;
export declare function getHeaderTpl(config: IOrgChartConfig): VNode;
export declare function getTextTemplate(config: IOrgChartConfig, content: any): VNode;
export declare function getShapeCss(config: IFlowShapeConfig): {
    [key: string]: string | number;
};
