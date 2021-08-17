import { Diagram } from "../../ts-diagram";
import { ISelectionBox } from "./types";
export declare class BlockSelection {
    private diagram;
    private _diagram;
    private _diagramSize;
    private _isOrgType;
    constructor(diagram: Diagram);
    updateSelection(selection: ISelectionBox, mode?: "add" | "remove" | "create"): void;
    clearSelection(): void;
    add(id: string): void;
    remove(id: string): void;
    getSelected(): string[];
    getCurrentCoordinates(event: MouseEvent, container: HTMLElement): {
        x: any;
        y: any;
        $rx: number;
        $ry: number;
    };
}
