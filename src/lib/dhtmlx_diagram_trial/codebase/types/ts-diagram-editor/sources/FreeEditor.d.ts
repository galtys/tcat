import { IItemConfig } from "../../ts-diagram";
import { BaseDiagramEditor } from "./BaseDiagramEditor";
import { IDefaultEditorConfig } from "./types";
export declare class FreeEditor extends BaseDiagramEditor {
    config: IDefaultEditorConfig;
    private _changeMode;
    private _shapesBar;
    private _copiedShapes;
    protected _initDiagram(): void;
    protected _initUI(container: any): void;
    protected _showConnectPoints(id: string, toggle?: boolean): void;
    protected _setHandlers(): void;
    protected _copyShape(): void;
    protected _pasteShape(): void;
    protected _findNearestConnector(e: MouseEvent): void;
    protected _initHotkeys(): void;
    protected _addShape(shape: IItemConfig, x?: number, y?: number): void;
}
