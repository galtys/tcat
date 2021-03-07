module Snippets

import Printf
import Exchange
import DataStore

%access public export

js1 : String
js1 =  """{
  "key1": [11,89],
  "key2": {
      "key2.1": true,
      "key2.2": {
        "key2.2.1": "bar",
        "key2.2.2": 200
      }
    }
  }"""

_unit_dropdown : String
_unit_dropdown = """
   <div class="dropdown">
       <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Unit</button>
       <div class="dropdown-menu" aria-labelledby="dropdown">
           <a class="dropdown-item" href="#">Unit</a>
           <a class="dropdown-item" href="#">m^2</a>
       </div>  
   </div>
"""

TableID : Type
TableID = String

RowID : Type
RowID = Maybe String

id_att_format : String
id_att_format = """ id="%s" """

id_att : String -> String
id_att x = printf id_att_format x

schema2thead : Schema -> String
schema2thead sch = ret where
  schema2th : Schema -> List String
  schema2th (SString (FA name rw) ) = [ printf "<th>%s</th>" name ]
  schema2th (SInt (FA name rw) ) = [printf "<th>%s</th>" name ]
  schema2th (s1 .+. s2) = (schema2th s1) ++ (schema2th s2)
  ths : String
  ths = concat $ schema2th sch
  ret = printf "<tr>%s</tr>" ths

table_card : TableID -> Schema -> String
table_card key schema = ret where
     _tf : String
     _tf = """
          <!-- Content Edit Table -->
          <div class="card border-dark  mt-3">
              <div class="card-header">
              <h4>%s</h4>
              </div>
            <div class="card-body">
              <!--
              <form>
              </form>
              -->
              <table class="table table-sm table-hover table-info">
                <thead>
                    %s
                </thead>
                <tbody %s >
                </tbody>
                
              </table>
              <button class="btn btn-primary" id="table_card_button">ClickMe</button>
              
              <div class="card-footer">
              <div/>
              
            </div>
          </div>  <!-- /.card -->
            """
     ret = printf _tf "SO440" (schema2thead schema) (id_att key)

display_as_key : (SchemaType schema) -> String
display_as_key {schema = (SString (FA s1 rw) ) } item = s1++":"++item
display_as_key {schema = (SInt    (FA s2 rw) ) } item = s2++":"++(show item)
display_as_key {schema = (y .+. z)} (iteml, itemr) = display_as_key iteml ++ "_" ++
                                              display_as_key itemr

{-
test_val : (SchemaType OrderLineKey1)
test_val = (1,7,1,"1",100,188)

test_key : String
test_key = display_as_key  test_val
-}

TagID : Type
TagID = String

render_number_input_tag : TagID -> Integer ->  String
render_number_input_tag tagid val= printf """<td> <input type="number" class="form-control" id="%s" value="%d"> </td>""" tagid val

render_text_input_tag : TagID -> String ->  String
render_text_input_tag tagid val= printf """<td> <input type="text" class="form-control" id="%s" value="%s" > </td>""" tagid val

render_number_in_td_tag : Integer -> String
render_number_in_td_tag v = printf "<td>%d</td>" v

render_text_in_td_tag : String -> String
render_text_in_td_tag v = printf "<td>%s</td>" v

renderDataWithSchema2 : String -> (SchemaType schema) -> List String
renderDataWithSchema2 p_id  {schema = (SString (FA name True)  )} item = [ render_text_input_tag (concat [p_id,"__",name]) item ]
renderDataWithSchema2 p_id  {schema = (SString (FA name False)  )} item = [ render_text_in_td_tag item ]

renderDataWithSchema2 p_id  {schema = (SInt (FA name True) )} item = [ render_number_input_tag (concat [p_id, "__",name]) item ]
renderDataWithSchema2 p_id  {schema = (SInt (FA name False) )} item = [ render_number_in_td_tag item]

renderDataWithSchema2 p_id {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)

line2row : RowID -> OrderLine -> String
line2row Nothing key = ""
line2row (Just _rowid) x@(MkOrderLine k v)
     = let _items = renderDataWithSchema2 _rowid k 
           _qty = (t2integer v)
           _qty_item = render_number_input_tag (concat [_rowid, "__Qty"]) _qty
           _line = concat [printf "%s" x | x <- _items ++ [_qty_item] ] in
           printf "<tr>%s</tr>" _line


