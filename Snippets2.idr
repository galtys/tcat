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
render_number_input : String -> Integer ->  String
render_number_input c_id val= printf """<input type="number" class="form-control" value="%d" id="%s">""" val c_id

-- using td tags
public export
render_number_in_td_tag2 : String -> Integer -> String
render_number_in_td_tag2 p_id v = printf   """<td id="%s" dataval="%d">%d</td>""" p_id v v

--public export
--render_number_in_td_tag2 : String -> Integer -> String
--render_number_in_td_tag2 p_id v = printf   """<td id="%s" data-val="%d">%d</td>""" p_id v v

public export
render_text_in_td_tag2 : String -> String -> String
render_text_in_td_tag2 p_id v   = printf   """<td id="%s" dataval="%s">%s</td>""" p_id v v
 
public export
render_tterm_in_td_tag2 : String -> Tterm -> String
render_tterm_in_td_tag2 p_id v = printf """<td id="%s" datadr="%d" datacr="%d">%d</td>""" p_id (dr v) (cr v) (t2integer v)

public export
cell_id : String -> String -> String
cell_id p_id name = p_id ++ "_"++name

public export
cell_input_id : String -> String -> String
cell_input_id p_id name = (cell_id p_id name) ++ "_input_tag"

public export
renderDataWithSchema2 : String -> (SchemaType2 schema) -> List String
renderDataWithSchema2 p_id {schema = (IField name FBool)}   True  = [render_text_in_td_tag2   (cell_id p_id name) "True"]
renderDataWithSchema2 p_id {schema = (IField name FBool)}   False = [render_text_in_td_tag2   (cell_id p_id name) "False"]
renderDataWithSchema2 p_id {schema = (IField name FString)} item  = [render_text_in_td_tag2   (cell_id p_id name) item]
renderDataWithSchema2 p_id {schema = (IField name FTterm)}  item  = [render_tterm_in_td_tag2  (cell_id p_id name) item]
renderDataWithSchema2 p_id {schema = (EField name ns)}      item  = [render_number_in_td_tag2 (cell_id p_id name) item]
renderDataWithSchema2 p_id {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)

public export
get_cell_keys : String -> (s:Schema2) -> List String
get_cell_keys p_id (IField name fd)  = [cell_id p_id name]
get_cell_keys p_id (EField name fd)  = [cell_id p_id name]
get_cell_keys p_id (y .|. z)  = (get_cell_keys p_id y) ++ (get_cell_keys p_id z)

public export
make_cells_editable : String -> (s:Schema2) -> JS_IO ()
make_cells_editable p_id (IField name FTterm)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   qty <- get_qty_int _cell_id
                   let input_element = render_number_input _cell_input_id (the Integer (cast qty)) 
                   update_element_text (cell_id p_id name) "" --console_log (printf "row: %s, field: %s" p_id name)
                   insert_beforeend _cell_id input_element
make_cells_editable p_id (IField name fd)  = pure () --console_log (printf "row: %s, field: %s" p_id name)
make_cells_editable p_id (EField name fd)  = pure () --console_log (printf "row: %s, field: %s" p_id name)
make_cells_editable p_id (y .|. z)  = do 
                                    make_cells_editable p_id y
                                    make_cells_editable p_id z

public export
make_cells_ro : String -> (s:Schema2) -> JS_IO ()
make_cells_ro p_id (IField name FTterm)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   -- need to get into the input tag
                   qty <- get_qty_int_value2 _cell_input_id
                   update_element_text (cell_id p_id name) "" --console_log (printf "row: %s, field: %s" p_id name)
                   update_element_text (cell_id p_id name)  (the String (cast qty))

make_cells_ro p_id (IField name fd)  = pure ()
make_cells_ro p_id (EField name fd)  = pure ()-- console_log (printf "row: %s, field: %s" p_id name)
make_cells_ro p_id (y .|. z)  = do 
                                    make_cells_ro p_id y
                                    make_cells_ro p_id z



public export
read_cells : String -> (s:Schema2) -> JS_IO (SchemaType2 s)
read_cells p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_text_data_val _cell_id
                   pure (if (v=="True") then True else False)
read_cells p_id (IField name FString) = do
                   let _cell_id = cell_id p_id name                                      
                   v <- get_element_text _cell_id
                   pure v
read_cells p_id (IField name FTterm)  = do
                   let _cell_id = cell_id p_id name
                   qty <- get_qty_int _cell_id
                   let qty_integer = the Integer (cast qty)
                   pure (integer2t qty_integer)
read_cells p_id (EField name ns)  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int _cell_id
                   let qty_integer = the Integer (cast v)                   
                   pure qty_integer
read_cells p_id (y .|. z)  =  do
                   r_y <- read_cells p_id y
                   r_z <- read_cells p_id z
                   pure (r_y,r_z)


-- td: data-val  or data-dr/data-cr
public export
read_cells_attr : String -> (s:Schema2) -> JS_IO (SchemaType2 s)
read_cells_attr p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_text_data_val _cell_id
                   pure (if (v=="True") then True else False)
read_cells_attr p_id (IField name FString) = do
                   let _cell_id = cell_id p_id name                                      
                   v <- get_element_text _cell_id
                   pure v
read_cells_attr p_id (IField name FTterm)  = do
                   let _cell_input_id = cell_input_id p_id name
                   dr <- get_qty_int_data_dr _cell_input_id
                   cr <- get_qty_int_data_cr _cell_input_id                   
                   let dr_integer = the Integer (cast dr)
                   let cr_integer = the Integer (cast cr)
                   pure (Tt dr_integer cr_integer)
                   
