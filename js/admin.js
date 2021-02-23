
var new_row = '<tr >  <td scope="row">AB</td>   <td></td> <td id="so4_qty" >1</td>  <td>Unit</td> <td>STE20</td> <td>188</td> <td>0</td>   <td></td>  </tr>'

console.log('admin.js loaded');

document.getElementById("so2_qty").innerText=77;

var x=document.getElementById("so_table1")

x.insertAdjacentHTML('beforeend',new_row)

function update_qty(key, value) {
  document.getElementById(key).innerText=value;
}
function get_qty(key) {
  return document.getElementById(key).innerText
}

function console_log(msg) {
    console.log(msg)
}

var md = forge.md.sha1.create();
md.update('The quick brown fox jumps over the lazy dog');
console.log(md.digest().toHex());


var md = forge.md.sha256.create();
md.update('The quick brown fox jumps over the lazy dog');
console.log(md.digest().toHex());
