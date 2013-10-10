
var window = {};

function hi(){
	var name = 'bob';

	window.doit = function(year){
		var age = 20;
		console.log(name);
		console.log(year);
	}
	//console.log(age) // !! ERROR
}

hi();
window.doit(2012);
