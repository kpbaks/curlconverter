http post --headers { 'Authorization': 'Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg' } --content-type 'multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' --redirect-mode manual 'http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence' { 'input': '{"evidences": [{  "evidence_type": "PROOF_OF_FULFILLMENT",  "evidence_info": {  "tracking_info": [    {    "carrier_name": "OTHER",    "tracking_number": "122533485"    }  ]  },  "notes": "Test"}  ]}', 'file1': (open --raw 'NewDoc.pdf') }


http post --content-type 'multipart/form-data' 'http://localhost:28139/cgi-bin/luci/admin/network/network/wan' { 'token': '9d96aaaaaaaaaaaaaaaaaaaaaaaa3541', 'cbi.submit': '1', 'tab.network.wan': 'general', 'cbid.network.wan._fwzone': 'wan', 'cbid.network.wan._fwzone.newzone': '', 'cbi.cbe.network.wan.ifname_single': '1', 'cbid.network.wan.ifname_single': 'eth0.2', 'cbid.network.wan.proto': 'pppoe', 'cbid.network.wan.ac': '', 'cbid.network.wan.service': '', 'cbi.cbe.network.wan.auto': '1', 'cbid.network.wan.auto': '1', 'cbi.cbe.network.wan.delegate': '1', 'cbid.network.wan.delegate': '1', 'cbi.cbe.network.wan.force_link': '1', 'cbid.network.wan.ipv6': 'auto', 'cbi.cbe.network.wan.defaultroute': '1', 'cbid.network.wan.defaultroute': '1', 'cbid.network.wan.metric': '0', 'cbi.cbe.network.wan.peerdns': '1', 'cbid.network.wan.peerdns': '1', 'cbid.network.wan._keepalive_failure': '', 'cbid.network.wan._keepalive_interval': '', 'cbid.network.wan.demand': '', 'cbid.network.wan.mtu': '', 'cbi.apply': '保存&应用' }


http post --headers { 'xtoken': 'TOKEN' } --content-type 'multipart/form-data' 'http://localhost:28139/files/upload/ztaaInstaller/0.4.0+0.5.0+ssdf/darwin/arm64/FILE.txt' { 'file': (open --raw '/C:/Users/Admin/Downloads/file.txt') }


http post --content-type 'multipart/form-data' 'http://localhost:28139/api/v1/files/upload' { 'file': (open --raw '/Users/myuser/Desktop/weird\dir/ss.png') }


http post --content-type 'multipart/form-data' --redirect-mode manual 'http://localhost:28139' { 'file': (open --raw '/var/www/html/voice/test.mp3') }
