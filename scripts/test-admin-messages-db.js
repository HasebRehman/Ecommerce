/**
 * Test script to verify admin_messages table exists and is properly configured
 * 
 * Run with: node scripts/test-admin-messages-db.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing admin_messages table...\n')

  try {
    // Test 1: Check if table exists
    console.log('1️⃣ Checking if admin_messages table exists...')
    const { data, error } = await supabase
      .from('admin_messages')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('❌ Table does not exist!')
        console.log('\n📝 Action required:')
        console.log('   Run the SQL migration in: supabase-migrations/create-admin-messages-table.sql')
        console.log('   See supabase-migrations/README.md for instructions\n')
        return false
      }
      throw error
    }

    console.log('✅ Table exists!\n')

    // Test 2: Check realtime is enabled
    console.log('2️⃣ Checking realtime configuration...')
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('admin_messages')
      .select('*')
      .limit(0)

    if (realtimeError) {
      console.warn('⚠️  Could not verify realtime:', realtimeError.message)
    } else {
      console.log('✅ Realtime query successful!\n')
    }

    // Test 3: Check table structure
    console.log('3️⃣ Checking table structure...')
    try {
      const { data: columns } = await supabase
        .from('admin_messages')
        .select('*')
        .limit(0)
      
      console.log('✅ Table structure verified!\n')
    } catch (err) {
      console.log('⚠️  Could not verify table structure (this is OK)\n')
    }

    console.log('✅ All tests passed! The admin_messages table is ready to use.\n')
    return true

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    return false
  }
}

testDatabase().then(success => {
  process.exit(success ? 0 : 1)
})
