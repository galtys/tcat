var orgChartData = [
	{
		id: "1",
		text: "Chairman & CEO",
		title: "Henry Bennett",
		img: "../common/img/avatar-1.png"
	},
	{
		id: "2",
		text: "Manager",
		title: "Mildred Kim",
		img: "../common/img/avatar-2.png"
	},
	{
		id: "3",
		text: "Technical Director",
		title: "Jerry Wagner",
		img: "../common/img/avatar-3.png"
	},
	{
		id: "2.1",
		text: "Marketer",
		title: "Charles Little",
		img: "../common/img/avatar-4.png"
	},
	{
		id: "3.1",
		text: "Team Lead ",
		title: "Jonathan Lane",
		img: "../common/img/avatar-5.png"
	},
	{ id: "1-2", from: "1", to: "2", type: "line", points: [{ x: 100, y: 100 }] },
	{ id: "1-3", from: "1", to: "3", type: "line" },
	{ id: "2-2.1", from: "2", to: "2.1", type: "line" },
	{ id: "3-3.1", from: "3", to: "3.1", type: "line" },
];

var bitOrgChartData = [
	{
		"id": "1",
		"text": "Chairman & CEO",
		"title": "Henry Bennett",
		"img": "../common/img/avatar-1.png"
	},
	{
		"id": "2",
		"text": "QA Lead",
		"title": "Emma Lynch",
		"img": "../common/img/avatar-2.png",
		"parent": 1,
		"dir": "vertical"
	},
	{
		"id": "2.1",
		"text": "QA",
		"title": "Charles Little",
		"img": "../common/img/avatar-3.png",
		"parent": 2
	},
	{
		"id": "2.2",
		"text": "QA",
		"title": "Douglas Riley",
		"img": "../common/img/avatar-4.png",
		"parent": 2
	},
	{
		"id": "2.3",
		"text": "QA",
		"title": "Eugene Foster",
		"img": "../common/img/avatar-5.png",
		"parent": 2
	},
	{
		"id": "3",
		"text": "Technical Director",
		"title": "Jerry Wagner",
		"img": "../common/img/avatar-6.png",
		"parent": 1
	},
	{
		"id": "3.1",
		"text": "Team Lead",
		"title": "Mark Nichols",
		"img": "../common/img/avatar-7.png",
		"parent": 3
	},
	{
		"id": "3.1.1",
		"text": "Programmer",
		"title": "Sean Parker",
		"img": "../common/img/avatar-8.png",
		"parent": 3.1,
		"open": false
	},
	{
		"id": "3.1.1.1",
		"text": "Junior",
		"title": "Laura Alvarez",
		"img": "../common/img/avatar-9.png",
		"parent": "3.1.1"
	},
	{
		"id": "4",
		"text": "Manager",
		"title": "Jonathan Lane",
		"img": "../common/img/avatar-10.png",
		"parent": "1",
		"dir": "vertical"
	},
	{
		"id": "4.1",
		"text": "Marketer",
		"title": "Sandra Butler",
		"img": "../common/img/avatar-11.png",
		"parent": "4"
	},
	{
		"id": "4.2",
		"text": "Designer",
		"title": "Julie Green",
		"img": "../common/img/avatar-12.png",
		"parent": "4"
	},
	{
		"id": "4.3",
		"text": "Sales Manager",
		"title": "Richard Hicks",
		"img": "../common/img/avatar-13.png",
		"parent": "4"
	},
	{
		"id": "3.2",
		"text": "Team Lead",
		"title": "Nicholas Cruz",
		"img": "../common/img/avatar-14.png",
		"parent": 3
	},
	{
		"id": "3.2.1",
		"text": "Programmer",
		"title": "Michael Shaw",
		"img": "../common/img/avatar-15.png",
		"parent": "3.2"
	},
	{
		"id": "3.2.1.1",
		"text": "Junior",
		"title": "John Flores",
		"img": "../common/img/avatar-16.png",
		"parent": "3.2.1"
	}
];

var customDiagramData = [
	{
		id: "a",
		x: 264,
		y: 53,
		type: "rect",
		text: "a test",
		height: 50,
		width: 50,
		css: "square"
	},
	{
		id: "b",
		x: 267,
		y: 158,
		type: "rect",
		text: "b test text",
		height: 50,
		width: 50,
		css: "baseShape"
	},
	{
		id: "c",
		x: 100,
		y: 100,
		type: "rect",
		text: "c",
		height: 50,
		width: 50,
		css: "baseShape"
	},
	{
		id: "f",
		x: 100,
		y: 100,
		type: "rect",
		text: "f",
		height: 50,
		width: 150,
		css: "baseShape"
	},
	{
		id: "d",
		x: 164,
		y: 83,
		type: "triangle",
		text: "test",
		height: 100,
		width: 100,
		css: "baseShape"
	},
	{
		id: "e",
		x: 400,
		y: 400,
		type: "circle",
		text: "test",
		height: 100,
		width: 100,
		css: "baseShape"
	},
	{ id: "ab", points: [{ x: 264, y: 103 }, { x: 317, y: 208 }], type: "line" },
];

var simpleOrgChartData = [
	{
		id: 1,
		text: "Chairman & CEO",
	},
	{
		id: 2,
		text: "Manager",
		parent: 1
	},
	{
		id: 3,
		text: "Technical Director",
		parent: 1
	},
	{
		id: 2.1,
		text: "Marketer",
		parent: 2
	},
	{
		id: 3.1,
		text: "Team Lead ",
		parent: 3
	},
];

