const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.szfpfpimovdgmrixpovj:smartsaving123%40@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require',
});

async function cleanup() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    // Find garbage users
    const res = await client.query(`
      SELECT nd.id FROM nguoi_dung nd 
      LEFT JOIN tai_khoan tk ON nd.id = tk.nguoi_dung_id 
      WHERE tk.email IS NULL OR trim(tk.email) = ''
    `);
    const garbageIds = res.rows.map(r => r.id);
    
    if (garbageIds.length === 0) {
      console.log('No garbage users found.');
      return;
    }

    console.log(`Found ${garbageIds.length} garbage users:`, garbageIds);

    const idsStr = garbageIds.join(',');

    await client.query('BEGIN');

    // 1. PhieuRut
    const res1 = await client.query(`DELETE FROM phieu_rut WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (${idsStr}))`);
    console.log(`Deleted ${res1.rowCount} PhieuRut`);

    // 2. PhieuGoi
    const res2 = await client.query(`DELETE FROM phieu_goi WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (${idsStr}))`);
    console.log(`Deleted ${res2.rowCount} PhieuGoi`);

    // 3. LichSuGiaoDich
    const res3 = await client.query(`DELETE FROM lich_su_giao_dich WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (${idsStr}))`);
    console.log(`Deleted ${res3.rowCount} LichSuGiaoDich`);

    // 4. SoTietKiem
    const res4 = await client.query(`DELETE FROM so_tiet_kiem WHERE khach_hang_id IN (${idsStr})`);
    console.log(`Deleted ${res4.rowCount} SoTietKiem`);

    // 5. TaiKhoan
    const res5 = await client.query(`DELETE FROM tai_khoan WHERE nguoi_dung_id IN (${idsStr})`);
    console.log(`Deleted ${res5.rowCount} TaiKhoan`);

    // 6. NguoiDung
    const res6 = await client.query(`DELETE FROM nguoi_dung WHERE id IN (${idsStr})`);
    console.log(`Deleted ${res6.rowCount} NguoiDung`);

    await client.query('COMMIT');
    console.log('Cleanup completed successfully!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during cleanup:', err);
  } finally {
    await client.end();
  }
}

cleanup();
