http get --redirect-mode manual 'http://localhost:28139?name=@myfile.jpg'


http get --redirect-mode manual 'http://localhost:28139/?prmsare=perurl&secondparam=yesplease&name=@myfile.jpg'


http get --redirect-mode manual 'http://localhost:28139?trailingamper=shouldwork&&name=@myfile.jpg'


http get --redirect-mode manual 'http://localhost:28139?noequalshouldnt&name=@myfile.jpg'
