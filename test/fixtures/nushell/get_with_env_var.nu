http get --headers { 'Authorization': $"Bearer ($env.DO_API_TOKEN)" } --content-type 'application/json' --redirect-mode manual 'http://localhost:28139/v2/images?type=distribution'
