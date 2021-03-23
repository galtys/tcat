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
schema2thead2 : Schema2 kv-> String
schema2thead2 sch = ret where
  schema2th : Schema2 kv -> List String
  schema2th (IField name FBool)  =  [printf "<th>%s</th>" name ]
  schema2th (IField name FString) = [printf "<th>%s</th>" name ]
  schema2th (IField name FTterm ) = [printf "<th>%s</th>" name ]     --SchemaType2 (IField name FTterm ) = Tterm
  schema2th (IFieldV name FTtermV ) = [printf "<th>%s</th>" name ]     --SchemaType2 (IField name FTterm ) = Tterm  
  schema2th (IFieldV name FSop ) = [printf "<th>%s</th>" name ]
  schema2th (EField name ns) = [printf "<th>%s[%s]</th>" name ns]
  schema2th (s1 .|. s2) = (schema2th s1) ++ (schema2th s2)
  schema2th (s1 .+. s2) = (schema2th s1) ++ (schema2th s2)
  ths : String
  ths = concat $ schema2th sch
  ret = printf "%s" ths

public export
render_number_input : String -> Integer ->  String
render_number_input c_id val= printf """<input type="number" class="form-control" value="%d" id="%s">""" val c_id


namespace render_with_ids
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
  renderDataWithSchema2 p_id {schema = (IFieldV name FTtermV)}  item  = [render_tterm_in_td_tag2  (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (IFieldV name FSop)}  item  = [render_text_in_td_tag2  (cell_id p_id name) (show item)]    
  renderDataWithSchema2 p_id {schema = (EField name ns)}      item  = [render_number_in_td_tag2 (cell_id p_id name) item]
  renderDataWithSchema2 p_id {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)
  renderDataWithSchema2 p_id {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 p_id iteml) ++ (renderDataWithSchema2 p_id itemr)



namespace render_wo_ids
  -- using td tags
  public export
  render_number_in_td_tag2 : Integer -> String
  render_number_in_td_tag2 v = printf   """<td>%d</td>""" v

  --public export
  --render_number_in_td_tag2 : String -> Integer -> String
  --render_number_in_td_tag2 p_id v = printf   """<td id="%s" data-val="%d">%d</td>""" p_id v v

  public export
  render_text_in_td_tag2 : String -> String
  render_text_in_td_tag2 v   = printf   """<td>%s</td>""" v
   
  public export
  render_tterm_in_td_tag2 : Tterm -> String
  render_tterm_in_td_tag2 v = printf """<td>%d</td>""" (t2integer v)
    
  public export
  renderDataWithSchema2 : (SchemaType2 schema) -> List String
  renderDataWithSchema2 {schema = (IField name FBool)}   True  = [render_text_in_td_tag2 "True"]
  renderDataWithSchema2 {schema = (IField name FBool)}   False = [render_text_in_td_tag2 "False"]
  renderDataWithSchema2 {schema = (IField name FString)} item  = [render_text_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IField name FTterm)}  item  = [render_tterm_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IFieldV name FTtermV)}  item  = [render_tterm_in_td_tag2 item]
  renderDataWithSchema2 {schema = (IFieldV name FSop)}  item  = [render_text_in_td_tag2 (show item)]
  renderDataWithSchema2 {schema = (EField name ns)}      item  = [render_number_in_td_tag2 item]
  renderDataWithSchema2 {schema = (y .|. z)} (iteml, itemr) = (renderDataWithSchema2 iteml) ++ (renderDataWithSchema2 itemr)
  renderDataWithSchema2 {schema = (y .+. z)} (iteml, itemr) = (renderDataWithSchema2 iteml) ++ (renderDataWithSchema2 itemr)
  
