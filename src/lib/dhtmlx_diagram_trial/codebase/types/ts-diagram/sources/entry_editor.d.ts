export { awaitRedraw } from "../../ts-common/dom";
export { Diagram } from "./Diagram";
import "../../styles/diagram-editor.scss";
export { DataCollection } from "../../ts-data";
import { IEditorConfig } from "../../ts-diagram-editor";
export { shapes as DiagramShapes } from "./shapes/factory";
export declare const i18n: any;
export declare class DiagramEditor {
    constructor(container: string | HTMLElement, config?: IEditorConfig);
}
