http put --content-type 'application/json' --redirect-mode manual 'http://localhost:28139/twitter/_mapping/user?pretty' '{"properties": {"email": {"type": "keyword"}}}'