read_cells_attr p_id (EField name ns)  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int _cell_id
                   let qty_integer = the Integer (cast v)                   
                   pure qty_integer
read_cells_attr p_id (y .|. z)  =  do
                   r_y <- read_cells_attr p_id y
                   r_z <- read_cells_attr p_id z
                   pure (r_y,r_z)


public export
renderDataAsKey : (SchemaType2 schema) -> String
renderDataAsKey {schema = (IField name FBool)}   True = "True"
renderDataAsKey {schema = (IField name FBool)}   False = "False"
renderDataAsKey {schema = (IField name FString)} item = item
renderDataAsKey {schema = (IField name FTterm)}  item = the String (cast (t2integer item))
renderDataAsKey {schema = (EField name ns)}      item = the String (cast item)
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
              
            <div class="card_footer" %s>
                   <!--
                   <button class="btn btn-primary" id="table_card_edit">Edit</button>
                   <button class="btn btn-primary" id="table_card_commit">Commit</button>
                   
                   -->
            <div/>
              
            </div>
          </div>  <!-- /.card -->
            """
   public export            
   _button : String
   _button = """
             <button class="btn btn-primary" id="%s">%s</button>
         """  -- _button_id label
         
   public export 
   get_composite_id : String -> (m:ModelSchema) -> (ModelDataList m) -> String
   get_composite_id p_id m y = (p_id ++ "__" ++ (name y))
      
   public export
   get_table_id : String ->  String  --this is to reference the table body
   get_table_id p_id  = ( p_id  ++ "__composite_table" )

   public export
   get_card_footer_id : String -> String
   get_card_footer_id p_id = p_id ++ "__card_footer"
   
   public export
   get_edit_button_id : String -> String
   get_edit_button_id p_id = p_id ++ "__edit_buttion"

   public export
   get_commit_button_id : String -> String
   get_commit_button_id p_id = p_id ++ "__commit_buttion"      
         
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
   
   
   public export
   _cells_editable : (s:Schema2) -> List String -> JS_IO ()
   _cells_editable s [] = pure ()
   _cells_editable s (x::xs) = do
             make_cells_editable x s
             _cells_editable s xs

   public export
   _cells_ro : (s:Schema2) -> List String -> JS_IO ()
   _cells_ro s [] = pure ()
   _cells_ro s (x::xs) = do
             make_cells_ro x s
             _cells_ro s xs

   public export
   _read_cells : (s:Schema2) -> List String -> JS_IO (Maybe (List (SchemaType2 s)) )
   _read_cells s [] = pure Nothing
   _read_cells s (p_id::xs) = do
              c <- read_cells p_id s
              ret <- _read_cells s xs
              case ret of
                  Nothing => pure (Just [c])
                  (Just x) => pure (Just ([c]++x))
   
   public export
   on_table_edit: String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   on_table_edit parent_tag_id m mdl = do
      --let _composite_id = "order1" ++ "__" ++ "items"
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id      
      --console_log "table edit"
      --console_log _composite_table_id
      
      let row_ids = [ (get_row_id _composite_table_id x) | x <- (keyL mdl)]
      let row_k =   [ get_cell_keys x (key m) | x <- row_ids]
      let row_v =   [ get_cell_keys x (val m) | x <- row_ids]
      --let row_v = [ concat (renderDataWithSchema2 (snd x) (fst x))  | x <-zip (valL mdl) row_ids]
      _cells_editable (val m) row_ids
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
      
      --console_log (show row_v)
      
   public export
   on_table_commit: String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   on_table_commit parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id      
      let row_ids = [ (get_row_id _composite_table_id x) | x <- (keyL mdl)]
      
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
      _cells_ro (val m) row_ids
      ret_v <- _read_cells (val m) row_ids
      ret_k <- _read_cells (key m) row_ids
      case ret_v of
         Nothing => console_log "empty??"
         (Just r_v) => console_log "muf"

   public export
   insert_table : String -> String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   insert_table _composite_id _footer_id m mdl = do

      let _composite_table_id = get_table_id _composite_id

      let schema_header = (key m) .|. (val m)      
      let _th_html = printf _tf (name mdl) (schema2thead2 schema_header ) (id_att _composite_table_id ) (_footer_id)

      insert_beforeend _composite_id _th_html  --(table_card table_composite_id THeader)  
      insert_rows _composite_table_id m mdl


   public export  --main init
   table_card2 : String -> (m:ModelSchema) -> ModelDataList m -> JS_IO ()
   table_card2 parent_tag_id m mdl = do
      
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_html = ( printf _composite _composite_id )      
      insert_beforeend parent_tag_id _composite_html
      insert_beforeend _composite_id "<h2>Order</h2>"      
      
      let _footer_id = get_card_footer_id _composite_id
       
      insert_table _composite_id (id_att _footer_id) m mdl                 
      
      let _edit_button = get_edit_button_id _composite_id
      let _commit_button = get_commit_button_id _composite_id
      
      insert_beforeend _footer_id (printf _button _edit_button "Edit")
      insert_beforeend _footer_id (printf _button _commit_button "Commit")
            
      onClick ("#" ++ _edit_button) (on_table_edit parent_tag_id m mdl)
      onClick ("#" ++ _commit_button) (on_table_commit parent_tag_id m mdl)
      
      toggle_hide_show_element (_commit_button)
      
      --onClick "#table_card_edit" (on_table_edit parent_tag_id m mdl)
