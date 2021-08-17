import { IDataItem } from "../../ts-data";
import { diagramTypes, IAutoPlacement, IShapeToolbarConfig } from "../../ts-diagram";
export interface IEditorControls {
    apply?: boolean;
    reset?: boolean;
    export?: boolean;
    import?: boolean;
    autoLayout?: boolean;
    historyManager?: boolean;
    editManager?: boolean;
    scale?: boolean;
    gridStep?: boolean;
}
export declare type OrgToolbarTypes = "add" | "horizontal" | "vertical" | "remove";
export declare type MindmapToolbarTypes = "add" | "addLeft" | "addRight" | "remove";
export declare type RadialToolbarTypes = "add" | "remove";
export declare type DefaultToolbarTypes = "copy" | "connect" | "removePoint" | "remove";
export declare type OrgShapeToolbar = IShapeToolbarConfig[] | OrgToolbarTypes[] | boolean[] | (IShapeToolbarConfig | OrgToolbarTypes | boolean)[];
export declare type MindmapShapeToolbar = IShapeToolbarConfig[] | MindmapToolbarTypes[] | boolean[] | (IShapeToolbarConfig | MindmapToolbarTypes | boolean)[];
export declare type RadialShapeToolbar = IShapeToolbarConfig[] | RadialToolbarTypes[] | boolean[] | (IShapeToolbarConfig | RadialToolbarTypes | boolean)[];
export declare type DefaultShapeToolbar = IShapeToolbarConfig[] | DefaultToolbarTypes[] | boolean[] | (IShapeToolbarConfig | DefaultToolbarTypes | boolean)[];
export interface IEditorConfig {
    shapeType?: string;
    type?: diagramTypes;
    gridStep?: number;
    reservedWidth: number;
    editMode?: boolean;
    lineGap?: number;
    defaults?: any;
    scale?: number;
    controls?: IEditorControls;
}
export interface IOrgEditorConfig extends IEditorConfig {
    type: "org";
    shapeToolbar?: boolean | OrgShapeToolbar;
}
export interface IMindmapEditorConfig extends IEditorConfig {
    type: "mindmap";
    shapeToolbar?: boolean | MindmapShapeToolbar;
}
export interface IDefaultEditorConfig extends IEditorConfig {
    type: "default";
    autoplacement?: IAutoPlacement;
    shapeBarWidth?: number;
    shapeSections?: ISections;
    gapPreview?: string | number;
    scalePreview?: string | number;
    shapeToolbar: boolean | DefaultShapeToolbar;
}
export interface ISelectionBox {
    start: ICoords;
    end: ICoords;
}
export interface ISections {
    [key: string]: string[];
}
export interface ICoords {
    x: number;
    y: number;
}
export interface IDataHash {
    [id: string]: string | number | boolean;
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
export interface ISidebarConfig {
    showGridStep?: boolean;
}
export declare enum DiagramEditorEvents {
    resetButton = "resetbutton",
    applyButton = "applybutton",
    undoButton = "undoButton",
    redoButton = "redoButton",
    shapeMove = "shapemove",
    shapeResize = "shaperesize",
    zoomIn = "zoomin",
    zoomOut = "zoomout",
    visibility = "visibility",
    shapesUp = "shapesup",
    exportData = "exportData",
    importData = "importData",
    blockSelectionFinished = "blockSelectionFinished",
    blockSelectionAreaChanged = "blockSelectionAreaChanged",
    autoLayout = "autoLayout",
    changeGridStep = "changeGridStep",
    beforeShapeIconClick = "beforeShapeIconClick",
    afterShapeIconClick = "afterShapeIconClick",
    beforeShapeMove = "beforeShapeMove",
    afterShapeMove = "afterShapeMove"
}
export interface IDiagramEditorHandlersMap {
    [key: string]: (...args: any[]) => any;
    [DiagramEditorEvents.resetButton]: () => any;
    [DiagramEditorEvents.applyButton]: () => any;
    [DiagramEditorEvents.undoButton]: () => any;
    [DiagramEditorEvents.redoButton]: () => any;
    [DiagramEditorEvents.shapeMove]: () => any;
    [DiagramEditorEvents.shapeResize]: () => any;
    [DiagramEditorEvents.zoomIn]: () => any;
    [DiagramEditorEvents.zoomOut]: () => any;
    [DiagramEditorEvents.visibility]: () => any;
    [DiagramEditorEvents.exportData]: () => any;
    [DiagramEditorEvents.importData]: (data: any) => any;
    [DiagramEditorEvents.shapesUp]: (shape: any) => any;
    [DiagramEditorEvents.changeGridStep]: (step: number) => any;
    [DiagramEditorEvents.beforeShapeIconClick]: (iconId: string, shape: IDataItem) => boolean | void;
    [DiagramEditorEvents.afterShapeIconClick]: (iconId: string, shape: IDataItem) => void;
    [DiagramEditorEvents.beforeShapeMove]: (e: Event) => boolean | void;
    [DiagramEditorEvents.afterShapeMove]: (e: Event) => void;
}
