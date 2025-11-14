# Testing Guide

## Manual Testing Checklist

### Prerequisites
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:8080
- [ ] PostgreSQL container running
- [ ] Groq API key configured

---

## Test Suite 1: File Upload

### Test 1.1: CSV Upload
**Steps:**
1. Prepare a CSV file (e.g., `test.csv` with columns: id, name, value)
2. Drag and drop the file onto the upload area
3. Wait for upload to complete

**Expected Results:**
- ✅ Upload progress bar appears
- ✅ Success toast notification: "Successfully uploaded test.csv"
- ✅ Table appears in left sidebar with correct row count
- ✅ Table name matches original filename
- ✅ Backend logs show table creation and data insertion

### Test 1.2: Excel Upload (Single Sheet)
**Steps:**
1. Prepare an Excel file with one sheet
2. Upload the file

**Expected Results:**
- ✅ Upload completes successfully
- ✅ One table created
- ✅ All columns detected correctly

### Test 1.3: Excel Upload (Multiple Sheets)
**Steps:**
1. Prepare an Excel file with 2-3 sheets
2. Upload the file

**Expected Results:**
- ✅ Multiple tables created (one per sheet)
- ✅ Each table has unique name with sheet name included
- ✅ All sheets' data imported correctly

### Test 1.4: Invalid File Type
**Steps:**
1. Try to upload a .txt or .pdf file

**Expected Results:**
- ✅ Error toast: "Please upload a CSV or Excel file"
- ✅ No upload initiated

### Test 1.5: Large File
**Steps:**
1. Upload a CSV with 10,000+ rows

**Expected Results:**
- ✅ Upload completes (if under 50MB)
- ✅ Correct row count displayed
- ✅ Table is queryable

---

## Test Suite 2: Table Management

### Test 2.1: View Tables List
**Steps:**
1. Upload 2-3 different files
2. Observe the tables list

**Expected Results:**
- ✅ All tables displayed in sidebar
- ✅ Each shows: name, row count, column count
- ✅ Most recent upload at the top

### Test 2.2: View Table Schema
**Steps:**
1. Click on a table in the list

**Expected Results:**
- ✅ Table card expands
- ✅ "Schema" section appears
- ✅ All columns listed with correct types
- ✅ Data types shown (TEXT, INTEGER, NUMERIC, etc.)

### Test 2.3: Delete Table
**Steps:**
1. Click trash icon on a table
2. Confirm deletion in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirmation, success toast appears
- ✅ Table removed from list
- ✅ Backend logs show table dropped
- ✅ Database no longer has the table

### Test 2.4: Delete Table (Cancel)
**Steps:**
1. Click trash icon
2. Click "Cancel" in dialog

**Expected Results:**
- ✅ Dialog closes
- ✅ Table remains in list
- ✅ No backend action taken

---

## Test Suite 3: Natural Language Queries

### Test 3.1: Basic SELECT
**Query:** "Show me the first 10 rows"

**Expected Results:**
- ✅ SQL generated: `SELECT * FROM table_name LIMIT 10`
- ✅ Results table shows 10 rows
- ✅ All columns displayed
- ✅ Execution time shown
- ✅ Row count shown

### Test 3.2: Aggregation
**Query:** "What is the average of the price column?"

**Expected Results:**
- ✅ SQL contains `AVG("price")`
- ✅ Result shows single row with average value
- ✅ Column name is descriptive (e.g., "avg")

### Test 3.3: Filtering
**Query:** "Show records where status is 'active'"

**Expected Results:**
- ✅ SQL contains `WHERE "status" = 'active'`
- ✅ Results only include matching rows
- ✅ Correct number of filtered rows

### Test 3.4: Grouping
**Query:** "Count rows by category"

**Expected Results:**
- ✅ SQL contains `GROUP BY "category"`
- ✅ Results show each category with count
- ✅ All categories included

### Test 3.5: Ordering
**Query:** "Show top 5 highest prices"

**Expected Results:**
- ✅ SQL contains `ORDER BY "price" DESC LIMIT 5`
- ✅ Results in descending order
- ✅ Exactly 5 rows returned

### Test 3.6: Empty Table Query
**Steps:**
1. Upload empty CSV (headers only)
2. Query: "Show all rows"

