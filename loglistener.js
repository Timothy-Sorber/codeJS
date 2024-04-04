const consolediv = document.getElementById("console");

if (typeof console  != "undefined") 
	if (typeof console.log != 'undefined')
			console.olog = console.log;
	else
			console.olog = function() {};

console.log = function(message) {
	console.olog(message);
	consolediv.innerHTML += ('<div class="log">' + message + '</div>');
};

if (typeof console  != "undefined") 
	if (typeof console.warn != 'undefined')
			console.owarn = console.warn;
	else
			console.owarn = function() {};

console.warn = function(message) {
	console.owarn(message);
	consolediv.innerHTML += ('<div class="warning">' + message + '</div>');
};