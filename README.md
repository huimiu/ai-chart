# AI-Enhanced Data Visualization

## Run locally
1. run vsts-npm-auth to get an Azure Artifacts token added to your user-level .npmrc file.
    ```bash
    vsts-npm-auth -config .npmrc
    ```

1. Add Azure OpenAI related information to the [.env.local.user](./env/.env.local.user) file.
    ```
    SECRET_OAI_ENDPOINT=
    SECRET_OAI_API_KEY=
    ```
