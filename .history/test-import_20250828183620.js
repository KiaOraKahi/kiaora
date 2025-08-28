// Test import
try {
  const AdminContentManagement = require('./components/admin/admin-content-management.tsx').default;
  console.log('Import successful:', typeof AdminContentManagement);
} catch (error) {
  console.error('Import failed:', error.message);
}
