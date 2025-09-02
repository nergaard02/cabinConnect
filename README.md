# Cabin App

# Running the Project Locally

The project can currently only be run locally in **development mode**. This setup is useful for development and testing purposes. The frontend is served on port 5173 and the backend is served on port 8000. Things to note:

- When running locally, Django will use SQLite as the database.
- All traffic will go through HTTP.
- The frontend will run in development mode, which means it will use hot reloading and debug tools.
- The backend will run using Django's built-in development server.

## Running backend locally:
Requires Python 3.8 or higher and pip. It is recommended to use a virtual environment to avoid conflicts with other projects.
If the python3 command is not available, use python instead. If the pip3 command is not available, use pip instead.
1. Change directory to backend `cd /path/to/project/web_app/backend`
2. (Optional but recommended) Create virtual environment in the backend folder `python3 -m venv ./myenv`
3. (Optional but recommended) Activate the virtual environment 
    - Windows: `./myenv/Scripts/Activate`
    - Linux/MacOS: `source ./myenv/bin/activate`
4. Install the dependencies `pip3 install -r requirements.txt`
5. Create and migrate the database `python3 manage.py migrate`
6. Run the server `python3 manage.py runserver`
7. When finished, stop the server `Ctrl + C` in the terminal where the server is running.
8. (Optional but recommended) Deactivate the virtual environment `deactivate`
9. (Optional but recommended) Delete the virtual environment `rm -rf ./myenv` (Linux/MacOS) or `rmdir /s /q myenv` (Windows)

## Running frontend locally:
Requires Node.js and npm installed. Follow the instructions on the [Node.js website](https://nodejs.org/en/download/) to install Node.js and npm.
1. Change directory to frontend `cd /path/to/project/web_app/frontend`
2. Install the dependencies `npm install --save-dev`
3. Start the development server `npm run dev`
4. Open the browser and go to `http://localhost:5173/` (Requires the backend to be running on port 8000)
5. When finished, stop the server `Ctrl + C` in the terminal where the server is running.

# How to Use the Application

Start by either registering or logging in

If you don't have an account, follow the **Registering an Account** instructions below.

## Registering and Verifying an Account

1. On the landing page, click **Sign in**.  
2. Navigate to the **Register** tab and fill out all required fields.  
3. After submitting the form, you will be redirected to the **Verification page**.  
   - A **6-digit verification code** will be displayed in the terminal where your backend is running.  
   - Enter this code on the verification page to activate your account.  
4. If you are unable to verify within **15 minutes**, use the backup verification link that was printed in the backend terminal along with the 6-digit code.  
5. Once verified, you will be redirected to the **Login page**. Log in with your newly created credentials (**username** and **password**).  
