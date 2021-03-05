module Snippets

import Printf
import Exchange
import DataStore

%access public export

{-
		    <!--
                    <td class="no-wrap"><a href=""><i class="fa fa-pencil pr-1"></i>Edit</a> | <a href=""><i class="fa fa-trash pr-1"></i>Delete</a></td>-->

                  <tr >
                    <td scope="row">YWORMME</td>
		    <td></td>
                    <td id="so1_qty" >3</td>
                    <td>Unit</td>
                    <td>STE20</td>
                    <td>118</td>
		    <td>0</td>
                  </tr>
-}
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

--table_card : TableID -> String
--table_card key = printf _table_card "SO440" (id_att key)
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
              
              <form>
              <table class="table table-sm table-hover table-info">
                <thead>
                    %s
                </thead>
                <tbody %s >
                </tbody>
                
              </table>
              <button type="submit" class="btn btn-primary">Submit</button>
              
              <div class="card-footer">
              <div/>
              </form>
            </div>
          </div>  <!-- /.card -->
            """
     ret = printf _tf "SO440" (schema2thead schema) (id_att key)



email_td : String
email_td = """
         <input type="number" class="form-control" placeholder="enter" value="43" >
"""

--     <div class="form-group">
--     </div>
TagID : Type
TagID = String

--InputTagType = TagInputNumber | TagInputText 
render_number_input_tag : TagID -> Integer ->  String
render_number_input_tag tagid val= printf """<td> <input type="number" class="form-control" placeholder="" id="%s" value="%d"> </td>""" tagid val

render_text_input_tag : TagID -> String ->  String
render_text_input_tag tagid val= printf """<td> <input type="text" class="form-control" placeholder="" id="%s" value="%s" > </td>""" tagid val

render_number_in_td_tag : Integer -> String
render_number_in_td_tag v = printf "<td>%d</td>" v

render_text_in_td_tag : String -> String
render_text_in_td_tag v = printf "<td>%s</td>" v

--renderDataWithSchema : (SchemaType schema) -> List (String,String)
--renderDataWithSchema {schema = (SString (FA name rw) )} item = [ (name,printf "%s" item)]
--renderDataWithSchema {schema = (SInt (FA name rw) )} item = [ (name,printf "%d" item)]
--renderDataWithSchema {schema = (y .+. z)} (iteml, itemr) = renderDataWithSchema iteml ++  renderDataWithSchema itemr



renderDataWithSchema2 : String -> (SchemaType schema) -> List String
renderDataWithSchema2 p_id  {schema = (SString (FA name True)  )} item = [ render_text_input_tag (concat [p_id,"|",name]) item ]
renderDataWithSchema2 p_id  {schema = (SString (FA name False)  )} item = [ render_text_in_td_tag item ]

renderDataWithSchema2 p_id  {schema = (SInt (FA name True) )} item = [ render_number_input_tag (concat [p_id, "|",name]) item ]
renderDataWithSchema2 p_id  {schema = (SInt (FA name False) )} item = [ render_number_in_td_tag item]

renderDataWithSchema2 p_id {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)

line2row : RowID -> OrderLine -> String
line2row Nothing key = ""
line2row (Just _rowid) x@(MkOrderLine k v)
     = let _items = renderDataWithSchema2 _rowid k 
           _line = concat [printf "%s" x | x <- _items] in
           printf "<tr>%s</td>" _line


{-
format_row : String
format_row = """<tr >  <td scope="row"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>"""


new_row : String -> RowID -> Integer -> Integer -> String --sku key qty price
new_row sku key qty price = case key of
          Nothing => printf format_row sku email_td "" qty _unit_dropdown price
          (Just _id) => printf format_row sku (render_number_input_tag "testKey") (id_att _id) qty "" price
-}

{-
line2row : RowID -> OrderLine -> String
line2row rowid (MkOrderLine (p1, p2, line, sku1, sku2, price_unit) qty) = new_row sku key q price where
      sku = i2s sku1
      key = rowid --Just (linekey2string lk)
      q = t2integer qty
      price = price_unit
-}

         
         --let new_qty = printf "%d" (t2integer v)
         --_items : List String

         
         --ret = 
         --items_with_parent_ids : List (String,String)
         --items_with_parent_ids = [ (]
         
