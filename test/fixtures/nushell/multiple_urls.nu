http put --content-type 'application/x-www-form-urlencoded' --redirect-mode manual 'http://localhost:28139/file.txt' (open --raw 'file.txt')


http put --content-type 'application/x-www-form-urlencoded' --redirect-mode manual 'http://localhost:28139/myfile.jpg?params=perurltoo' (open --raw 'myfile.jpg')


http post --content-type 'application/x-www-form-urlencoded' --redirect-mode manual 'http://localhost:28139' 'fooo=blah'


http post --content-type 'application/x-www-form-urlencoded' --redirect-mode manual 'http://localhost:28139' 'different=data&time=now'
