# Import Match Data - Step by Step Instructions

## Quick Start

### Option 1: Using Virtual Environment (Recommended)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Run import script
python scripts/import_match_data.py --season 2025-2026 --data-dir data
```

### Option 2: Using System Python (if dependencies installed globally)

```bash
cd backend
python3 scripts/import_match_data.py --season 2025-2026 --data-dir data
```

---

## What to Expect

The script will:

1. **Create database tables** (if they don't exist)
   - You'll see: `[PL DB] Creating PL database tables...`
   - Then: `[PL DB] PL database tables created successfully`

2. **Process match files**
   - Shows progress: `[1/122] Processing: match_2025_08_15_Liverpool_vs_Bournemouth.json`
   - For each match: `✓ Imported: filename.json`

3. **Show summary**
   ```
   ============================================================
   Import Summary
   ============================================================
   Total matches processed: 122
   Successfully imported: 122
   Errors: 0
   ============================================================
   ```

---

## Troubleshooting

### "Module not found" errors

**Solution:** Make sure virtual environment is activated and dependencies are installed:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Database connection error"

**Solution:** Check your `.env` file has `DATABASE_URL` set:

```bash
# In backend/.env
DATABASE_URL=postgresql://user:password@host:port/database
```

### "Data directory not found"

**Solution:** Make sure you're in the `backend` directory and data files exist:

```bash
ls backend/data/2025-2026/matches/*.json | wc -l
# Should show: 122
```

---

## After Import

Once import completes successfully:

1. ✅ **Verify data** - Check the summary shows all matches imported
2. ✅ **Test APIs** - Visit `/match-data-test` page
3. ✅ **Check database** - Query matches to verify

---

## Next Steps

After successful import:
- Test frontend at `/match-data-test`
- Verify APIs are working
- Start building production features

---

**Ready to import!** Run the commands above in your terminal.

