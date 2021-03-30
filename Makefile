all: tcat

tcat: Muf.idr
	idris -p contrib --codegen javascript -o js/main.js Muf.idr
node: Hello_WS.idr
	idris -p contrib --codegen node Hello_WS.idr -o hello

outjs: js/w3c.js
	browserify js/w3c.js -o js/out.js

clean:
	rm -f *ibc
