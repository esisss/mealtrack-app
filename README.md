[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=000000)](https://orm.drizzle.team/)
[![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=000000)](https://neon.tech/)
[![Stack Auth](https://img.shields.io/badge/Stack_Auth-000000?style=for-the-badge&logo=stackauth&logoColor=white)](https://stack-auth.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[Live Demo](https://mealtrack-app.vercel.app/)

# MealTrack 🍲

MealTrack is a modern, full-stack web application designed to help you manage your pantry, plan your meals, and track your grocery shopping with ease. Built with performance and developer experience in mind.

## Why MealTrack?

Planning meals every week often leads to duplicated groceries, forgotten ingredients, and wasted food.
MealTrack was built to solve this by combining recipe management, meal planning, and stock control in one place.

## Features

- 📚 Save and organize personal recipes
- 🗓️ Plan weekly meal schedules
- 🛒 Automatically generate grocery lists based on planned meals
- 📦 Track ingredient stock to avoid overbuying

## 🚀 Vision & Contributions

This project is open-source and I **strongly encourage** contributions! Whether it's fixing a bug, adding a new feature, or improving documentation, your help is welcome.

Feel free to fork this repository, make your changes, and submit a Pull Request. If you have ideas or feedback, don't hesitate to open an issue.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Stack Auth](https://stack-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🏗️ Database Architecture & Flexibility

One of the core design principles of MealTrack is its flexible **Data Access Layer (DAL)**.

> [!IMPORTANT]
> By default, this project uses **Neon** and **Drizzle ORM**. However, you are not locked in!
>
> People can download this project and just add their own Database. While I recommend sticking to Neon or a PostgreSQL-compatible database to keep the DAL logic intact, you can modify the code to adjust it to your specific needs.
>
> If you use any PostgreSQL-compatible DB with Drizzle, the `dal/` and `db/` files should work with minimal to no changes.

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (Recommended package manager)
- A PostgreSQL database (Neon, local Postgres, Supabase, etc.)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/mealtrack-app.git
   cd mealtrack-app
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env.development` file in the root directory (using `.env.example` as a template if available, or based on the variables below):

   ```env
   DATABASE_URL=your_postgres_connection_string
   NEXT_PUBLIC_STACK_PROJECT_ID=...
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
   STACK_SECRET_SERVER_KEY=...
   # Add any other required keys (e.g., Cloudinary if used)
   ```

4. **Initialize Database**:

   ```bash
   pnpm db:generate
   pnpm db:push:dev
   ```

5. **Run Development Server**:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app in action.

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (using Radix and Tailwind).
- `dal/`: Data Access Layer—pure functions for interacting with the DB.
- `db/`: Drizzle schema definitions and migrations.
- `lib/`: Shared utility functions and configurations.
- `public/`: Static assets.

## 📅 Roadmap

We are constantly working to improve MealTrack. Here is what we have in the backlog for the near future:

- **📊 Nutritional Tracking (Short Term)**: We'll be adding a calorie counter and support for other nutritional values (protein, carbs, fats) directly to pantry items and recipes.
- **🤖 AI-Powered Recipe Generation (Long Term)**: Use LLMs to generate creative recipe solutions based on your currently available stock.
- **🌐 Recipe Scraping (Long Term)**: Automatically import recipes from social media posts, videos, and other platforms to your personal collection.
- **💡 Smart Suggestions**: Improved logic for suggesting recipes based on expiring stock.
- **📱 Mobile Optimization**: Further refining the PWA experience for seamless on-the-go pantry management.

## 📄 License

This project is licensed under the MIT License. Feel free to use it, modify it, and share it!
