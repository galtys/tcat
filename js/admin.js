console.log('admin.js loaded');


//function add_row(key, row) {  //key = "so_table1"
//    var x=document.getElementById(key);
//    x.insertAdjacentHTML('beforeend',row);
//}

function insert_adjancent_html(key,position,row) {
    var x=document.getElementById(key);
    x.insertAdjacentHTML(position,row);
}


function _parse_int_pair_int(x) {
    var integer = parseInt(x,10);
    
    if (isNaN(integer)) {
	return [0,0];
    } else {
        return [1,o];
    }
}

function _get_fst_pair_int(x) {
    return x[0];
}

function _get_snd_pair_int(x) {
    return x[1];
}


function update_qty(key, value) {
  //document.getElementById("so2_qty").innerText=77;

  document.getElementById(key).innerText=value;
}
function get_qty(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
      return e.innerText
    }
}

function update_element_text(key,text) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
	e.innerText = text;
    }
}

function get_element_text(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
	return e.innerText;
    }
}

function get_qty_int_value2(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.value;
	var v = parseInt(av,10);
	if (isNaN(v)) {
	    return 0;
	} else {
	    return v;
	}
    }
}

function get_qty_int(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var a = parseInt(e.innerText,10);
	if (isNaN(a)) {
            return 0;
	} else {
	    return a;
	}
    }
}

function remove_row(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	p = e.parentNode
	p.parentNode.removeChild(p)
	return 1;
    }
}

function get_qty_int_flag(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var a = parseInt(e.innerText,10);
	if (isNaN(a)) {
            return 0;
	} else {
	    return 1;
	}
    }
}


function console_log(msg) {
    console.log(msg);
}

//call_js_ptr = foreign FFI_JS "call_js_ptr(%0)" (Ptr -> JS_IO () )

function call_js_ptr(pev) {
    //console.log(pev)
    var a = parseInt(pev.target.value,10);
    return a
}


function calc_sha1(msg) {
   var md1 = forge.md.sha1.create();
   md1.update(msg);
   return md1.digest().toHex();
}

function calc_sha256(msg) {
   var md1 = forge.md.sha256.create();
   md1.update(msg);
   return md1.digest().toHex();
}

/* Adds a click event listener */
function onClick(selector, callback) {
    document.querySelector(selector).addEventListener('click', callback);
}

function onInput(selector, callback) {
    document.querySelector(selector).addEventListener('input', callback);
}


/* Does something on init event */
function onInit(callback) {
    document.addEventListener('init', callback);
}


function toggle_hide_snow_element(element_id) {
    var x = document.getElementById(element_id)
    if (x.style.display === "none") {
	x.style.display = "block";
    } else {
	x.style.display = "none";
    }
}



/*
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
 //0   xmlHttp.send( null );
    return xmlHttp.responseText;
}
*/

//var md = forge.md.sha1.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());


//var md = forge.md.sha256.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());
