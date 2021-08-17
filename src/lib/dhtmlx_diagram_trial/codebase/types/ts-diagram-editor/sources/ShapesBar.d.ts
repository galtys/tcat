import { View } from "../../ts-common/view";
export declare class ShapesBar extends View {
    private _htmlEvents;
    private _pressedShapeInfo;
    private _shadow;
    private _dropdowns;
    private _shapes;
    private _defaults;
    constructor(container: any, config: any);
    private _handleMove;
    private _handleUp;
    private _getShadow;
    private _getWrapped;
    private _getShapeDataDefaults;
    private _toggle;
    private _getTextShape;
    private _wrapDropdown;
    private _shapeInit;
    private _barCreator;
    private _render;
}
