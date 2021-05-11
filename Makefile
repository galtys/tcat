all: tcat

tcat: hs.ipkg 
	idris --build hs.ipkg 
ws: hs_server.ipkg
	idris --build hs_server.ipkg 

#node: Hello_WS.idr
#	idris -p contrib --codegen node Hello_WS.idr -o hello
#
#outjs: js/w3c.js
#	browserify js/w3c.js -o js/out.js

yarn: package.json yarn.lock
	../yarn2nix/result-bin/bin/yarn2nix > npm-deps.nix
	../yarn2nix/result-bin/bin/yarn2nix --template package.json  > npm-package.nix

clean:
	idris --clean hs.ipkg
	idris --clean hs_server.ipkg
