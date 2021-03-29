all: tcat

tcat: Muf.idr
	idris -p contrib --codegen javascript -o js/main.js Muf.idr
node: Hello.idr
	idris -p contrib --codegen node Hello.idr -o hello 


clean:
	rm -f *ibc
