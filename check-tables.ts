import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
    const tables = ['profiles', 'stores', 'products', 'notifications', 'messages', 'sales_packages', 'purchases', 'reviews', 'group_classes']

    console.log('Checking tables...')

    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })

        if (error) {
            console.log(`❌ Table '${table}' does NOT exist or has error:`, error.message)
        } else {
            console.log(`✅ Table '${table}' exists.`)
        }
    }
}

checkTables()
