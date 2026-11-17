http post --headers { r#''Accept''#: r#''application/json''#, 'Authorization': 'Bearer 000000000000000-0000' } --content-type 'application/json' --redirect-mode manual 'http://localhost:28139/api/servers/00000000000/shared_servers/' '{"server_id": "00000000000",
                   "shared_server": {"library_section_ids": 00000000000,
                                     "invited_id": 00000000000}
                   }
'
