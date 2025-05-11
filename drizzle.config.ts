// import type { Config} from 'drizzle-kit'
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config({path: '.env'})

// export default {
//     driver: 'pg',
//     schema: './src/lib/db/schema.ts',
//     out: './src/migrations',
//     dbCredentials: {
//         connectionString: process.env.DATABASE_URL || ''
//     }
// } satisfies Config

// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/migrations',
  schema: './src/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