public export
get_cell_keys : String -> (s:Schema2 kv) -> List String
get_cell_keys p_id (IField name fd)  = [cell_id p_id name]
get_cell_keys p_id (IFieldV name fd)  = [cell_id p_id name]
get_cell_keys p_id (EField name fd)  = [cell_id p_id name]
get_cell_keys p_id (y .|. z)  = (get_cell_keys p_id y) ++ (get_cell_keys p_id z)
get_cell_keys p_id (y .+. z)  = (get_cell_keys p_id y) ++ (get_cell_keys p_id z)

public export
make_cells_editable : String -> (s:Schema2 kv) -> JS_IO ()
make_cells_editable p_id (IField name FTterm)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   qty <- get_qty_int _cell_id
                   let input_element = render_number_input _cell_input_id (the Integer (cast qty)) 
                   update_element_text (cell_id p_id name) ""
                   insert_beforeend _cell_id input_element
make_cells_editable p_id (IFieldV name FTtermV)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   qty <- get_qty_int _cell_id
                   let qty_integer = (the Integer (cast qty))
                   let input_element = render_number_input _cell_input_id qty_integer
                   update_element_text (cell_id p_id name) ""
                   insert_beforeend _cell_id input_element

make_cells_editable p_id (IField name fd)  = pure ()
make_cells_editable p_id (EField name fd)  = pure ()
make_cells_editable p_id (y .|. z)  = do 
                                    make_cells_editable p_id y
                                    make_cells_editable p_id z
make_cells_editable p_id (y .+. z)  = do 
                                    make_cells_editable p_id y
                                    make_cells_editable p_id z

public export
make_cells_ro : String -> (s:Schema2 kv) -> JS_IO ()
make_cells_ro p_id (IField name FTterm)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   -- need to get into the input tag
                   qty <- get_qty_int_value2 _cell_input_id
                   update_element_text (cell_id p_id name) ""
                   update_element_text (cell_id p_id name)  (the String (cast qty))
make_cells_ro p_id (IFieldV name FTtermV)  = do
                   let _cell_id = cell_id p_id name
                   let _cell_input_id = cell_input_id p_id name
                   -- need to get into the input tag
                   qty <- get_qty_int_value2 _cell_input_id
                   let qty_string = (the String (cast qty))
                   update_element_text (cell_id p_id name) qty_string
                   
make_cells_ro p_id (IField name fd)  = pure ()
make_cells_ro p_id (EField name fd)  = pure ()
make_cells_ro p_id (y .|. z)  = do 
                                    make_cells_ro p_id y
                                    make_cells_ro p_id z



public export  -- read <td>%s</td> when cells are read-only
read_cells : String -> (s:Schema2 kv) -> JS_IO (SchemaType2 s)
read_cells p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_element_text _cell_id
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
read_cells p_id (IFieldV name FTtermV)  = do
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

public export
read_cells_row : List String -> (s:Schema2 kv) -> JS_IO (List (SchemaType2 s))
read_cells_row [] s = pure []
read_cells_row (x :: xs) s_kv = do
       row <- read_cells x s_kv
       ret <- read_cells_row xs s_kv
       pure ([row] ++ ret)
--read_cells_row r_ids skv = do       
-- td: data-val  or data-dr/data-cr

public export
read_cells_attr : String -> (s:Schema2 kv) -> JS_IO (SchemaType2 s)
read_cells_attr p_id (IField name FBool) = do
                   let _cell_id = cell_id p_id name
                   v <- get_text_dataval _cell_id
                   pure (if (v=="True") then True else False)
read_cells_attr p_id (IField name FString) = do
                   let _cell_id = cell_id p_id name                                      
                   v <- get_text_dataval _cell_id
                   pure v
read_cells_attr p_id (IField name FTterm)  = do
                   let _cell_input_id = cell_id p_id name
                   dr <- get_qty_int_datadr _cell_input_id
                   cr <- get_qty_int_datacr _cell_input_id                   
                   let dr_integer = the Integer (cast dr)
                   let cr_integer = the Integer (cast cr)
                   pure (Tt dr_integer cr_integer)
