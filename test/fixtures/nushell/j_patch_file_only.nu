http patch --content-type 'multipart/form-data' --redirect-mode manual 'http://localhost:28139/patch' { 'file1': (open --raw './test/fixtures/curl_commands/delete.sh') }
