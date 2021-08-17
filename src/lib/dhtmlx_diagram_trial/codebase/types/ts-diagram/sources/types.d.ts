export { SelectionEvents } from "../../ts-common/types";
export { DataEvents } from "../../ts-data";
import { VNode } from "../../ts-common/dom";
import { IDataConfig } from "../../ts-data";
import { BaseShape } from "../sources/shapes/Base";
export interface IShapeCollectionConfig extends IDataConfig {
    type: "org" | "mindmap" | "default";
}
declare type textAlign = "left" | "center" | "right";
declare type textVerticalAlign = "top" | "center" | "bottom";
declare type strokeType = "line" | "dash" | any;
declare type arrows = "filled" | any;
declare type connectType = "straight" | "flex" | "elbow" | "curved";
declare type fontStyle = "normal" | "italic" | "oblique";
declare type customShapeText = string | ICustomShapeText | string[] | any;
interface ICustomShapeText {
    [type: string]: string;
}
export declare type orgTypes = "org" | "mindmap";
export declare type diagramTypes = orgTypes | "default";
export declare type dirTypes = "vertical" | "verticalLeft" | "verticalRight";
export interface IShapeMap {
    [type: string]: typeof BaseShape;
}
export interface IPreview {
    img?: string;
    scale?: number;
    width?: number | string;
    height?: number | string;
    gap?: number | string;
}
export interface IBaseShapeConfig {
    id?: string;
    type?: string;
    css?: string;
    height?: number;
    width?: number;
    angle?: number;
    dir?: dirTypes;
    from?: string;
    to?: string;
    parent?: string;
    points?: ICoords[];
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    hidden?: boolean;
    open?: boolean;
    openDir?: {
        left?: boolean;
        right?: boolean;
    };
    preview?: string | IPreview;
    $count?: number;
    $kids?: any[];
    $selected?: boolean;
    $blockSelected?: boolean;
    $expandColor?: string;
    $parent?: string;
    $shape?: IShape;
    $move?: boolean;
    $connectMode?: boolean;
    $level?: number;
}
export interface IFlowShapeConfig extends IBaseShapeConfig {
    fill?: string;
    text?: string;
    fontColor?: string;
    fontStyle?: fontStyle;
    fontWeight?: string;
    fontSize?: number;
    textAlign?: textAlign;
    textVerticalAlign?: textVerticalAlign;
    lineHeight?: number;
    stroke?: string;
    extraLinesStroke?: string;
    strokeWidth?: number;
    strokeType?: strokeType;
    strokeDash?: string;
}
export interface ICustomShapeConfig extends IFlowShapeConfig {
    title?: string;
    text?: customShapeText;
    img?: string;
}
export interface IFlowShapeTextConfig extends IBaseShapeConfig {
    backgroundColor?: string;
    text?: string;
    fontColor?: string;
    fontStyle?: fontStyle;
    fontWeight?: string;
    fontSize?: number;
    lineHeight?: number;
    textAlign?: textAlign;
    textVerticalAlign?: textVerticalAlign;
}
export interface IOrgChartConfig extends IBaseShapeConfig {
    title?: string;
    text?: string;
    img?: string;
    headerColor?: string;
    parent?: string;
}
export declare type IItemConfig = IFlowShapeConfig & IOrgChartConfig & IFlowShapeTextConfig & ICustomShapeConfig;
export declare type IShapeSide = "top" | "bottom" | "right" | "left" | "center" | string;
export interface ILinkConfig extends IBaseShapeConfig {
    type?: strokeType;
    arrow?: string;
    backArrow?: arrows;
    forwardArrow?: arrows;
    fromSide?: IShapeSide;
    toSide?: IShapeSide;
    cornersRadius?: number;
    connectType?: connectType;
    strokeWidth?: number;
    strokeType?: strokeType;
    stroke?: string;
    $selectedPoint?: string;
    customGap?: number;
}
export interface IShapeToolbarConfig {
    content: string | VNode;
    id: string;
    check?: Function;
    css?: Function;
}
export interface IDiagramMargin {
    x?: number;
    y?: number;
    itemX?: number;
    itemY?: number;
}
export interface IDefaultShapeConfig {
    [type: string]: IItemConfig;
}
export interface IAutoPlacement {
    itemPadding?: number;
    levelPadding?: number;
    wide?: string;
    direction?: string;
    graphPadding?: number;
    mode?: "direct" | "edges";
    root: string;
}
export declare type TreeDir = "right" | "left";
export interface IMindMapConfig {
    direction?: "left" | "right" | "reverse";
    side?: {
        left?: string[];
        right?: string[];
    };
}
export interface IDiagramConfig {
    type?: diagramTypes;
    typeConfig?: IMindMapConfig;
    defaultShapeType?: string;
    defaultLinkType?: string;
    margin?: IDiagramMargin;
    toolbar?: IShapeToolbarConfig[];
    defaults?: IDefaultShapeConfig;
    properties?: {
        [key: string]: string;
    }[];
    select?: boolean;
    scale?: number;
    scroll?: boolean;
    dragMode?: boolean;
    showGrid?: boolean;
    gridStep?: number;
    lineGap?: number;
    autoplacement?: IAutoPlacement;
    exportStyles?: boolean | string[];
    $svg?: any;
}
export interface IBoxSize {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
export interface IShape {
    config: IItemConfig;
    id: string | number;
    move(x: number, y: number): void;
    resize(width: number, height: number): void;
    rotate(angle: number): void;
    update(config: IItemConfig): void;
    render(): string;
    getPoint(x: number, y: number): ICoords;
    getCenter(): ICoords;
    setCss(value: string): void;
    getMetaInfo(): any[];
    isConnector(): boolean;
    getBox(): IBoxSize;
    canResize(): boolean;
}
export interface IDiagramCustomShape extends IShape {
    shapes?: any;
}
export interface ICoords {
    x: number;
    y: number;
    side?: string;
    $custom?: boolean;
    $rx?: number;
    $ry?: number;
}
export declare type FilterHandler = (item: IItemConfig) => boolean;
export interface IDiagram {
    config: IDiagramConfig;
    paint(): any;
    locate(event: Event): IShape;
    collapseItem(id: string, dir?: TreeDir): void;
    expandItem(id: string, dir?: TreeDir): void;
    getScrollState(): ICoords;
    scrollTo(x: number, y: number): void;
    showItem(id: string): void;
    addShape(type: string, parameters: ICustomShapeParam): void;
    autoPlace(config?: IAutoPlacement): void;
}
export interface ICustomShapeParam {
    defaults?: IItemConfig;
    properties?: any[];
    template(config: ICustomShapeConfig): string;
    eventHandlers?: {
        [key: string]: any;
    };
}
export interface IContent {
    shapes?: string;
    width?: number;
    height?: number;
    minX?: number;
    minY?: number;
    gap?: number;
    container?: any;
    root?: string;
    scroll?: any;
}
export interface IContentSize {
    x: number;
    y: number;
    left: number;
    top: number;
    scale: number;
}
export declare type SelectShape = (item: IItemConfig) => boolean;
export declare type ActionShape = (item: IItemConfig) => void;
export declare enum DiagramEvents {
    scroll = "scroll",
    beforeCollapse = "beforecollapse",
    afterCollapse = "aftercollapse",
    beforeExpand = "beforeexpand",
    afterExpand = "afterexpand",
    shapeMouseDown = "shapemousedown",
    shapeClick = "shapeclick",
    shapedDblClick = "shapedblclick",
    shapeIconClick = "shapeiconclick",
    beforeRender = "beforerender",
    shapeHover = "shapeHover",
    emptyAreaClick = "emptyAreaClick",
    emptyAreaMouseDown = "emptyAreaMouseDown",
    lineClick = "lineClick"
}
export interface IDiagramEventHandlersMap {
    [key: string]: (...args: any[]) => any;
    [DiagramEvents.scroll]: (position: ICoords) => any;
    [DiagramEvents.beforeCollapse]: (id: string, dir?: TreeDir) => any;
    [DiagramEvents.afterCollapse]: (id: string, dir?: TreeDir) => any;
    [DiagramEvents.beforeExpand]: (id: string, dir?: TreeDir) => any;
    [DiagramEvents.afterExpand]: (id: string, dir?: TreeDir) => any;
    [DiagramEvents.shapeMouseDown]: (id: string, events: MouseEvent, position?: ICoords) => any;
    [DiagramEvents.shapeClick]: (id: string, events: MouseEvent) => any;
    [DiagramEvents.shapedDblClick]: (id: string, events: MouseEvent) => any;
    [DiagramEvents.shapeIconClick]: (id: string, events: MouseEvent) => any;
    [DiagramEvents.beforeRender]: (size: IContentSize) => any;
    [DiagramEvents.shapeHover]: (id: string, events: MouseEvent) => any;
    [DiagramEvents.emptyAreaClick]: (events: MouseEvent) => any;
    [DiagramEvents.lineClick]: (id: string, events: MouseEvent) => any;
}
