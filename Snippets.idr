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

_table_card : String
_table_card = """
          <!-- Content Edit Table -->
          <div class="card border-dark bg-light mt-3">
              <div class="card-header">
              <h4>%s</h4>
              </div>
            <div class="card-body">
              
              <form>
              <table class="table table-responsive d-md-table">
                <thead>
                  <tr>
                    <th>SKU</th>
		    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Taxes</th>
                    <th>Price</th>
		    <th>Disc</th>
                  </tr>
                </thead>
                <tbody %s >
                </tbody>
                
              </table>
              <div class="card-footer">
              <button type="submit" class="btn btn-primary">Submit</button>
              <div/>
              </form>
            </div>
          </div>  <!-- /.card -->
"""

TableID : Type
TableID = String

RowID : Type
RowID = Maybe String

id_att_format : String
id_att_format = """ id="%s" """

id_att : String -> String
id_att x = printf id_att_format x

table_card : TableID -> String
table_card key = printf _table_card "SO440" (id_att key)


email_td : String
email_td = """
     <div class="form-group">
         <input type="number" class="form-control" placeholder="enter ">
     </div>
"""

format_row : String
format_row = """<tr >  <td scope="row"> %s </td>   <td>%s</td> <td %s> %d </td>  <td>%s </td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>"""


--_unit_dropdown

new_row : String -> RowID -> Integer -> Integer -> String --sku key qty price
new_row sku key qty price = case key of
          Nothing => printf format_row sku email_td "" qty _unit_dropdown price
          (Just _id) => printf format_row sku email_td (id_att _id) qty _unit_dropdown price

line2row : RowID -> OrderLine -> String
line2row rowid (MkOrderLine (p1, p2, line, sku1, sku2, price_unit) qty) = new_row sku key q price where
      sku = i2s sku1
      key = rowid --Just (linekey2string lk)
      q = t2integer qty
      price = price_unit

example_row : String
example_row = """<tr >  <td scope="row">AB</td>   <td></td> <td id="so4_qty" >1</td>  <td>Unit</td> <td>STE20</td> <td>188</td> <td>0</td>     </tr>"""

nav_bar : String
nav_bar = """
    <!--
    ####################################################
    N A V B A R
    ####################################################
    -->
    <!-- If you need sticky-top to work in lower versions of IE https://github.com/filamentgroup/fixed-sticky -->
    <nav class="navbar navbar-expand-sm navbar-dark bg-dark sticky-top ">

      <div class="navbar-toggler-right">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar"
          aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
      <!-- Important - make sure to have the toggler button outside of the container -->

      <a class="navbar-brand" href="#">
        <img src="img/bootstrapcreative-icon.svg" width="25" height="25" class="d-inline-block align-top" alt="">
        <span class="">BootstrapCreative </span>
      </a>
      <div class="collapse navbar-collapse" id="navbar">
        <ul class="nav navbar-nav justify-content-end w-100">
          <li class="nav-item">
            <a class="nav-link" href="../../homepage/layout/" target="_blank">Visit Site <i class="fa fa-external-link"
                aria-hidden="true"></i> </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item float-lg-right">
            <a href="" class="nav-link "><i class="fa fa-bell text-warning" aria-hidden="true"></i> <span class="badge-pill badge-danger text-light">3</span></a>
          </li>
          <li class="nav-item dropdown user">

            <a class="nav-link dropdown-toggle" href="#" role="button" id="responsiveNavbarDropdown" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false"><img src="https://secure.gravatar.com/avatar/38eff4a7ab7f391783f71ccb38508df6?s=30"
                alt="" class="rounded-circle"> Hi Jacob Lett</a>

            <div class="dropdown-menu" aria-labelledby="responsiveNavbarDropdown">
              <a class="dropdown-item" href="#">Edit My Profile</a>
              <a class="dropdown-item" href="#">Log Out</a>
              <a class="dropdown-item" href="#">Help</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
"""