read_cells_attr p_id (IFieldV name FTtermV)  = do
                   let _cell_input_id = cell_id p_id name
                   dr <- get_qty_int_datadr _cell_input_id
                   cr <- get_qty_int_datacr _cell_input_id 
                   let dr_integer = the Integer (cast dr)
                   let cr_integer = the Integer (cast cr)
                   pure (Tt dr_integer cr_integer)
                   
read_cells_attr p_id (EField name ns)  = do
                   let _cell_id = cell_id p_id name
                   v <- get_qty_int_dataval _cell_id
                   let qty_integer = the Integer (cast v)                   
                   pure qty_integer
read_cells_attr p_id (y .|. z)  =  do
                   r_y <- read_cells_attr p_id y
                   r_z <- read_cells_attr p_id z
                   pure (r_y,r_z)
read_cells_attr p_id (y .+. z)  =  do
                   r_y <- read_cells_attr p_id y
                   r_z <- read_cells_attr p_id z
                   pure (r_y,r_z)

public export
read_cells_attr_row : List String -> (s:Schema2 kv) -> JS_IO (List (SchemaType2 s))
read_cells_attr_row [] s = pure []
read_cells_attr_row (x :: xs) s_kv = do
       row <- read_cells_attr x s_kv
       ret <- read_cells_attr_row xs s_kv
       pure ([row] ++ ret)



public export
set_cells_attr : String -> (SchemaType2 schema) -> JS_IO ()
set_cells_attr p_id {schema=(IField name FBool)} True= do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id "True"
                   
set_cells_attr p_id {schema=(IField name FBool)} False= do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id "False"
                   
set_cells_attr p_id {schema=(IField name FString)} item = do
                   let _cell_id = cell_id p_id name
                   set_text_dataval _cell_id item
                                      
set_cells_attr p_id {schema=(IField name FTterm)} item= do
                   let _cell_id = cell_id p_id name
                   set_qty_int_datadr _cell_id (integer_to_int (dr item))
                   set_qty_int_datacr _cell_id (integer_to_int (cr item))
                   
set_cells_attr p_id {schema=(IFieldV name FTtermV)} item= do
                   let _cell_id = cell_id p_id name
                   set_qty_int_datadr _cell_id (integer_to_int (dr item))
                   set_qty_int_datacr _cell_id (integer_to_int (cr item))
                   
set_cells_attr p_id {schema=(EField name ns)} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval _cell_id (integer_to_int item)
                   
