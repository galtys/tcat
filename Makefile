all: tcat

tcat: hs.ipkg #Muf.idr 
	idris --build hs.ipkg  #--codegen javascript -o js/main.js Muf.idr 

node: Hello_WS.idr
	idris -p contrib --codegen node Hello_WS.idr -o hello

outjs: js/w3c.js
	browserify js/w3c.js -o js/out.js

yarn: package.json yarn.lock
	../yarn2nix/result-bin/bin/yarn2nix > npm-deps.nix
	../yarn2nix/result-bin/bin/yarn2nix --template package.json  > npm-package.nix

clean:
	rm -f *ibc
