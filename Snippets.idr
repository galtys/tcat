module Snippets

import Printf

%access public export



table_card : String
table_card = """
          <!-- Content Edit Table -->
          <div class="card mt-3">
            <div class="card-body">
              <h4>SO440</h4>
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
                <tbody id="so_table1">
                  <tr >
                    <td scope="row">YWORMME</td>
		    <td></td>
                    <td id="so1_qty" >3</td>
                    <td>Unit</td>
                    <td>STE20</td>
                    <td>188</td>
		    <td>0</td>
	    
		    <!--
                    <td class="no-wrap"><a href=""><i class="fa fa-pencil pr-1"></i>Edit</a> | <a href=""><i class="fa fa-trash pr-1"></i>Delete</a></td>-->
                  </tr>
		  
                </tbody>
              </table>
            </div>
          </div>  <!-- /.card -->
"""

format_row : String
format_row = """<tr >  <td scope="row">%s</td>   <td></td> <td id="so4_qty" >%d</td>  <td>Unit</td> <td>STE20</td> <td>%d</td> <td>0</td>     </tr>"""

new_row : String -> Int -> Int -> String
new_row sku qty price = printf format_row sku qty price

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
