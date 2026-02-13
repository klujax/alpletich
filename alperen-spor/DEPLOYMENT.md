# Deployment Instructions for Alperen Spor

## Prerequisites
Before deploying the application, ensure that you have the following installed:
- Node.js (version X.X.X or higher)
- npm (version X.X.X or higher)
- A Supabase account and project set up

## Environment Variables
Create a `.env.local` file in the root of the project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase project credentials.

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/alperen-spor.git
   cd alperen-spor
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Running the Application
To start the development server, run:
```
npm run dev
```
The application will be available at `http://localhost:3000`.

## Building for Production
To create an optimized production build, run:
```
npm run build
```

## Deploying to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and sign in.
3. Import your GitHub repository.
4. Set up the environment variables in the Vercel dashboard under the "Environment Variables" section.
5. Deploy the application.

## Additional Notes
- Ensure that your Supabase database is properly configured and that all necessary migrations have been applied.
- For any issues, refer to the README.md file for troubleshooting steps or contact support.

This document will be updated as the project evolves.