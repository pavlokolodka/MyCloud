## Running Migrations
The project uses a migration framework for managing database schema changes. The following scripts are available for running migrations:

### Upgrading the Database Schema
To apply pending migrations and upgrade the database schema, run the following command:
```bash
npm run migrate:up
```

### Rolling Back Database Changes
If you need to rollback the database changes and revert to a previous state, use the following command:
```bash
npm run migrate:down
```

### Checking Migration Status
To check the status of migrations and view which migrations have been applied or are pending, use the following command:
```bash
npm run migrate:status
```
### Creating New Migration
To create a new migration, use the following command:
```bash
npm run migrate:create <migration-name>
```
### Additional Information
- The migrations are located in the migrations directory. Each migration file represents a specific database schema change and is named with a timestamp prefix and a descriptive name.
- Configuration file - `migrate-mongo-config.js`.

## Access Control

For user authentication MyCloud support `JWT` based authentication with email and password as well as Google login.

## Google authentication

In case of login with Google provider, **MyCloud** used **Google OAuth 2.0 server-side approach** to handle auth flow. <br/>
1. A user is redirected to Google's authentication page, where they enter their credentials directly. <br/>
2. After successful authentication, Google sends an authorization code to the server's callback URL. <br/>
3. Then the server exchanges the authorization code for an access token and refresh token, which can be used to authenticate requests to the Google API to get needed information on behalf of the user. <br/>
4. Once the right data is received, **MyCloud** searches for the user using the open ID returned by the authorization provider. <br/>
5. If the user is found, their information is updated (such as profile photo) and a `JWT` token is generated based on the id of the MonogoDB document. Otherwise the user is created and the `JWT` token generation procedure described above is repeated.
6. The user can then use this token to access the files.
![Google auth diagram](https://miro.medium.com/v2/resize:fit:2000/format:webp/1*3hz6pZwAVX3NKxqbe4Lrkw.png)


## Facebook authentication

Facebook authentication is similar to Google authentication described above. <br/>
The only problem is that Facebook supports email and phone as verification methods. While it's not a problem to get an email, it's more difficult to get a phone number because it requires the [pages_show_list](https://developers.facebook.com/docs/permissions/reference/) permission property, which can only be used for verified organizations. So for now, only accounts with Facebook email registration are supported.