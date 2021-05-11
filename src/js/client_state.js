var data = [
				{
					project: "Real Estate",
					owner: "Louise Fisher",
					start_date: "02/03/2018",
					end_date: "06/05/2018",
					status: "Done",
					hours: 92,
					cost: 3588,
					budget: 11768,
					balance: 8180,
					paid: true,
					renewals: "1-2 times"
				},
				{
					project: "HR System",
					owner: "Daniel Peterson",
					start_date: "03/04/2018",
					end_date: "02/07/2018",
					status: "Done",
					hours: 340,
					cost: 15980,
					budget: 18856,
					balance: 2876,
					paid: true,
					renewals: "1 time"
				},
				{
					project: "Inventory",
					owner: "Fred Duncan",
					start_date: "01/06/2018",
					end_date: "01/09/2018",
					status: "Done",
					hours: 484,
					cost: 21296,
					budget: 14907,
					balance: -6389,
					paid: false,
					renewals: "1 time"
				},
				{
					project: "Trip planner",
					owner: "Michael Rice",
					start_date: "01/08/2018",
					end_date: "06/11/2018",
					status: "Done",
					hours: 345,
					cost: 14835,
					budget: 70911,
					balance: 56076,
					paid: false,
					renewals: "1-2 times"
				},
				{
					project: "HR System",
					owner: "Andrew Stewart",
					start_date: "01/06/2018",
					end_date: "02/09/2018",
					status: "Done",
					hours: 57,
					cost: 2052,
					budget: 5068,
					balance: 3016,
					paid: true,
					renewals: "1-2 times"
				},
				{
					project: "HR System",
					owner: "Martin Thompson",
					start_date: "06/02/2018",
					end_date: "01/06/2018",
					status: "Done",
					hours: 211,
					cost: 8229,
					budget: 16540,
					balance: 8311,
					paid: false,
					renewals: "more than 5 times"
				},
				{
					project: "Ticket System",
					owner: "Martin Thompson",
					start_date: "06/05/2019",
					end_date: "03/07/2019",
					status: "In Progress",
					hours: 3,
					cost: 144,
					budget: 122,
					balance: -22,
					paid: true,
					renewals: "1 time"
				},
				{
					project: "Education System",
					owner: "Mark Harper",
					start_date: "02/04/2019",
					end_date: "03/08/2019",
					status: "In Progress",
					hours: 76,
					cost: 3496,
					budget: 12515,
					balance: 9019,
					paid: true,
					renewals: "more than 5 times"
				}
			];






var clientAppState = (function () {    
  /* The object that holds the state 
  var state = {};
  console.log("wsServer1----");
  */
			var grid;
			var config = {
				columns: [
					{ width: 160, id: "project", header: [{ text: "Project" }, { content: "comboFilter" }] },
				    { width: 160, id: "status", header: [{ text: "Status" }, { content: "selectFilter" }], editorType: "select", options: ["Done", "In Progress", "Not Started"] , 			    editable: true},
					{ width: 160, id: "paid", header: [{ text: "Paid", rowspan: 2 }], type: "boolean" },
					{ width: 160, id: "owner", header: [{ text: "Owner" }, { content: "inputFilter" }] },
				    { width: 160, id: "hours", header: [{ text: "Number of hours" }, { content: "inputFilter" }], type:"number",validation:"numeric" },
				        { width: 160, id: "renewals", header: [{ text: "Number of renewals" }, { content: "comboFilter" }], type: "string", editorType: "combobox", options: ["1 time", "1-2 times", "more than 5 times"] },

				    
					{ width: 160, id: "start_date", header: [{ text: "Calendar", colspan: 2 }, { text: "Start date" }], type: "date", format: "%d/%m/%Y" },
				        { width: 160, id: "end_date", header: ["", { text: "End date" }], type: "date", format: "%d/%m/%Y" },

				    
				    { width: 160, id: "cost",header: [{ text: "Cost" }, { content: "inputFilter" }], type:"number",editorType: "number",editable: true },
					{ width: 160, id: "budget", header: [{ text: "Budget" }, { content: "inputFilter" }] },
					{ width: 160, id: "balance", header: [{ text: "Balance" }, { content: "inputFilter" }] },
				],
				data: data,
			    editable: true,
			    autoEmptyRow:true
			};

			function createGrid() {
				if (grid) {
					grid.destructor();
				}
				grid = new dhx.Grid("grid", config);
			}
/*
			var selector = document.querySelectorAll("[name=editable]");
			for (var index = 0; index < selector.length; index++) {
				selector[index].addEventListener("change", function (e) {
					config.editable = (e.target.id === "true");
					createGrid();
				});
			}
*/
			createGrid();


    return {
    wsServerOnRequest : function (on_request) {
	wsServer.on('request', on_request);
    },
    acceptConnection : function (req) {
    	console.log(req.origin, req.url);
	var conn = req.accept('echo-protocol',req.origin);
	//state.conn = conn;

        return conn;
    },
    
    setOnMsgHandler : function (c,fc) {
          c.on('message', fc);
    },
    setOnCloseHandler : function (c,fc) {
          c.on('close', fc);
    },
    getUtf8Data : function (msg) {
        if (msg.type==='utf8') {
	    return msg.utf8Data;
	} else {
	    return "";
	}	    
    },
    sendUTF : function (c,a) {
	  c.sendUTF( a ); //connection.sendUTF
    },
  }

}());

