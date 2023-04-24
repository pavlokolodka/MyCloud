# MyCloud

MyCloud is a file server written in Node.js that provides file management capabilities with unlimited storage. 

## Features

- File CRUD: Upload, download, update, and delete files with ease. Files can be stored and managed using a simple and intuitive API. MyCloud implements file encryption using the AES-256-CBC algorithm to enhance data security.
- User Authentication: Secure sign-in and sign-up functionality allows users to create and manage their own accounts, providing a personalized experience.
- Unlimited Storage: MyCloud offers unlimited storage for managing files, allowing users to store and retrieve files without worrying about storage limitations.

## Installation

To run MyCloud on your local machine, you'll need to have Git and Node.js installed. Follow the steps below:

1. Clone the MyCloud repository to your local machine using Git:

```bash
git clone https://github.com/pavlokolodka/MyCloud.git
```
2. Create a .env file by making a copy of .env.example. This file will contain the configuration for your environment variables:
```bash
cp .env.example .env
```
3. Install the project dependencies using npm
```bash
npm install
```
4. Start the MyCloud server. There are two available scripts depending on the mode you want to run:
<br/>
- For production mode:
```bash
npm run build
npm run start
```
- For development mode (with nodemon for auto-reloading):
```bash
npm run dev
```
## API Documentation

MyCloud provides a RESTful API for file management and user authentication. Detailed documentation of the API endpoints and usage can be found in
```
localhost:5000/api
```

## Technologies Used

- Node.js: A popular and widely-used JavaScript runtime that allows server-side execution of JavaScript code.
- Express: A fast and flexible web application framework for Node.js that simplifies routing, middleware handling, and other common web development tasks.
- MongoDB: A popular NoSQL database that provides flexibility and scalability for storing and managing large amounts of data, making it suitable for handling file storage requirements.

## Contributing

Contributions to MyCloud are welcome! If you have suggestions for new features, bug reports, or other contributions, please open an issue or submit a pull request.

## License

MyCloud is released under the [MIT License](LICENSE).
