# Armic Chat Application

This is a real-time chatroom application built with React, Node.js, Socket.IO, and Nginx.

## Features

-   Real-time chat functionality
-   Room creation and joining
-   User alias setting
-   Open room list display

## Technologies Used

-   **Frontend:** React, Socket.IO-client
-   **Backend:** Node.js, Express, Socket.IO, CORS
-   **Web Server:** Nginx
-   **Deployment:** Vercel (frontend), AWS/Azure/GCP/DigitalOcean VM (backend)
-   **SSL Certificates:** Let's Encrypt

## Setup and Installation

### Prerequisites

-   Node.js and npm installed
-   React CLI installed
-   A Virtual Machine (VM) from any cloud provider (e.g., AWS EC2)
-   A domain name (e.g., `yourdomain.com`)
-   Vercel account
-   Domain registrar account (e.g., Hostinger, GoDaddy)

### Backend Setup (VM)

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/aryan-michael/armic-chat.git
    cd armic-chat/server
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Start the Server (using PM2):**

    ```bash
    npm install -g pm2
    pm2 start server.js --name server
    ```

4.  **Nginx Configuration:**

    * Create Nginx configuration files in `/etc/nginx/sites-available/` (see `nginx/sites-available/` in this repository for examples).
    * Create symbolic links in `/etc/nginx/sites-enabled/`.
    * Test and reload Nginx:

        ```bash
        sudo nginx -t
        sudo systemctl daemon-reload
        sudo systemctl restart nginx
        ```

5.  **Let's Encrypt (HTTPS):**

    ```bash
    sudo apt-get update
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d backend.yourdomain.com
    ```

### Frontend Setup (Vercel)

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/aryan-michael/armic-chat.git
    cd armic-chat/client
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Deploy to Vercel:**

    * Create a Vercel account and install the Vercel CLI.
    * Run `vercel` in the `client` directory.

4.  **Domain Configuration (Vercel):**

    * Add `chat.yourdomain.com` as a custom domain in your Vercel project settings.
    * Configure DNS records in your domain registrar as provided by Vercel.

5.  **Redirect Configuration (Vercel):**

    * In your Vercel project settings, add a redirect rule:
        * **Source:** `your-vercel-app.vercel.app`
        * **Destination:** `https://chat.yourdomain.com`
        * **Type:** 301 (Permanent Redirect)

### DNS Configuration (Domain Registrar)

-   Create a CNAME record for `chat.yourdomain.com` as provided by Vercel.
-   Create an A record for `backend.yourdomain.com` pointing to your VM's public IP address.

### CORS Configuration (Backend)

-   In `server/server.js`, configure CORS to allow requests from `https://chat.yourdomain.com`.

## Usage

1.  Access `chat.yourdomain.com` in your browser.
2.  Create or join a chat room.
3.  Set your alias.
4.  Start chatting!

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)