const { pool } = require('../config/db.config');

const updateConstraints = async () => {
    try {
        console.log('Updating database constraints...');

        // 0. Migrate existing data
        console.log('Migrating existing "pending" status to "NEED CLARITY"...');
        await pool.query(`
            UPDATE delegation 
            SET status = 'NEED CLARITY' 
            WHERE status = 'pending';
        `);

        // 1. Drop existing constraint
        await pool.query(`
            ALTER TABLE delegation 
            DROP CONSTRAINT IF EXISTS delegation_status_check;
        `);

        // 2. Add updated constraint
        await pool.query(`
            ALTER TABLE delegation 
            ADD CONSTRAINT delegation_status_check 
            CHECK (status IN ('NEED CLARITY', 'APPROVAL WAITING', 'COMPLETED', 'NEED REVISION', 'HOLD'));
        `);

        console.log('✅ Database constraints updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating database constraints:', err);
        process.exit(1);
    }
};

updateConstraints();
