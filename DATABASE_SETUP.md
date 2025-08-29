# Database Setup Guide for Ruscle Website

This guide will help you set up the PostgreSQL database for your Ruscle website project.

## Prerequisites

- PostgreSQL installed and running
- Node.js and pnpm/npm installed
- Access to create databases and users

## 1. Database Setup

### Install PostgreSQL

**Windows:**
- Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)
- Or use Chocolatey: `choco install postgresql`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE ruscle_website;

-- Create user (replace with your desired username/password)
CREATE USER ruscle_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ruscle_website TO ruscle_user;

-- Connect to the new database
\c ruscles_website

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ruscles_user;

-- Exit
\q
```

## 2. Environment Configuration

### Create `.env.local` file

Create a `.env.local` file in your project root with the following content:

```env
# Database Configuration
DATABASE_URL="postgresql://ruscles_user:your_secure_password@localhost:5432/ruscles_website"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:** Replace `ruscles_user`, `your_secure_password`, and `your-secret-key-here` with your actual values.

## 3. Database Migration and Setup

### Install Dependencies

```bash
pnpm install
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Seed the Database

```bash
# Option 1: Use the API endpoint
curl -X POST http://localhost:3000/api/db/seed

# Option 2: Use Prisma Studio to manually add data
npx prisma studio
```

## 4. Database Schema Overview

The database includes the following main models:

- **Users**: Admin users and editors
- **FormSubmissions**: Contact forms and inquiries
- **FormResponses**: Responses to form submissions
- **ContentItems**: Blog posts, testimonials, portfolio items
- **BlogPosts**: Extended blog post information
- **Testimonials**: Customer testimonials
- **PortfolioItems**: Project portfolio items
- **PageContent**: Static page content
- **Notifications**: System and user notifications
- **BusinessInfo**: Company information
- **Settings**: Application settings

## 5. API Endpoints

The following API endpoints are available for database management:

- `GET /api/db/health` - Check database health and get statistics
- `POST /api/db/seed` - Seed database with initial data
- `POST /api/db/reset` - Reset database (development only)

## 6. Development Workflow

### Making Schema Changes

1. Modify `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name description`
3. Apply migration: `npx prisma migrate deploy`
4. Update Prisma client: `npx prisma generate`

### Viewing Data

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to view and edit your data.

### Database Reset (Development)

```bash
# Reset all data
curl -X POST http://localhost:3000/api/db/reset

# Re-seed with initial data
curl -X POST http://localhost:3000/api/db/seed
```

## 7. Production Deployment

### Environment Variables

For production, ensure your environment variables are properly set:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
```

### Database Migrations

```bash
npx prisma migrate deploy
```

### Connection Pooling

For production, consider using connection pooling:

```env
DATABASE_URL="postgresql://username:password@host:port/database?connection_limit=5&pool_timeout=2"
```

## 8. Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check if the port (5432) is correct
   - Verify firewall settings

2. **Authentication Failed**
   - Check username and password in DATABASE_URL
   - Verify user has proper permissions

3. **Database Does Not Exist**
   - Create the database: `CREATE DATABASE ruscles_website;`
   - Check database name in DATABASE_URL

4. **Permission Denied**
   - Grant proper privileges to the user
   - Check if user has access to the schema

### Useful Commands

```bash
# Check database connection
npx prisma db pull

# View current schema
npx prisma format

# Reset database (development)
npx prisma migrate reset

# Generate types
npx prisma generate
```

## 9. Security Considerations

- Never commit `.env.local` to version control
- Use strong, unique passwords for database users
- Limit database user privileges to only what's necessary
- Regularly update PostgreSQL and dependencies
- Use SSL connections in production

## 10. Performance Tips

- Add database indexes for frequently queried fields
- Use connection pooling in production
- Monitor query performance with `npx prisma studio`
- Consider read replicas for heavy read workloads

## Support

If you encounter issues:

1. Check the Prisma documentation: https://www.prisma.io/docs/
2. Review the error logs in your terminal
3. Verify your database connection and credentials
4. Check if all required services are running

---

**Note:** This setup uses PostgreSQL as the primary database. If you prefer a different database (MySQL, SQLite), you can modify the `provider` in `prisma/schema.prisma` and adjust the connection string accordingly.
