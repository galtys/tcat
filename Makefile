all: tcat

tcat: Muf.idr
	idris -p contrib --codegen javascript -o js/main.js Muf.idr

clean:
	rm -f *ibc