**Expected Results:**
- ✅ Query executes without error
- ✅ Results show 0 rows
- ✅ Column headers still displayed

### Test 3.7: Query with No Tables
**Steps:**
1. Delete all tables
2. Try to submit a query

**Expected Results:**
- ✅ Error toast: "Please upload a table first"
- ✅ Query not sent to backend

### Test 3.8: Large Result Set (>100 rows)
**Steps:**
1. Upload file with 500+ rows
2. Query: "Show all rows"

**Expected Results:**
- ✅ Results truncated to 100 rows
- ✅ Warning shown: "Results truncated"
- ✅ AI summary section appears
- ✅ Summary describes the data
- ✅ Total row count shows full amount (e.g., 500)

---

## Test Suite 4: Multi-Table Queries

### Test 4.1: Query All Tables (Default)
**Steps:**
1. Upload 2 tables
2. Submit query without selecting specific tables

**Expected Results:**
- ✅ Query sent with `table_ids: null`
- ✅ Backend considers all tables
- ✅ Results may include data from any table

### Test 4.2: Query Specific Table
**Steps:**
1. Upload 2 tables
2. Select one table from dropdown
3. Submit query

**Expected Results:**
- ✅ Dropdown shows "1 table"
- ✅ Query sent with specific table ID
- ✅ Results only from selected table

### Test 4.3: Query Multiple Tables
**Steps:**
1. Upload 3 tables
2. Select 2 tables from dropdown
3. Submit query: "Join data from both tables"

**Expected Results:**
- ✅ Dropdown shows "2 tables"
- ✅ Query sent with array of 2 table IDs
- ✅ LLM generates appropriate JOIN query
- ✅ Results combine data correctly

---

## Test Suite 5: Results Display & Export

### Test 5.1: View Results
**Steps:**
1. Execute any successful query

**Expected Results:**
- ✅ Results animate in smoothly
- ✅ SQL query shown in code block
- ✅ Results table properly formatted
- ✅ Metadata shows: row count, execution time
- ✅ Null values shown as "null" in italic

### Test 5.2: Export to CSV
**Steps:**
1. Execute query with results
2. Click "Export CSV" button

**Expected Results:**
- ✅ CSV file downloads
- ✅ Filename format: `query-results-{timestamp}.csv`
- ✅ File contains all displayed results
- ✅ Headers match column names
- ✅ Data properly formatted

### Test 5.3: AI Summary Display
**Steps:**
1. Query that returns >100 rows

**Expected Results:**
- ✅ Summary section appears with sparkle icon
- ✅ Summary is 2-3 sentences
- ✅ Summary mentions key patterns or insights
- ✅ Summary is contextually relevant to query

---

## Test Suite 6: Error Handling

### Test 6.1: Backend Offline
**Steps:**
1. Stop backend server
2. Try to upload file or query

**Expected Results:**
- ✅ Error toast with connection error message
- ✅ No crash or blank screen
- ✅ Loading states end properly

### Test 6.2: Invalid Query
**Query:** "Delete all records"

**Expected Results:**
- ✅ Backend validation catches non-SELECT
- ✅ Error toast shown
- ✅ Error message mentions "valid SELECT query"

### Test 6.3: Database Error
**Steps:**
1. Stop PostgreSQL container
2. Try to query

**Expected Results:**
- ✅ Error caught by backend
- ✅ Meaningful error message to frontend
- ✅ Toast notification with error

### Test 6.4: Invalid Table ID
**Steps:**
1. Manually call API with fake table ID (use browser console)
   ```js
   fetch('http://localhost:8000/api/tables/fake-id-123')
   ```

**Expected Results:**
- ✅ 404 error returned
- ✅ Error message: "Table not found"

---

## Test Suite 7: UI/UX

### Test 7.1: Responsive Design
**Steps:**
1. Resize browser window to mobile size
2. Test all features

**Expected Results:**
- ✅ Layout adapts to smaller screen
- ✅ All buttons accessible
- ✅ Tables scroll horizontally if needed
- ✅ No overlapping elements

### Test 7.2: Loading States
**Steps:**
1. Upload large file
2. Execute complex query
3. Observe loading indicators

**Expected Results:**
- ✅ Upload shows progress bar
- ✅ Query button shows "Processing..."
- ✅ Query button disabled during execution
- ✅ Loading spinners where appropriate