set_cells_attr p_id {schema=(y .|. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir
                   
set_cells_attr p_id {schema=(y .+. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir

--public export
--set_cells_attr_row : List String, (SchemaType2 schema) -> JS_IO ()
--set_cells_attr_row []  = pure ()
--set_cells_attr_row (x :: xs) s_kv = do
          

public export
update_cells_td : String -> (SchemaType2 schema) -> JS_IO ()
update_cells_td p_id {schema=(IField name FBool)} True= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id "True"
update_cells_td p_id {schema=(IField name FBool)} False= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id "False"
update_cells_td p_id {schema=(IField name FString)} item = do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id item
                                      
update_cells_td p_id {schema=(IField name FTterm)} item= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id (printf "%d" (t2integer item))

update_cells_td p_id {schema=(IFieldV name FTtermV)} item= do
                   let _cell_id = cell_id p_id name
                   update_element_text _cell_id (printf "%d" (t2integer item))

update_cells_td p_id {schema=(EField name ns)} item = do
                   let _cell_id = cell_id p_id name
                   set_qty_int_dataval p_id (integer_to_int item)

update_cells_td p_id {schema=(y .|. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir
update_cells_td p_id {schema=(y .+. z)} (il,ir) = do
                   set_cells_attr p_id il
                   set_cells_attr p_id ir

public export
update_cells : String -> (SchemaType2 schema) -> JS_IO ()
update_cells p_id item = do
                   update_cells_td p_id item
                   set_cells_attr  p_id item



public export
renderDataAsKey : (SchemaType2 schema) -> String
renderDataAsKey {schema = (IField name FBool)}   True = "True"
renderDataAsKey {schema = (IField name FBool)}   False = "False"
renderDataAsKey {schema = (IField name FString)} item = item
renderDataAsKey {schema = (IField name FTterm)}  item = the String (cast (t2integer item))
renderDataAsKey {schema = (IFieldV name FTtermV)}  item = the String (cast (t2integer item))
renderDataAsKey {schema = (IFieldV name FSop)}  item = show item
renderDataAsKey {schema = (EField name ns)}      item = the String (cast item)
renderDataAsKey {schema = (y .|. z)} (iteml, itemr) = (renderDataAsKey iteml) ++ (renderDataAsKey itemr)

public export
runjsio : (ty) -> List (JS_IO ty) -> JS_IO ty
runjsio ty [] = pure ty
runjsio ty (x::xs) = do
   ret <- x
   runjsio ty xs
   pure ret
   
  
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
   _amendments : String
   _amendments = """
          <div id="%s">
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
              <table class="table table-sm table-hover">
                <thead>
                    %s
                </thead>
                <tbody %s>
                </tbody>
              </table>
            </div>

            <div class="card_footer" %s>
            <div/>
              
            </div>
          </div>  <!-- /.card -->
            """
            
   public export
   _tf_wo_ids : String
   _tf_wo_ids = """
            <!-- Content Amendments -->
            <div class="card border-dark  mt-3">
              <div class="card-header">
              <h4>%s</h4>
              </div>
            <div class="card-body">
              <table class="table table-sm table-hover">
                <thead>
                    %s
                </thead>
                <tbody>
                    %s
                </tbody>
              </table>
            </div>

            </div>
          </div>  <!-- /.card -->
            """
            
            
   public export            
   _button : String
   _button = """
             <button class="btn btn-primary" id="%s">%s</button>
         """  -- _button_id label
         
   public export 
   get_composite_id : {a:KV} -> String -> (m:(ModelSchema a) ) -> (ModelDataList a m ) -> String
   get_composite_id p_id m y = (p_id ++ "__composite__" ++ (name y))

   public export 
   get_amendments_id : {a:KV} -> String -> (m:ModelSchema a) -> (ModelDataList a m) -> String
   get_amendments_id p_id m y = "amendments" -- (p_id ++ "__amendments__" ++ (name y))
      
      
   public export
   get_table_id : String ->  String  --this is to reference the table body
   get_table_id p_id  = ( p_id  ++ "__table" )

   public export
   get_card_footer_id : String -> String
   get_card_footer_id p_id = p_id ++ "__card_footer"
   
   public export
   get_edit_button_id : String -> String
   get_edit_button_id p_id = p_id ++ "__edit_button"

   public export
   get_commit_button_id : String -> String
   get_commit_button_id p_id = p_id ++ "__commit_button"      

   public export
   get_whs_route_button_id : String -> String
   get_whs_route_button_id p_id = p_id ++ "__commit_whs_route"      

   public export
   get_whs_done_button_id : String -> String
   get_whs_done_button_id p_id = p_id ++ "__commit_whs_done"    

   public export
   get_row_id : String -> (SchemaType2 schema) -> String
   get_row_id p_id  item = p_id++ "_row"++(renderDataAsKey item)
{-
   public export  -- with ids
   insert_rows : {a:KV} -> String -> (m:ModelSchema a) -> ModelDataList a m -> JS_IO ()
   insert_rows p_id m mdl = do
      let row_ids = [ (get_row_id p_id x) | x <- (keyL mdl)]
      
      let muf = do
          x <- zip (keyL mdl) row_ids
          let item = fst x
          let rid = (get_row_id p_id item)
          let x1 = (read_cells_attr rid (val m)  )
          pure x1
      
      let row_k = [ concat (render_with_ids.renderDataWithSchema2 (snd x) (fst x))  | x <-zip (keyL mdl) row_ids]
      let row_v = [ concat (render_with_ids.renderDataWithSchema2 (snd x) (fst x))  | x <-zip (valL mdl) row_ids]
      
      let rows_zip = zip row_k row_v
      let rows_ids_zip = zip row_ids rows_zip
      let rows_tr = [ (printf "<tr id=%s >%s %s</tr>" rid k v) | (rid,(k,v)) <- rows_ids_zip]
      
      --_lines2io p_id rows_tr
      if True then
         runjsio () [insert_beforeend p_id x | x <- rows_tr]
      else 
         pure ()        
-}         
         
   public export
   update_cells_ke1 : String -> (sv:Schema2 Val) -> (SchemaType2 sv) -> JS_IO ()
   update_cells_ke1 rid sv x_val = do
          current <- read_cells rid sv
          update_cells rid (addSchema2Vals current x_val)
          
   public export  -- with ids
   insert_rows2 : String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   insert_rows2 p_id m mdl = do
      
      let muf = do
          x <- (zip (keyL mdl) (valL mdl))
          let x_key = (fst x)
          let x_val = (snd x)
          let rid = (get_row_id p_id x_key)
          let k =  concat (render_with_ids.renderDataWithSchema2 rid x_key)
          let v =  concat (render_with_ids.renderDataWithSchema2 rid x_val)
          let row = printf "<tr id=%s>%s %s</tr>" rid k v
          let ret = do
                     ke <- key_exist rid
                     if (ke==1) then update_cells_ke1 rid (val m) x_val
                                else insert_beforeend p_id row
          pure ret
      runjsio () muf

   public export  -- wo ids
   render_rows_wo_ids : {a:KV} -> (m:ModelSchema a) -> ModelDataList a m -> String
   render_rows_wo_ids m mdl 
     = let row_k = [ concat (render_wo_ids.renderDataWithSchema2 x)  | x <-(keyL mdl)]
           row_v = [ concat (render_wo_ids.renderDataWithSchema2 x)  | x <-(valL mdl)]
           rows_zip = zip row_k row_v
           ret = concat [ (printf "<tr> %s %s </tr>" k v) | (k,v) <- rows_zip] in
        ret
        
   public export
   _read_cells : (s:Schema2 Key) -> List String -> JS_IO (Maybe (List (SchemaType2 s)) )
   _read_cells s [] = pure Nothing
   _read_cells s (p_id::xs) = do
              c <- read_cells p_id s
              ret <- _read_cells s xs
              case ret of
                  Nothing => pure (Just [c])
                  (Just x) => pure (Just ([c]++x))
   public export
   get_table_row_ids: String -> List String -> JS_IO (List String)
   get_table_row_ids table_id [] = do
      r_id <- firstElementChild table_id
      get_table_row_ids table_id [r_id]
      
   get_table_row_ids table_id (x::xs) = do
      r_id <- nextElementSibling x
      if (r_id=="") then
         pure ( reverse ([x]++xs) )
      else
         get_table_row_ids table_id ([r_id,x]++xs)
   
   public export
   on_table_edit: {a:KV} -> String -> (m:ModelSchema a) -> ModelDataList a m -> JS_IO ()
   on_table_edit parent_tag_id m mdl = do
      --let _composite_id = "order1" ++ "__" ++ "items"
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id      
      row_ids <- get_table_row_ids _composite_table_id []
            
      let row_k =   [ get_cell_keys x (key m) | x <- row_ids]
      let row_v =   [ get_cell_keys x (val m) | x <- row_ids]
      runjsio () [ make_cells_editable x (val m) | x <- row_ids]
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
--      toggle_hide_show_element (get_whs_route_button_id _composite_id)
      
      
      
   public export
   insert_table_wo_ids : {a:KV} -> String -> (m:ModelSchema a) -> ModelDataList a m -> JS_IO ()
   insert_table_wo_ids p_id m mdl = do
      let x = render_rows_wo_ids m mdl
      let head_m = printf "<tr>%s %s</tr>" (schema2thead2 (key m)) (schema2thead2 (val m))
      let th_html = printf _tf_wo_ids (name mdl) head_m x
      insert_beforeend p_id th_html

   public export  --main init
   table_amendments : String -> String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   table_amendments title parent_tag_id m mdl = do
   
      -- Amendments
      let _amendments_id = get_amendments_id parent_tag_id m mdl      
      let _amendments_html = ( printf _amendments _amendments_id )
      insert_beforeend parent_tag_id _amendments_html
      insert_beforeend _amendments_id (printf "<h2>%s</h2>" title)

      insert_table_wo_ids _amendments_id m mdl      

                           
   public export
   on_table_commit: String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   on_table_commit parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
--      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
                        
      toggle_hide_show_element (get_edit_button_id _composite_id)
      toggle_hide_show_element (get_commit_button_id _composite_id)
--      toggle_hide_show_element (get_whs_route_button_id _composite_id)
            
      row_ids <- get_table_row_ids _composite_table_id []
      --_cells_ro (val m) row_ids
      runjsio () [make_cells_ro x (val m) | x <- row_ids]

      row_cells_k <- read_cells_row row_ids (key m)
      row_cells_v <- read_cells_row row_ids (val m)
      row_cells_attr_v <- read_cells_attr_row row_ids (val m)
      let zero_v = (schema2ZeroVal (val m))
      
      let upd = do
          x <- zip row_cells_v row_ids
          let u = set_cells_attr (snd x) (fst x)
          pure u
      runjsio () upd
      let df = [ addSchema2Vals v (invSchema2 av)|  (v,av) <- zip row_cells_v row_cells_attr_v]
      let df2 = [x | x <- zip row_ids df]      
      let df3 = [ x | x <- df2 , not (eqSchema2 (snd x) zero_v) ]      
      let (df3k, df3v) = unzip df3
      
      rowk <- read_cells_row df3k (key m)            
                    
      let amend = MkMDList (name mdl) rowk df3v
      if (length df3v) > 0 then
         --insert_table_wo_ids _amendments_id m amend
         table_amendments (printf "Amendment:%s" parent_tag_id) "amendments" m amend
      else
         pure ()
      
   public export
   insert_table : String -> String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   insert_table _composite_id _footer_id m mdl = do

      let _composite_table_id = get_table_id _composite_id
      let head_m = printf "<tr>%s %s</tr>" (schema2thead2 (key m)) (schema2thead2 (val m))
      
      let _th_html = printf _tf (name mdl) head_m (id_att _composite_table_id ) (_footer_id)
      insert_beforeend _composite_id _th_html  --(table_card table_composite_id THeader) 
      insert_rows2 _composite_table_id m mdl

                  
   public export  --main init
   table_composite : String -> String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   table_composite title parent_tag_id m mdl = do
      
      -- Composite
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _composite_html = ( printf _composite _composite_id )      
      insert_beforeend parent_tag_id _composite_html
      insert_beforeend _composite_id (printf "<h2>%s</h2>" title)

      let _edit_button =    get_edit_button_id _composite_id
      let _commit_button =  get_commit_button_id _composite_id      
      
            
      let _footer_id = get_card_footer_id _composite_id       
      
      insert_table _composite_id (id_att _footer_id) m mdl                 
      
      
      insert_beforeend _footer_id (printf _button _edit_button "Edit")
      insert_beforeend _footer_id (printf _button _commit_button "Commit")

      
      onClick ("#" ++ _edit_button) (on_table_edit parent_tag_id m mdl)
      onClick ("#" ++ _commit_button) (on_table_commit parent_tag_id m mdl)
 --     onClick ("#" ++ _whs_route_button) (on_table_set_whs_route parent_tag_id m mdl)
      toggle_hide_show_element (_commit_button)

   public export
   insert_rows : String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   insert_rows parent_tag_id m mdl = do   
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _composite_table_id = get_table_id _composite_id
      insert_rows2 _composite_table_id m mdl

      tab_widget.table_amendments (printf "Amendment:%s" parent_tag_id) "amendments" m mdl


   public export
   on_table_set_whs_route: String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   on_table_set_whs_route parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
      console_log "updating whs route"
      row_ids <- get_table_row_ids _composite_table_id []
      
      row_cells_k <- read_cells_row row_ids (key m)
      row_cells_attr_v <- read_cells_attr_row row_ids (val m)
      
      --let order_items = MkMDList (name mdl) row_cells_k row_cells_attr_v

                  
      let whs_tab_id = get_table_id (get_composite_id "warehouse" m mdl)
      whs_row_ids <- get_table_row_ids whs_tab_id []
      
      whs_row_cells_k <- read_cells_row whs_row_ids (key m)
      whs_row_cells_attr_v <- read_cells_attr_row whs_row_ids (val m)

      -- backorders      
      let whsb_tab_id = get_table_id (get_composite_id "warehouse_backorders" m mdl)
      whsb_row_ids <- get_table_row_ids whsb_tab_id []
      
      whsb_row_cells_k <- read_cells_row whsb_row_ids (key m)
      whsb_row_cells_attr_v <- read_cells_attr_row whsb_row_ids (val m)
      
      
--      let current_whs_route = MkMDList (name mdl) whs_row_cells_k whs_row_cells_attr_v
      let whs_inv = [ (invSchema2 av) | av <- whs_row_cells_attr_v ]
      
      let amend = MkMDList (name mdl) (row_cells_k ++ whs_row_cells_k)  (row_cells_attr_v ++ whs_inv )

      insert_rows "warehouse" m amend

      -- read whs again
      let whs2_tab_id = get_table_id (get_composite_id "warehouse" m mdl)
      whs2_row_ids <- get_table_row_ids whs_tab_id []
      
      whs2_row_cells_k <- read_cells_row whs2_row_ids (key m)
      whs2_row_cells_attr_v <- read_cells_attr_row whs2_row_ids (val m)
      let whs2_inv = [ (invSchema2 av) | av <- whs2_row_cells_attr_v ] 

      let amendb = MkMDList (name mdl) (whs2_row_cells_k ++ whsb_row_cells_k)  (whs2_row_cells_attr_v ++ whs2_inv )
      insert_rows "warehouse_backorders" m amend
            
      pure ()

   public export
   on_table_whs_done: String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   on_table_whs_done parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl
      let _amendments_id = get_amendments_id parent_tag_id m mdl            
      let _composite_table_id = get_table_id _composite_id      
      console_log "updating whs done"
  
 

   public export
   add_whs_button : String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   add_whs_button parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _footer_id = get_card_footer_id _composite_id
      let _whs_route_button = get_whs_route_button_id _composite_id      
      insert_beforeend _footer_id (printf _button _whs_route_button "Update Whs")      
      
      onClick ("#" ++ _whs_route_button) (on_table_set_whs_route parent_tag_id m mdl)
      
   
   public export
   add_whs_done_button : String -> (m:ModelSchema Val) -> ModelDataList Val m -> JS_IO ()
   add_whs_done_button parent_tag_id m mdl = do
      let _composite_id = get_composite_id parent_tag_id m mdl      
      let _footer_id = get_card_footer_id _composite_id
      let _whs_done_button = get_whs_done_button_id _composite_id      
      insert_beforeend _footer_id (printf _button _whs_done_button "Set Done")      
      
      onClick ("#" ++ _whs_done_button) (on_table_whs_done parent_tag_id m mdl)

-- Local Variables:
-- idris-load-packages: ("contrib")
-- End:
