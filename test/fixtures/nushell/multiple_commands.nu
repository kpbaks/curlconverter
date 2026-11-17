http get --redirect-mode manual 'http://localhost:28139'


http get --redirect-mode manual 'http://localhost:28139/second'


http put --redirect-mode manual 'http://localhost:28139/third' (open --raw 'input_redirected_file.txt')
