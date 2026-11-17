http post --content-type 'multipart/form-data' --redirect-mode manual 'http://localhost:28139/targetservice' { 'image': (open --raw 'image.jpg') }
