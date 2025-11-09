# Examples

<!-- TODO: update package.json with the actual distributed package -->
Here you can find some examples of how to use the package in your project and its logging capabilities.

## Quickstart

- `pnpm install`
- `export MXM_API_KEY=your_api_key_here`
- `pnpm run start:mjs`

## Logs

### Missing API key

```sh
~/Repositories/os/mxm-api/examples → pn run start:mjs

> mxm-api-examples@ start:mjs /Users/andreafspeziale/Repositories/os/mxm-api/examples
> node index.mjs | pino-pretty

[20:49:23.545] DEBUG (6675): Performing fingerprint by input text...
    context: "MxmAPI"
    fn: "trackLyricsFingerprintPost"
    method: "POST"
    endpoint: "/ws/1.1/track.lyrics.fingerprint.post"
    payload: {
      "text": "Fratelli d'Italia l'Italia s'è desta, dell'elmo di Scipio s'è cinta la testa. Dov'è la Vittoria? Le porga la chioma, ché schiava di Roma Iddio la creò."
    }
[20:49:23.545] ERROR (6675): API key is required
    context: "MxmAPI"
    fn: "throwAPIError"
    method: "POST"
    endpoint: "/ws/1.1/track.lyrics.fingerprint.post"
    cause: {
      "name": "ZodValidationError",
      "details": [
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [],
          "message": "Invalid input: expected string, received undefined"
        }
      ]
    }
~/Repositories/os/mxm-api/examples →
```

### Invalid API key

```sh
~/Repositories/os/mxm-api/examples → export MXM_API_KEY=xyz
~/Repositories/os/mxm-api/examples → pn run start:mjs

> mxm-api-examples@ start:mjs /Users/andreafspeziale/Repositories/os/mxm-api/examples
> node index.mjs | pino-pretty

[20:49:56.092] DEBUG (6718): Performing fingerprint by input text...
    context: "MxmAPI"
    fn: "trackLyricsFingerprintPost"
    method: "POST"
    endpoint: "/ws/1.1/track.lyrics.fingerprint.post"
    payload: {
      "apiKey": "xyz",
      "text": "Fratelli d'Italia l'Italia s'è desta, dell'elmo di Scipio s'è cinta la testa. Dov'è la Vittoria? Le porga la chioma, ché schiava di Roma Iddio la creò."
    }
[20:49:56.093] DEBUG (6718): Handling request...
    context: "MxmAPI"
    fn: "handleRequest"
    method: "POST"
    path: "/ws/1.1/track.lyrics.fingerprint.post?apiKey=xyz"
    headers: {
      "content-type": "application/json"
    }
    body: {
      "data": {
        "text": "Fratelli d'Italia l'Italia s'è desta, dell'elmo di Scipio s'è cinta la testa. Dov'è la Vittoria? Le porga la chioma, ché schiava di Roma Iddio la creò."
      }
    }
[20:49:56.262] DEBUG (6718): Handling response...
    context: "MxmAPI"
    fn: "handleResponse"
    method: "POST"
    path: "/ws/1.1/track.lyrics.fingerprint.post?apiKey=xyz"
    statusCode: 200
    data: {
      "message": {
        "header": {
          "status_code": 401,
          "execute_time": 0.0023109912872314
        },
        "body": []
      }
    }
[20:49:56.263] ERROR (6718): Unexpected response data shape
    context: "MxmAPI"
    fn: "throwAPIError"
    method: "POST"
    path: "/ws/1.1/track.lyrics.fingerprint.post?apiKey=xyz"
    statusCode: 200
    data: {
      "message": {
        "header": {
          "status_code": 401,
          "execute_time": 0.0023109912872314
        },
        "body": []
      }
    }
    cause: {
      "name": "ZodValidationError",
      "details": [
        {
          "code": "invalid_value",
          "values": [
            200
          ],
          "path": [
            "message",
            "header",
            "status_code"
          ],
          "message": "Invalid input: expected 200"
        },
        {
          "expected": "object",
          "code": "invalid_type",
          "path": [
            "message",
            "body"
          ],
          "message": "Invalid input: expected object, received array"
        }
      ]
    }
~/Repositories/os/mxm-api/examples →
```

### Valid API key

```sh
~/Repositories/os/mxm-api/examples → pn run start:mjs

> mxm-api-examples@ start:mjs /Users/andreafspeziale/Repositories/os/mxm-api/examples
> node index.mjs | pino-pretty

[21:33:21.517] DEBUG (7415): Performing fingerprint by input text...
    context: "MxmAPI"
    fn: "trackLyricsFingerprintPost"
    method: "POST"
    endpoint: "/ws/1.1/track.lyrics.fingerprint.post"
    payload: {
      "apiKey": "[Redacted]",
      "text": "Fratelli d'Italia, l'Italia s'è desta\nDell'elmo di Scipio s'è cinta la testa\nDov'è la Vittoria? Le porga la chioma\nChe schiava di Roma Iddio la creò"
    }
[21:33:21.518] DEBUG (7415): Handling request...
    context: "MxmAPI"
    fn: "handleRequest"
    method: "POST"
    path: "[Redacted]"
    headers: {
      "content-type": "application/json"
    }
    body: {
      "data": {
        "text": "Fratelli d'Italia, l'Italia s'è desta\nDell'elmo di Scipio s'è cinta la testa\nDov'è la Vittoria? Le porga la chioma\nChe schiava di Roma Iddio la creò"
      }
    }
[21:42:45.758] DEBUG (7495): Handling response...
    context: "MxmAPI"
    fn: "handleResponse"
    method: "POST"
    path: "[Redacted]"
    statusCode: 200
    data: {
        "message": {
            "header": {
                "status_code": 200,
                "execute_time": 0.2284460067749
            },
            "body": {
                "track_list": [
                    {
                        "similarity": 98.648648648649,
                        "track": "[Redacted]"
                    },
                    {
                        "similarity": 97.972972972973,
                        "track": "[Redacted]"
                    },
                    {
                        "similarity": 29.054054054054,
                        "track": "[Redacted]"
                    }
                ]
            }
        }
    }
~/Repositories/os/mxm-api/examples →
```
