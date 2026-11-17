http patch --headers { 'Accept': 'application/vnd.go.cd.v4+json' } --content-type 'application/json' --user 'username' --password 'password' --redirect-mode manual 'http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da' '{
        "hostname": "agent02.example.com",
        "agent_config_state": "Enabled",
        "resources": ["Java","Linux"],
        "environments": ["Dev"]
        }'
