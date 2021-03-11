module Snippets2

import Printf
import DataStore
import JSIO

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

public export
schema2thead2 : Schema2 -> String
schema2thead2 sch = ret where
  schema2th : Schema2 -> List String
  schema2th (IField name FBool)  =  [printf "<th>%s</th>" name ]
  schema2th (IField name FString) = [printf "<th>%s</th>" name ]
  schema2th (IField name FTterm ) = [printf "<th>%s</th>" name ]     --SchemaType2 (IField name FTterm ) = Tterm
  schema2th (EField name ns) = [printf "<th>%s[%s]</th>" name ns]
  schema2th (s1 .|. s2) = (schema2th s1) ++ (schema2th s2)
  ths : String
  ths = concat $ schema2th sch
  ret = printf "<tr>%s</tr>" ths

public export
TagID : Type
TagID = String

public export
render_number_input_tag : TagID -> Integer ->  String
render_number_input_tag tagid val= printf """<td> <input type="number" class="form-control" id="%s" value="%d"> </td>""" tagid val

public export
render_text_input_tag : TagID -> String ->  String
render_text_input_tag tagid val= printf """<td> <input type="text" class="form-control" id="%s" value="%s" > </td>""" tagid val


-- using td tags
public export
render_number_in_td_tag : Integer -> String
render_number_in_td_tag v = printf "<td>%d</td>" v

public export
render_text_in_td_tag : String -> String
render_text_in_td_tag v = printf "<td>%s</td>" v

public export
renderDataWithSchema2Edit : String -> (SchemaType2 schema) -> List String
renderDataWithSchema2Edit p_id  {schema = (IField name FBool)} True = [render_text_in_td_tag "True"]
renderDataWithSchema2Edit p_id  {schema = (IField name FBool)} False = [render_text_in_td_tag "False"]
renderDataWithSchema2Edit p_id  {schema = (IField name FString)} item = [render_text_input_tag (concat [p_id, "__",name]) item] --render_text_in_td_tag item
renderDataWithSchema2Edit p_id  {schema = (IField name FTterm)} item = [render_number_input_tag (concat [p_id, "__",name]) (t2integer item)]
renderDataWithSchema2Edit p_id  {schema = (EField name ns)} item = [render_number_input_tag (concat [p_id, "__",name]) (item)]
renderDataWithSchema2Edit p_id {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2Edit p_id iteml) ++ (renderDataWithSchema2Edit p_id itemr)

-- using td tags
public export
render_number_in_td_tag2 : String -> Integer -> String
render_number_in_td_tag2 p_id v = printf """<td id="%s">%d</td>""" p_id v

public export
render_text_in_td_tag2 : String -> String -> String
render_text_in_td_tag2 p_id v   = printf   """<td id="%s">%s</td>""" p_id v

public export
renderDataWithSchema2 : String -> (SchemaType2 schema) -> List String
renderDataWithSchema2 p_id {schema = (IField name FBool)} True = [ render_text_in_td_tag2 (p_id ++ "_"++name) "True"]
renderDataWithSchema2 p_id {schema = (IField name FBool)} False = [render_text_in_td_tag2 (p_id ++ "_"++name) "False" ]
renderDataWithSchema2 p_id {schema = (IField name FString)} item = [render_text_in_td_tag2 (p_id ++ "_"++name) item]
renderDataWithSchema2 p_id {schema = (IField name FTterm)} item = [render_number_in_td_tag2 (p_id ++ "_"++name) (t2integer item)]
renderDataWithSchema2 p_id {schema = (EField name ns)} item = [render_number_in_td_tag2 (p_id ++ "_"++name) item]
renderDataWithSchema2 p_id {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)

public export
renderDataAsKey : (SchemaType2 schema) -> String
renderDataAsKey {schema = (IField name FBool)} True = "True"
renderDataAsKey {schema = (IField name FBool)} False = "False"
renderDataAsKey {schema = (IField name FString)} item = item
renderDataAsKey {schema = (IField name FTterm)} item = the String (cast (t2integer item))
renderDataAsKey {schema = (EField name ns)} item = the String (cast item)
renderDataAsKey {schema = (y .|. z)} (iteml, itemr) = (renderDataAsKey iteml) ++ (renderDataAsKey itemr)

namespace tab_widget
   public export
   id_att_format : String
   id_att_format = """ id="%s" """
   
   public export
   id_att : String -> String
   id_att x = printf id_att_format x
   public export
   _composite : String
   _composite = """
          <div id="%s" class="sticky-top">
	  </div>   
   """
   
   public export
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
              <table class="table table-sm table-hover">
                <thead>
                    %s
                </thead>
                <tbody %s>   <!-- id =is not in the template  because it will be used for amendments too -->
                </tbody>
              </table>
            </div>
              
            <div class="card-footer">
                   <button class="btn btn-primary" id="table_card_edit">Edit</button>
            <div/>
              
            </div>
          </div>  <!-- /.card -->
            """
   public export 
   get_composite_id : String -> (m:ModelSchema) -> (ModelDataList m) -> String
   get_composite_id p_id m y = (p_id ++ "__" ++ (name y))
      
   public export
   get_table_id : String ->  String  --this is to reference the table body
   get_table_id p_id  = ( p_id  ++ "__composite_table" )
   
   public export
   _lines2io : String -> List String -> JS_IO ()
   _lines2io p_id [] = pure ()
   _lines2io p_id (x::xs) = do
      insert_beforeend p_id x
      _lines2io p_id xs

   public export
   get_row_id : String -> (SchemaType2 schema) -> String
   get_row_id p_id  item = p_id++ "_row"++(renderDataAsKey item)

   public export
   insert_rows : String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   insert_rows p_id m mdl = do
      let row_ids = [ (get_row_id p_id x) | x <- (keyL mdl)]
      
      let row_k = [ concat (renderDataWithSchema2 (snd x) (fst x))  | x <-zip (keyL mdl) row_ids]
      let row_v = [ concat (renderDataWithSchema2 (snd x) (fst x))  | x <-zip (valL mdl) row_ids]
      
                  
      let rows_zip = zip row_k row_v
      let rows_ids_zip = zip row_ids rows_zip
      let rows_tr = [ (printf "<tr id=%s>%s %s</tr>" rid k v) | (rid,(k,v)) <- rows_ids_zip]
      
      _lines2io p_id rows_tr
      pure ()
         
   public export  --main init
   table_card2 : String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   table_card2 parent_tag_id m mdl = do
      let schema_header = (key m) .|. (val m)
      
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id
      
      let _composite_html = ( printf _composite _composite_id )
      
      let _th_html = printf _tf (name mdl) (schema2thead2 schema_header ) (id_att _composite_table_id )
            
      insert_beforeend parent_tag_id _composite_html
      insert_beforeend _composite_id "<h2>Order</h2>"
      insert_beforeend _composite_id _th_html  --(table_card table_composite_id THeader)  
      insert_rows _composite_table_id m mdl
