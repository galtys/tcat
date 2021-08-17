import { VNode } from "../../../../ts-common/dom";
import { BaseShape } from "../Base";
import { IOrgChartConfig, IShape } from "../../types";
export declare class OrgChartCard extends BaseShape implements IShape {
    config: IOrgChartConfig;
    constructor(config: IOrgChartConfig, parameters?: any);
    render(): VNode;
    getMetaInfo(): {
        [key: string]: string;
    }[];
    protected getCss(): string;
    protected setDefaults(config: IOrgChartConfig, defaults?: IOrgChartConfig): IOrgChartConfig;
    protected getContent(): any;
}
