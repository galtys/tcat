import { ICoords } from "../../ts-diagram/sources/types";
export declare class SelectionBox {
    start: ICoords;
    end: ICoords;
    constructor(start: ICoords);
    render(): any;
    isValid(): boolean;
}
