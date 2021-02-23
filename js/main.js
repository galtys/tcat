"use strict";

(function(){

const $JSRTS = {
    throw: function (x) {
        throw x;
    },
    Lazy: function (e) {
        this.js_idris_lazy_calc = e;
        this.js_idris_lazy_val = void 0;
    },
    force: function (x) {
        if (x === undefined || x.js_idris_lazy_calc === undefined) {
            return x
        } else {
            if (x.js_idris_lazy_val === undefined) {
                x.js_idris_lazy_val = x.js_idris_lazy_calc()
            }
            return x.js_idris_lazy_val
        }
    },
    prim_strSubstr: function (offset, len, str) {
        return str.substr(Math.max(0, offset), Math.max(0, len))
    }
};
$JSRTS.prim_systemInfo = function (index) {
    switch (index) {
        case 0:
            return "javascript";
        case 1:
            return navigator.platform;
    }
    return "";
};

$JSRTS.prim_writeStr = function (x) { return console.log(x) };

$JSRTS.prim_readStr = function () { return prompt('Prelude.getLine') };

$JSRTS.die = function (message) { throw new Error(message) };




const $HC_0_0$TheWorld = ({type: 0});
// Main.console_log

function Main__console_95_log($_0_x, $_1_w){
    return (console_log);
}

// Main.get_qty

function Main__get_95_qty($_0_x, $_1_w){
    return (get_qty(($_0_x)));
}

// Main.main

function Main__main($_0_in){
    const $_1_in = Main__get_95_qty("so1_qty", $_0_in);
    const $_2_in = Main__update_95_qty("so3_qty", $_1_in, $_0_in);
    return Main__console_95_log("hotovo", $_0_in);
}

// Main.update_qty

function Main__update_95_qty($_0_x, $_1_x1, $_2_w){
    return (update_qty(($_0_x),($_1_x1)));
}

// {runMain_0}

function $_0_runMain(){
    return $JSRTS.force(Main__main($HC_0_0$TheWorld));
}


$_0_runMain();
}.call(this))