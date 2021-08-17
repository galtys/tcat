import { BaseDiagramEditor } from "./BaseDiagramEditor";
import { IMindmapEditorConfig, IOrgEditorConfig } from "./types";
export declare class OrgChartEditor extends BaseDiagramEditor {
    config: IOrgEditorConfig | IMindmapEditorConfig;
    protected _setHandlers(): void;
    protected _initDiagram(): void;
    protected _initUI(container: any): void;
    protected _initHotkeys(): void;
    protected _getDefaults(): {
        text: {
            text: string;
        };
    };
}
