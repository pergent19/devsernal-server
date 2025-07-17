# AI Chat API

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/pergent19/devsernal-server.git
   ```
2. Install the dependencies:
   ```
   cd ai-chat-api
   npm install
   ```
3. Set the required environment variables:
   - `GEMINI_API_KEY`: Your Google Generative AI API key.
   - `CORS_ORIGIN`: The allowed origin for your frontend application (e.g., `https://your-frontend.onrender.com`).

## Usage

1. Start the server:
   ```
   npm start
   ```
   or
   ```
   npm run dev
   ```
2. The server will start running on `http://localhost:3000`.

## API

### `POST /api/chat`

- **Description**: Sends a chat message to the AI and receives a response.
- **Request Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }
  ```
- **Response**:
  ```json
    {
        "success": true,
        "reply": "Hello! How can I help you today?\n",
        "timeStamp": "2025-07-17T02:48:43.644Z"
    }
  ```


## Tech Stack

**Server:** Node, Express


# Hi, I'm Perg! 👋


## 🚀 About Me
Hello, friends! I'm a Full-Stack Developer with more than 5 years of experience in Software Development.

🧑‍💻 As a mid-level developer, I specialize in:

 - Front-End (ReactJS, VueJS, JavaScript, HTML)
 - Backend (NodeJS, ExpressJS, Spring Boot)
 - Fullstack Web Development (MERN)
 - Database (SQL, MongoDB)
 - Responsive Web Design (Flexbox, Grid)
 - Version Control (Git, GitHub)
 - Deployment and Hosting (Netlify, Render)
 - UI/UX (Bootstrap, Tailwind CSS, MaterialUI)
 - Authorization and Authentication (JWT, Bcrypt, Oauth, Clerk)
 - Bank System / Ecommerce System
 - Gemini AI / Chat AI


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://pergent.netlify.app/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pergentino-galang-ii/)


