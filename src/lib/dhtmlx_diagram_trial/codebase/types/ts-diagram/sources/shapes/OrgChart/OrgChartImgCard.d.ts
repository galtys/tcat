import { VNode } from "../../../../ts-common/dom";
import { OrgChartCard } from "./OrgChartCard";
import { IOrgChartConfig, IShape } from "../../types";
export declare class OrgChartImgCard extends OrgChartCard implements IShape {
    getMetaInfo(): any[];
    protected setDefaults(config: IOrgChartConfig, defaults?: IOrgChartConfig): IOrgChartConfig;
    protected getCss(): string;
    protected getContent(): VNode;
}
