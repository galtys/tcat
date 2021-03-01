console.log('admin.js loaded');


//function add_row(key, row) {  //key = "so_table1"
//    var x=document.getElementById(key);
//    x.insertAdjacentHTML('beforeend',row);
//}

function insert_adjancent_html(key,position,row) {
    var x=document.getElementById(key);
    x.insertAdjacentHTML(position,row);
}


function update_qty(key, value) {
  //document.getElementById("so2_qty").innerText=77;

  document.getElementById(key).innerText=value;
}
function get_qty(key) {
    return parseInt(document.getElementById(key).innerText,10);
}

function console_log(msg) {
    console.log(msg);
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

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
 //0   xmlHttp.send( null );
    return xmlHttp.responseText;
}

//var md = forge.md.sha1.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());


//var md = forge.md.sha256.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());