### Test 7.3: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter to submit query
3. Use Shift+Enter in query textarea

**Expected Results:**
- ✅ Focus indicators visible
- ✅ Enter submits query
- ✅ Shift+Enter adds new line
- ✅ All interactive elements accessible

### Test 7.4: Toast Notifications
**Steps:**
1. Trigger various success/error scenarios
2. Observe toast messages

**Expected Results:**
- ✅ Success toasts are green/positive
- ✅ Error toasts are red/warning color
- ✅ Toasts auto-dismiss after few seconds
- ✅ Multiple toasts stack properly
- ✅ Toast descriptions provide detail

---

## Test Suite 8: Data Type Handling

### Test 8.1: Integer Data
**Steps:**
1. Upload CSV with integer column
2. Query: "Show average of the integer column"

**Expected Results:**
- ✅ Column detected as INTEGER type
- ✅ Aggregation works correctly
- ✅ Results show numeric values

### Test 8.2: Date Data
**Steps:**
1. Upload file with date column (YYYY-MM-DD format)
2. Query: "Filter dates after 2025-01-01"

**Expected Results:**
- ✅ Column detected as DATE type
- ✅ Date filtering works
- ✅ Dates displayed in readable format

### Test 8.3: Boolean Data
**Steps:**
1. Upload file with boolean column (true/false or 1/0)

**Expected Results:**
- ✅ Column detected as BOOLEAN type
- ✅ Values shown as true/false
- ✅ Filtering on boolean works

### Test 8.4: Text with Special Characters
**Steps:**
1. Upload file with column names containing spaces, special chars
2. Query the data

**Expected Results:**
- ✅ Column names properly quoted in SQL
- ✅ Query executes without syntax errors
- ✅ Results display correctly

### Test 8.5: Null Values
**Steps:**
1. Upload file with missing/null values
2. Query: "Show all rows"

**Expected Results:**
- ✅ Nulls imported correctly
- ✅ Display as "null" in italic gray text
- ✅ Export includes proper null handling

---

## Performance Tests

### Test 9.1: Concurrent Uploads
**Steps:**
1. Upload 3 files simultaneously (if possible)

**Expected Results:**
- ✅ All uploads complete successfully
- ✅ No race conditions or conflicts
- ✅ All tables created with unique names

### Test 9.2: Large Query Results
**Steps:**
1. Query that returns 1000+ rows

**Expected Results:**
- ✅ Results truncated at 100
- ✅ Page remains responsive
- ✅ Export works for full dataset

### Test 9.3: Complex Query
**Query:** "Show average, sum, min, max, count grouped by category with totals over 100"

**Expected Results:**
- ✅ LLM generates correct complex SQL
- ✅ Query executes in reasonable time (<5s)
- ✅ Results accurate

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)

**Expected:** Consistent behavior across all browsers

---

## Automated Testing Script

```javascript
// Run in browser console at http://localhost:8080

// Test API connectivity
fetch('http://localhost:8000')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Backend error:', e));

// Test tables endpoint
fetch('http://localhost:8000/api/tables')
  .then(r => r.json())
  .then(d => console.log('✅ Tables:', d))
  .catch(e => console.error('❌ Tables error:', e));
```

---

## Regression Testing

After any code changes, re-run:
1. Test Suite 1 (Upload) - Tests 1.1, 1.2
2. Test Suite 3 (Queries) - Tests 3.1, 3.2, 3.3
3. Test Suite 5 (Export) - Test 5.2

Minimum: These 6 tests ensure core functionality works.

---

## Bug Report Template

When filing issues:

```markdown
**Bug Description:**
[Clear description of what went wrong]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should have happened]

**Actual Behavior:**
[What actually happened]

**Environment:**
- OS: 
- Browser: 
- Frontend URL: 
- Backend URL: 

**Console Errors:**
[Copy any browser console errors]

**Backend Logs:**
[Copy relevant backend terminal output]

**Screenshots:**
[If applicable]
```

---

## Success Criteria

All tests passing means:
- ✅ Frontend-backend integration complete
- ✅ All CRUD operations working
- ✅ Natural language queries functional
- ✅ Error handling robust
- ✅ User experience smooth
- ✅ Data integrity maintained

**Status:** Ready for production! 🚀
