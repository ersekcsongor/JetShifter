/**
 * Migration Script: Merge Airports and GlobalAirports collections
 *
 * This script:
 * 1. Reads all airports from both collections
 * 2. Merges them into a unified structure
 * 3. Creates a new 'UnifiedAirports' collection
 * 4. Preserves all original data
 *
 * Run with: npx ts-node src/scripts/merge-airports.ts
 */

import mongoose from 'mongoose';

// Connection string - update if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://erscsongi123:VX30DqsZW2qIRoSS@jetshifter.nuozs.mongodb.net/?retryWrites=true&w=majority&appName=JetShifter';

interface RyanairAirport {
  iataCode: string;
  name: string;
  countryCode: string;
  cityCode: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

interface GlobalAirport {
  iataCode: string;
  name: string;
  countryCode: string;
  cityCode: string;
  timeZone: string;
  countryName: string;
}

interface UnifiedAirport {
  iataCode: string;
  name: string;
  countryCode: string;
  cityCode: string;
  timeZone: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  ryanairRoutes: string[];
  isRyanairAirport: boolean;
}

async function mergeAirports() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Read from both collections
    console.log('\n📖 Reading Ryanair airports (Airports collection)...');
    const ryanairAirports = await db.collection('Airports').find({}).toArray() as unknown as RyanairAirport[];
    console.log(`   Found ${ryanairAirports.length} Ryanair airports`);

    console.log('📖 Reading Global airports (GlobalAirports collection)...');
    const globalAirports = await db.collection('GlobalAirports').find({}).toArray() as unknown as GlobalAirport[];
    console.log(`   Found ${globalAirports.length} Global airports`);

    // Create a map for merging
    const airportMap = new Map<string, UnifiedAirport>();

    // First, add all Ryanair airports
    console.log('\n🔄 Processing Ryanair airports...');
    for (const airport of ryanairAirports) {
      airportMap.set(airport.iataCode, {
        iataCode: airport.iataCode,
        name: airport.name,
        countryCode: airport.countryCode,
        cityCode: airport.cityCode,
        timeZone: airport.timeZone,
        latitude: airport.latitude,
        longitude: airport.longitude,
        ryanairRoutes: airport.routes || [],
        isRyanairAirport: true,
      });
    }

    // Then, add or merge Global airports
    console.log('🔄 Processing Global airports...');
    let merged = 0;
    let added = 0;
    for (const airport of globalAirports) {
      const existing = airportMap.get(airport.iataCode);
      if (existing) {
        // Merge: add countryName from global to existing Ryanair airport
        existing.countryName = airport.countryName;
        merged++;
      } else {
        // New airport from Global
        airportMap.set(airport.iataCode, {
          iataCode: airport.iataCode,
          name: airport.name,
          countryCode: airport.countryCode,
          cityCode: airport.cityCode,
          timeZone: airport.timeZone,
          countryName: airport.countryName,
          ryanairRoutes: [],
          isRyanairAirport: false,
        });
        added++;
      }
    }

    console.log(`   Merged ${merged} airports (existed in both)`);
    console.log(`   Added ${added} new airports (only in Global)`);

    // Convert map to array
    const unifiedAirports = Array.from(airportMap.values());
    console.log(`\n📊 Total unified airports: ${unifiedAirports.length}`);

    // Backup original collections by renaming
    console.log('\n💾 Creating backups...');
    try {
      await db.collection('Airports').rename('Airports_backup');
      console.log('   ✅ Airports → Airports_backup');
    } catch (e: any) {
      if (e.codeName === 'NamespaceExists') {
        console.log('   ⚠️ Airports_backup already exists, skipping backup');
      } else {
        throw e;
      }
    }

    try {
      await db.collection('GlobalAirports').rename('GlobalAirports_backup');
      console.log('   ✅ GlobalAirports → GlobalAirports_backup');
    } catch (e: any) {
      if (e.codeName === 'NamespaceExists') {
        console.log('   ⚠️ GlobalAirports_backup already exists, skipping backup');
      } else {
        throw e;
      }
    }

    // Insert unified data into new Airports collection
    console.log('\n📥 Inserting unified airports into Airports collection...');
    if (unifiedAirports.length > 0) {
      await db.collection('Airports').insertMany(unifiedAirports);
      console.log(`   ✅ Inserted ${unifiedAirports.length} airports`);
    }

    // Create index on iataCode
    console.log('\n🔧 Creating index on iataCode...');
    await db.collection('Airports').createIndex({ iataCode: 1 }, { unique: true });
    console.log('   ✅ Index created');

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Ryanair airports: ${ryanairAirports.length}`);
    console.log(`   - Global airports: ${globalAirports.length}`);
    console.log(`   - Merged (duplicates): ${merged}`);
    console.log(`   - Total unified: ${unifiedAirports.length}`);
    console.log(`   - Ryanair-enabled: ${unifiedAirports.filter(a => a.isRyanairAirport).length}`);
    console.log('\n💡 Backups saved as: Airports_backup, GlobalAirports_backup');
    console.log('   You can delete these after verifying the migration.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

mergeAirports();
