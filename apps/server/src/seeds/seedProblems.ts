import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { User } from '../models/User';
import { env } from '../config/env';
import { ALL_SEED_PROBLEMS } from './data';
import { SeedProblemData } from './types';

export { ALL_SEED_PROBLEMS };

export async function seedDatabase(forceClean = false): Promise<void> {
  // Production guard (Issue H-1 & L-3): requires explicit ALLOW_PROD_SEED=true in production
  if ((env.isProduction || process.env.NODE_ENV === 'production') && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error('[Seeder] ❌ Refusing to run database seeder in PRODUCTION mode without ALLOW_PROD_SEED=true!');
    process.exit(1);
  }

  try {
    console.log(`[Seeder] Synchronizing ${ALL_SEED_PROBLEMS.length} NeetCode 150 problems...`);

    if (forceClean) {
      console.log('[Seeder] Force clean requested: Clearing existing Problems and TestCases...');
      await Problem.deleteMany({});
      await TestCase.deleteMany({});
    }

    let seededCount = 0;
    let totalTestCases = 0;

    for (const probData of ALL_SEED_PROBLEMS) {
      const { testCases, ...problemFields } = probData;

      let problemDoc = await Problem.findOne({ problemCode: probData.problemCode });

      if (!problemDoc) {
        problemDoc = await Problem.create(problemFields);
        seededCount++;
      } else {
        await Problem.updateOne({ _id: problemDoc._id }, { $set: problemFields });
      }

      const existingTcCount = await TestCase.countDocuments({ problem: problemDoc._id });
      if (existingTcCount < testCases.length || forceClean) {
        await TestCase.deleteMany({ problem: problemDoc._id });
        const testCaseDocs = testCases.map((tc, index) => ({
          problem: problemDoc!._id,
          input: tc.input,
          output: tc.output,
          isSample: tc.isSample,
          order: index + 1,
        }));
        await TestCase.insertMany(testCaseDocs);
        totalTestCases += testCaseDocs.length;
      } else {
        totalTestCases += existingTcCount;
      }
    }

    // Seed default Admin user with configurable password
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@entropy.dev';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!adminPassword && env.isProduction) {
      console.warn('[Seeder] ⚠️ In production mode, ADMIN_SEED_PASSWORD is required to provision the admin user. Skipping admin creation.');
    } else {
      const effectivePassword = adminPassword || (env.isProduction ? undefined : 'DevAdmin@2026!');
      if (effectivePassword) {
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
          await User.create({
            fullName: 'Judge Administrator',
            email: adminEmail,
            password: effectivePassword,
            role: 'admin',
          });
          console.log(`  ✔ Created Admin User: ${adminEmail} (Configured via ADMIN_SEED_PASSWORD)`);
        } else if (existingAdmin.role !== 'admin') {
          existingAdmin.role = 'admin';
          await existingAdmin.save();
          console.log(`  ✔ Promoted existing user to Admin: ${adminEmail}`);
        }
      }
    }

    console.log(`[Seeder] ✅ Database sync completed: ${ALL_SEED_PROBLEMS.length} problems verified/seeded (${totalTestCases} total test cases).`);
  } catch (error) {
    console.error('[Seeder] ❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Automatically invoked on server startup to guarantee reproducibility across all local sessions.
 */
export async function ensureProblemsSeeded(): Promise<void> {
  if (env.isProduction) {
    console.log('[AutoSeeder] Production environment detected; skipping automatic database seeding.');
    return;
  }
  try {
    const count = await Problem.countDocuments();
    if (count < ALL_SEED_PROBLEMS.length) {
      console.log(`[AutoSeeder] Detected ${count}/${ALL_SEED_PROBLEMS.length} problems in database. Synchronizing full NeetCode 150 problem set...`);
      await seedDatabase(false);
    } else {
      console.log(`[AutoSeeder] ✅ Verified all ${count} problems present in database.`);
    }
  } catch (error: any) {
    console.warn(`[AutoSeeder] Warning during automatic problem check: ${error.message}`);
  }
}

// Execute seeding if run directly
if (require.main === module) {
  (async () => {
    try {
      console.log('[Seeder] Connecting to MongoDB at:', env.MONGO_URI);
      await mongoose.connect(env.MONGO_URI);
      await seedDatabase(true);
    } catch (err) {
      console.error('[Seeder] Fatal error:', err);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('[Seeder] MongoDB connection closed.');
    }
  })();
}
