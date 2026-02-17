# EBOOK Web App 2.0 - Next.js Version

A modern financial management web application built with Next.js, PostgreSQL, and Tailwind CSS. This application helps businesses track sales, expenses, pending payments, and loans with comprehensive reporting and alert features.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Dashboard**: Real-time financial overview with daily, monthly, and yearly statistics
- **Sales Management**: Track sales with payment modes and notes
- **Expense Tracking**: Categorize and monitor business expenses
- **Pending Payments**: Manage customer pending payments with due dates
- **Loan Management**: Track loans with payment recording and due date alerts
- **Comprehensive Reports**: Daily, weekly, monthly, and yearly reports for all financial data
- **Alert System**: Automatic warnings for financial issues (expenses > income, continuous losses, loans due soon)
- **Responsive Design**: Mobile-friendly interface with modern gradient styling

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Installation

1. **Clone the repository** (or navigate to the Ebook-SCS directory):

   ```bash
   cd Ebook-SCS
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ebook_db
   JWT_SECRET=your-secret-key-change-in-production
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Create PostgreSQL database**:

   ```sql
   CREATE DATABASE ebook_db;
   ```

5. **Run the development server**:

   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Ebook-SCS/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/         # Login endpoint
│   │   │   └── signup/        # Signup endpoint
│   │   ├── sales/             # Sales CRUD operations
│   │   ├── expenses/          # Expenses CRUD operations
│   │   ├── pending-payments/  # Pending payments CRUD operations
│   │   ├── loans/             # Loans CRUD operations
│   │   │   └── [id]/pay/      # Loan payment endpoint
│   │   ├── dashboard/         # Dashboard statistics
│   │   ├── alerts/            # Financial alerts
│   │   ├── reports/           # Report endpoints
│   │   │   ├── sales/         # Sales reports
│   │   │   └── expenses/      # Expenses reports
│   │   └── profile/           # User profile management
│   ├── dashboard/             # Dashboard page
│   ├── sales/                 # Sales management page
│   ├── expenses/              # Expenses management page
│   ├── pending-payments/      # Pending payments page
│   ├── loans/                 # Loans management page
│   ├── reports/               # Reports pages
│   │   ├── sales/
│   │   ├── expenses/
│   │   ├── pending-payments/
│   │   └── loans/
│   ├── layout.js              # Root layout
│   ├── page.js                # Home/Login page
│   └── globals.css            # Global styles
├── lib/
│   ├── db.js                  # Database connection
│   └── auth.js                # Authentication utilities
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user and get JWT token

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile image

### Sales

- `POST /api/sales` - Add new sale
- `GET /api/sales` - Get all sales

### Expenses

- `POST /api/expenses` - Add new expense
- `GET /api/expenses` - Get all expenses

### Pending Payments

- `POST /api/pending-payments` - Add new pending payment
- `GET /api/pending-payments` - Get all pending payments

### Loans

- `POST /api/loans` - Add new loan
- `GET /api/loans` - Get all loans
- `PUT /api/loans/[id]/pay` - Record loan payment

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

### Alerts

- `GET /api/alerts` - Get financial alerts

### Reports

- `GET /api/reports/sales?period=daily|weekly|monthly|yearly` - Get sales report
- `GET /api/reports/expenses?period=daily|weekly|monthly|yearly` - Get expenses report

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Table

```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode VARCHAR(10) CHECK (payment_mode IN ('cash', 'upi', 'card')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Pending Payments Table

```sql
CREATE TABLE pending_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Loans Table

```sql
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lender_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

1. **Sign Up**: Create a new account with username, email, phone, and password
2. **Login**: Use your email and password to access the dashboard
3. **Dashboard**: View your financial overview and alerts
4. **Add Sales**: Record sales with date, amount, payment mode, and notes
5. **Add Expenses**: Track expenses with category and description
6. **Manage Pending Payments**: Add and track customer pending payments
7. **Manage Loans**: Add loans and record payments
8. **View Reports**: Generate reports for different time periods

## Building for Production

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## Security Notes

- Change the `JWT_SECRET` in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use HTTPS in production
- Regularly update dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Next.js and PostgreSQL**