var activity = [
	{
		"id": "start",
		"x": 200,
		"y": 0,
		"type": "start",
		"text": "Start",
	},
	{
		"id": 1,
		"x": 200,
		"y": 120,
		"text": "Call Client and \n set-up Appointment",
		"type": "process",
	},
	{
		"id": 2,
		"x": 200,
		"y": 240,
		"text": "Decision",
		"type": "decision",
	},
	{
		"id": 3,
		"x": 20,
		"y": 360,
		"text": "Prepare \n a Conference Room",
		"type": "process",
	},
	{
		"id": 4,
		"x": 380,
		"y": 360,
		"text": "Prepare a Laptop",
		"type": "process",
	},
	{
		"id": 5,
		"x": 200,
		"y": 480,
		"text": "Meet with \n the Client",
		"type": "process",
	},
	{
		"id": 6,
		"x": 200,
		"y": 600,
		"text": "Send \n Follow-up Letter",
		"type": "process",
	},
	{
		"id": 7,
		"x": 200,
		"y": 720,
		"text": "Decision",
		"type": "decision",
	},
	{
		"id": 8,
		"x": 200,
		"y": 840,
		"text": "Create Proposal",
		"type": "process",
	},
	{
		"id": 8.1,
		"x": 30,
		"y": 840,
		"text": "See the \n Activity Diagram \n for creating \n a document",
		"type": "document",
	},
	{
		"id": 9,
		"x": 200,
		"y": 960,
		"text": "Send Proposal \n to Client",
		"type": "process",
	},
	{
		"id": 10,
		"x": 200,
		"y": 1080,
		"type": "end",
		"text": "End",
	},
	{
		"id": 11,
		"x": 60,
		"y": 250,
		"type": "text",
		"text": "[appointment onside]",
	},
	{
		"id": 12,
		"x": 340,
		"y": 250,
		"type": "text",
		"text": "[appointment offside]",
	},
	{
		"id": 13,
		"x": 350,
		"y": 730,
		"type": "text",
		"text": "[no statement of problem]",
	},
	{
		"id": 14,
		"x": 100,
		"y": 810,
		"type": "text",
		"text": "[statement of problem]",
	},
	{
		stroke:"#7D8495",
		"from": "start",
		"to": 1,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 1,
		"to": 2,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 3,
		"to": 5,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "left",
		"strokeType": "line",
		"backArrow": ""
	},
	{
		stroke:"#7D8495",
		"from": 4,
		"to": 5,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "right",
	},
	{
		stroke:"#7D8495",
		"from": 5,
		"to": 6,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 6,
		"to": 7,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 7,
		"to": 8,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 8,
		"to": 8.1,
		"type": "dash",
		"connectType": "elbow",
		"fromSide": "left",
		"toSide": "right",
	},
	{
		stroke:"#7D8495",
		"from": 8,
		"to": 9,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 9,
		"to": 10,
		"type": "line",
		"forwardArrow": "filled",
		"connectType": "elbow",
		"fromSide": "bottom",
		"toSide": "top",
	},
	{
		stroke:"#7D8495",
		"from": 7,
		"to": 10,
		"type": "line",
		"fromSide": "right",
		"toSide": "right",
		"forwardArrow": "filled",
		"connectType": "elbow",
	},
	{
		stroke:"#7D8495",
		"type": "line",
		"connectType": "elbow",
		"from": 3,
		"to": 2,
		"fromSide": "top",
		"toSide": "left",
		"strokeType": "line",
		"backArrow": "filled",
		"forwardArrow": ""
	},
	{
		"type": "line",
		"connectType": "elbow",
		"from": 4,
		"to": 2,
		"fromSide": "top",
		"toSide": "right",
		"strokeType": "line",
		"backArrow": "filled",
		"forwardArrow": "",
		stroke:"#7D8495",
	}
];

var orgChartDataMixed = [
	{
		"id": "1",
		"type": "rectangle",
		"text": "Company",
	},
	{
		"id": "2",
		"type": "card",
		"text": "Support Department",

		"parent": "1"
	},
	{
		"id": "3",
		"type": "template",
		"title": "Milena Hunter",
		"post": "Head of Testing",
		"phone": "(124) 622-1256",
		"email": "mhunter@gmail.com",
		"img": "../common/big_img/big-avatar-25.jpg",

		"parent": "2"
	},
	{
		"id": "4",
		"type": "template",
		"title": "Harvey Pearce",
		"post": "Head of Support",
		"phone": "(364) 234-7523",
		"email": "hpearce@gmail.com",
		"img": "../common/big_img/big-avatar-18.jpg",

		"parent": "2"
	},
	{
		"id": "5",
		"type": "img-card",
		"title": "Francesca Saun",
		"text": "Support specialist",
		"img": "../common/big_img/big-avatar-3.jpg",

		"parent": "4"
	},
	{
		"id": "6",
		"type": "img-card",
		"title": "Cruz Burke",
		"text": "Support specialist",
		"img": "../common/big_img/big-avatar-7.jpg",

		"parent": "4"
	},
	{
		"id": "7",
		"type": "img-card",
		"title": "Abraham Johnston",
		"text": "Testing specialist",
		"img": "../common/big_img/big-avatar-22.jpg",

		"parent": "3"
	},
	{
		"id": "8",
		"type": "img-card",
		"title": "Philippa Holmes",
		"text": "Testing specialist",
		"img": "../common/big_img/big-avatar-23.jpg",

		"parent": "3"
	}
];
