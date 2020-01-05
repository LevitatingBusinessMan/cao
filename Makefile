install:
	install -Dvm 755 ./cao.js ${DESTDIR}/usr/bin/cao
uninstall:
	rm -v ${DESTDIR}/usr/bin/cao
