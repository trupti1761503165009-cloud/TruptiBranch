D:\SharePointProjects\Demo1>npx playwright test
[dotenv@17.3.1] injecting env (2) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚡️ secrets for agents: https://dotenvx.com/as2

Running 115 tests using 4 workers
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[setup] › tests\auth.setup.ts:9:6 › authenticate
Entering username...
Entering password...
Checking for "Stay signed in?" prompt...
Clicking "Yes" on Stay signed in prompt...
Waiting for application to load at Page.aspx...
Verifying login success...
Authentication successful!
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
  1) [chromium] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ──────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Total Categories').first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Total Categories').first()


      14 |
      15 |     // Check Summary Cards
    > 16 |     await expect(page.locator('text=Total Categories').first()).toBeVisible();
         |                                                                 ^
      17 |
      18 | });
      19 |
        at D:\SharePointProjects\Demo1\tests\tests\dashboard.spec.ts:16:65

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-dashboard-Open-Dashboard-Page-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-dashboard-Open-Dashboard-Page-chromium\error-context.md

  2) [chromium] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator:  locator('text=Create CTD Folder').first()
    Expected: visible
    Received: hidden
    Timeout:  5000ms

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Create CTD Folder').first()
        8 × locator resolved to <span class="nav-label">Create CTD Folder</span>
          - unexpected value "hidden"


      11 |
      12 |     // Check Header
    > 13 |     await expect(page.locator('text=Create CTD Folder').first()).toBeVisible();
         |                                                                  ^
      14 |
      15 |     // Check for a specific element in the CTD folder creation UI
      16 |     await expect(page.locator('text=CTD Structure').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\ctd.spec.ts:13:66

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-ctd-Open-Create-CTD-Folder-Page-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-ctd-Open-Create-CTD-Folder-Page-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
  3) [chromium] › tests\login.spec.ts:3:5 › Login to SharePoint ────────────────────────────────────

    Test timeout of 60000ms exceeded.

    Error: page.fill: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('input[type="email"]')


      4 |     await page.goto('https://yourtenant.sharepoint.com');
      5 |
    > 6 |     await page.fill('input[type="email"]', 'your-email@domain.com');
        |                ^
      7 |     await page.click('input[type="submit"]');
      8 |
      9 |     await page.fill('input[type="password"]', 'your-password');
        at D:\SharePointProjects\Demo1\tests\login.spec.ts:6:16

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\login-Login-to-SharePoint-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\login-Login-to-SharePoint-chromium\error-context.md

  4) [chromium] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ──────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator:  locator('text=Documents').first()
    Expected: visible
    Received: hidden
    Timeout:  5000ms

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Documents').first()
        7 × locator resolved to <span class="ms-Nav-linkText linkText_a87ce8ff">Documents</span>
          - unexpected value "hidden"


      11 |
      12 |     // Check Header
    > 13 |     await expect(page.locator('text=Documents').first()).toBeVisible();
         |                                                          ^
      14 |
      15 |     // Check Add Document Button
      16 |     const addButton = page.locator('text=Create Document').first();
        at D:\SharePointProjects\Demo1\tests\tests\documents.spec.ts:13:58

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-documents-Open-Documents-Page-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-documents-Open-Documents-Page-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
…10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns
Checking Global UI Standards for: Templates
…m] › tests\tests\master_phase1_auth.spec.ts:5:9 › Phase 1: Login & Role Validation › Admin Login & Dashboard Validation
Verifying Admin Dashboard header...
  5) [chromium] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.ms-Icon, svg[data-icon]')
    Expected: visible
    Error: strict mode violation: locator('.ms-Icon, svg[data-icon]') resolved to 60 elements:
        1) <i aria-hidden="true" data-icon-name="FavoriteStar" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-245"></i> aka getByText('')
        2) <i aria-hidden="true" data-icon-name="CalculatorAddition" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-237"></i> aka getByText('')
        3) <i aria-hidden="true" data-icon-name="ChevronDown" class="ms-Icon root-33 css-43 ms-Button-menuIcon ms-ButtonShim-menuIcon menuIcon-230"></i> aka locator('#pageCommandBarNewButtonId').getByText('')
        4) <i aria-hidden="true" data-icon-name="Settings" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-237"></i> aka getByText('')
        5) <i aria-hidden="true" data-icon-name="More" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-237"></i> aka getByText('')
        6) <i aria-hidden="true" data-icon-name="ChevronDown" class="ms-Icon root-33 css-43 ms-Button-menuIcon ms-ButtonShim-menuIcon menuIcon-230"></i> aka getByLabel('Share', { exact: true }).getByText('')
        7) <i aria-hidden="true" data-icon-name="Edit" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-237"></i> aka getByText('')
        8) <i aria-hidden="true" data-icon-name="ReadingMode" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-245"></i> aka getByText('')
        9) <i aria-hidden="true" data-icon-name="FullScreen" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-237"></i> aka getByText('')
        10) <svg role="img" data-prefix="fas" data-icon="house" aria-hidden="true" viewBox="0 0 576 512" class="svg-inline--fa fa-house dms-breadcrumb__home-icon">…</svg> aka getByRole('button', { name: 'Dashboard' })
        ...

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.ms-Icon, svg[data-icon]')


      47 |
      48 |         // 3. Check for specific icons (FontAwesome / Fabric)
    > 49 |         await expect(page.locator('.ms-Icon, svg[data-icon]')).toBeVisible();
         |                                                                ^
      50 |     });
      51 | });
      52 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:49:64

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase10_globa-7d717--UI-and-Standard-Components-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase10_globa-7d717--UI-and-Standard-Components-chromium\error-context.md

Checking summary tiles...
Checking tile: Total Documents
Checking tile: Templates
Checking tile: Categories
Checking tile: Users
Checking tile: Review Pending
Checking tile: Approved Documents
Checking sidebar items...
Checking sidebar item: Dashboard
Checking sidebar item: Manage Templates
Checking sidebar item: Manage Categories
Checking sidebar item: Users & Permissions
Checking user name in header...
Phase 1 Admin validation passed!
  6) [chromium] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.breadcrumb-nav, .ms-Breadcrumb')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.breadcrumb-nav, .ms-Breadcrumb')


      18 |
      19 |             // 1. Breadcrumb Presence
    > 20 |             await expect(page.locator('.breadcrumb-nav, .ms-Breadcrumb')).toBeVisible();
         |                                                                           ^
      21 |
      22 |             // 2. Main Title (Fluent UI style)
      23 |             await expect(page.locator('.mainTitle, .page-title, h1, h2').filter({ hasText: moduleName }).first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:20:75

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
…um] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping

--- Testing GMP Mapping Upload ---
…aster_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
Found 8 rows in the templates grid.

Starting CRUD actions on item: SOP_Auto_1772307039312_1.docx
Testing Preview...
…um] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping
Selecting option for label: "Category"...
…aster_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
Preview verified (either frame or message).
…um] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping
Looking for option: "ANY_AUTO"
…aster_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
Testing Download...
…sts\master_phase2_templates.spec.ts:84:9 › Phase 2: Template Module Testing › Verify Form Validation (Empty Submission)
Validation errors verified successfully.
…ests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping

--- Processing Template: CS_OP_TR001 Revision 10.docx ---
Selecting option for label: "Category"...
Looking for option: "ANY_AUTO"
  7) [chromium] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping

    Error: expect(locator).toBeVisible() failed

    Locator: locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()


      29 |
      30 |     const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    > 31 |     await expect(options.first()).toBeVisible({ timeout: 10000 });
         |                                   ^
      32 |
      33 |     if (valueToSelect === 'ANY_AUTO') {
      34 |         const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:31:35)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:270:9

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-123c6--Add-Template---GMP-Mapping-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-123c6--Add-Template---GMP-Mapping-chromium\error-context.md

  8) [chromium] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions

    TimeoutError: page.waitForEvent: Timeout 30000ms exceeded while waiting for event "download"
    =========================== logs ===========================
    waiting for event "download"
    ============================================================

      219 |             console.log('Testing Download...');
      220 |             const [download] = await Promise.all([
    > 221 |                 page.waitForEvent('download', { timeout: 30000 }),
          |                      ^
      222 |                 row.locator('.btnGreen').first().click()
      223 |             ]);
      224 |             console.log('Download triggered: ', download.suggestedFilename());
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:221:22

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-chromium\test-failed-2.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-chromium\error-context.md

  9) [chromium] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping

    Error: expect(locator).toBeVisible() failed

    Locator: locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()


      29 |
      30 |     const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    > 31 |     await expect(options.first()).toBeVisible({ timeout: 10000 });
         |                                   ^
      32 |
      33 |     if (valueToSelect === 'ANY_AUTO') {
      34 |         const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:31:35)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:132:13

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-cfa5b-dd-Templates---eCTD-Mapping-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-cfa5b-dd-Templates---eCTD-Mapping-chromium\error-context.md

…um] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping

--- Testing TMF Mapping Upload ---
Selecting option for label: "Category"...
Looking for option: "ANY_AUTO"
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2
…] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation
Opening Excel Upload modal...
…sts\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy
Phase 3: Adding Category Item #1...
Testing empty form validation...
  10) [chromium] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping

    Error: expect(locator).toBeVisible() failed

    Locator: locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()


      29 |
      30 |     const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    > 31 |     await expect(options.first()).toBeVisible({ timeout: 10000 });
         |                                   ^
      32 |
      33 |     if (valueToSelect === 'ANY_AUTO') {
      34 |         const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:31:35)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:303:9

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-6c749--Add-Template---TMF-Mapping-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-6c749--Add-Template---TMF-Mapping-chromium\error-context.md

  11) [chromium] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation

    Error: locator.click: Element is not visible
    Call log:
      - waiting for locator('.ms-Modal input[type="file"]')
        - locator resolved to <input type="file" id="input-file-upload"/>
      - attempting click action
        - scrolling into view if needed


      337 |         const [fileChooser] = await Promise.all([
      338 |             page.waitForEvent('filechooser'),
    > 339 |             page.locator('.ms-Modal input[type="file"]').click({ force: true })
          |                                                          ^
      340 |         ]);
      341 |         await fileChooser.setFiles(excelPath);
      342 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:339:58

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
  12) [chromium] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.ms-TextField-errorMessage').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('.ms-TextField-errorMessage').first()


      68 |                 await page.getByRole('button', { name: 'Add Category' }).last().click();
      69 |                 // Fluent UI error message class
    > 70 |                 await expect(page.locator('.ms-TextField-errorMessage').first()).toBeVisible({ timeout: 10000 });
         |                                                                                  ^
      71 |                 console.log('Validation message confirmed.');
      72 |             }
      73 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:70:82

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
[chromium] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD
Phase 4: Adding Drug #1...
Testing empty form validation...
Selecting Status: Active...
Selecting option for label: Status...
Phase 4: Drug #1 created.
Phase 4: Adding Drug #2...
Selecting Status: Active...
Selecting option for label: Status...
Phase 4: Drug #2 created.
Phase 4: Adding Drug #3...
[chromium] › tests\tests\master_phase4_drugs.spec.ts:109:9 › Phase 4: Drug Module Testing › Edit and Delete Drug
Testing Drug Edit for item 0...
Testing Drug Delete for item 0...
…m] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation
Found 23 drugs after searching for "Drug"
  13) [chromium] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD

    Error: expect(locator).toBeVisible() failed

    Locator: locator('h1, h2, .form-card__title').filter({ hasText: 'Add New Drug' }).first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('h1, h2, .form-card__title').filter({ hasText: 'Add New Drug' }).first()


      46 |             console.log(`Phase 4: Adding Drug #${i}...`);
      47 |             await page.getByRole('button', { name: 'Add Drug' }).first().click();
    > 48 |             await expect(page.locator('h1, h2, .form-card__title', { hasText: 'Add New Drug' }).first()).toBeVisible();
         |                                                                                                          ^
      49 |
      50 |             // 2. Validation Check: Try to save empty
      51 |             if (i === 1) {
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:48:106

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-chromium\error-context.md

  14) [chromium] › tests\tests\master_phase4_drugs.spec.ts:109:9 › Phase 4: Drug Module Testing › Edit and Delete Drug

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=deleted successfully')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=deleted successfully')


      133 |             await expect(page.locator('text=Are you sure you want to delete this drug?')).toBeVisible({ timeout: 5000 });
      134 |             await page.getByRole('button', { name: 'Delete' }).click();
    > 135 |             await expect(page.locator('text=deleted successfully')).toBeVisible();
          |                                                                     ^
      136 |             await expect(okBtn).toBeVisible();
      137 |             await okBtn.click();
      138 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:135:69

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--f8266-esting-Edit-and-Delete-Drug-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--f8266-esting-Edit-and-Delete-Drug-chromium\error-context.md

[chromium] › tests\tests\master_phase4_drugs.spec.ts:85:9 › Phase 4: Drug Module Testing › View/Preview Drug Details
Testing Drug View panel for row 0...
Testing Drug View panel for row 1...
Testing Drug View panel for row 2...
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
  15) [chromium] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.react-dropdown-container').filter({ hasText: 'All Status' }).locator('.react-select__control').first()


      150 |
      151 |         // 2. Filter by status
    > 152 |         await page.locator('.react-dropdown-container').filter({ hasText: 'All Status' }).locator('.react-select__control').first().click();
          |                                                                                                                                     ^
      153 |         await page.locator('.react-select__menu').locator('text=Active').last().click();
      154 |
      155 |         // Verify all rows show "Active"
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:152:133

    Error Context: test-results\tests-master_phase4_drugs--34674-earch-and-Filter-Validation-chromium\error-context.md

…ium] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD
Phase 5: Adding Root Folder #1...
Testing empty form validation...
…se6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow
Phase 6: Creating Document #1...
Selecting Drug...
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  16) [chromium] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Folder code is required')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Folder code is required')


      51 |                 // Check if MessageDialog or inline error appears
      52 |                 const errorMsg = page.locator('text=Folder code is required');
    > 53 |                 await expect(errorMsg).toBeVisible();
         |                                        ^
      54 |                 const okBtn = page.getByRole('button', { name: 'OK' });
      55 |                 if (await okBtn.isVisible()) await okBtn.click();
      56 |             }
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:53:40

    Error Context: test-results\tests-master_phase5_ctd-Ph-38a07-k-Add-Root-Folders-and-CRUD-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2
  17) [chromium] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.react-select__menu').locator('.react-select__option').nth(1)


      37 |
      38 |                 // For Documents, labels often have -- Select ... -- as first option, so we pick nth(1)
    > 39 |                 await menu.locator('.react-select__option').nth(1).click();
         |                                                                    ^
      40 |                 await expect(menu).not.toBeVisible();
      41 |             };
      42 |
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:39:68)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:43:13

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-chromium\error-context.md

…s\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow
Phase 8: Adding User #1...
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚡️ secrets for agents: https://dotenvx.com/as2
  18) [chromium] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
…erification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
Entering Drug folder: Bulk Drug 1 - 1772286115835
Navigating into Virtual Folder: Root Folder 1772279866176
  19) [chromium] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: /Add User/i }).first()
        - locator resolved to <button type="button" data-is-focusable="true" data-testid="add-user-btn" class="ms-Button ms-Button--primary root-137">…</button>
      - attempting click action
        - waiting for element to be visible, enabled and stable
      - element was detached from the DOM, retrying


      40 |         for (let i = 1; i <= 3; i++) {
      41 |             console.log(`Phase 8: Adding User #${i}...`);
    > 42 |             await page.getByRole('button', { name: /Add User/i }).first().click();
         |                                                                           ^
      43 |             await expect(page.locator('.form-card__title', { hasText: 'Add New User' })).toBeVisible();
      44 |
      45 |             // Validation Check: Try to save empty
        at D:\SharePointProjects\Demo1\tests\tests\master_phase8_permissions.spec.ts:42:75

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-chromium\error-context.md

  20) [chromium] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.breadcrumb-item').filter({ hasText: 'Documents' })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.breadcrumb-item').filter({ hasText: 'Documents' })


      30 |
      31 |         // 3. Verify Breadcrumb
    > 32 |         await expect(page.locator('.breadcrumb-item', { hasText: 'Documents' })).toBeVisible();
         |                                                                                  ^
      33 |         await expect(page.locator('.breadcrumb-item', { hasText: drugName })).toBeVisible();
      34 |
      35 |         // 4. Verify Document Visibility (Metadata grouping)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:32:82

    Error Context: test-results\tests-master_phase9_ctd_ve-3b02d-ed-Grouping-and-Breadcrumbs-chromium\error-context.md

  21) [chromium] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  22) [chromium] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.ms-Grid-row').filter({ hasText: 'Structure' }).locator('.react-select__control').first()
        - locator resolved to <div aria-disabled="true" class="react-select__control react-select__control--is-disabled css-ua275a-control">…</div>
      - attempting click action
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div>…</div> intercepts pointer events
      - retrying click action
        - waiting for element to be visible, enabled and stable
        - element is not stable
      - retrying click action
        - waiting 20ms
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div>…</div> intercepts pointer events
      2 × retrying click action
          - waiting 100ms
          - waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - <header class="header">…</header> intercepts pointer events
      13 × retrying click action
           - waiting 500ms
           - waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - <div>…</div> intercepts pointer events
         - retrying click action
           - waiting 500ms
           - waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - <div>…</div> intercepts pointer events
         - retrying click action
           - waiting 500ms
           - waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - <header class="header">…</header> intercepts pointer events
         - retrying click action
           - waiting 500ms
           - waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - <header class="header">…</header> intercepts pointer events
      - retrying click action
        - waiting 500ms
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div>…</div> intercepts pointer events
      - retrying click action
        - waiting 500ms
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed


      45 |         // Toggle Structure
      46 |         const structureLabel = page.locator('label', { hasText: 'Structure' });
    > 47 |         await page.locator('.ms-Grid-row', { hasText: 'Structure' }).locator('.react-select__control').first().click();
         |                                                                                                                ^
      48 |
      49 |         const diaOption = page.locator('.react-select__menu').locator('.react-select__option', { hasText: 'DIA reference' });
      50 |         await diaOption.click();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:47:112

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase9_ctd_ve-6d59e-ructure-Toggle-eCTD-vs-DIA--chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase9_ctd_ve-6d59e-ructure-Toggle-eCTD-vs-DIA--chromium\error-context.md

  23) [chromium] › tests\tests\template.spec.ts:3:5 › Open Template Page ───────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Add Template').first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Add Template').first()


      12 |     // Check Add Template Button
      13 |     const addButton = page.locator('text=Add Template').first();
    > 14 |     await expect(addButton).toBeVisible();
         |                             ^
      15 |
      16 |     // Click Add Template
      17 |     await addButton.click();
        at D:\SharePointProjects\Demo1\tests\tests\template.spec.ts:14:29

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-template-Open-Template-Page-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-template-Open-Template-Page-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
  24) [chromium] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ───────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('text=Add User').first()
        - locator resolved to <span data-automationid="splitbuttonprimary" class="ms-Button-flexContainer flexContainer-176">…</span>
      - attempting click action
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - <div class="lds-hourglass"></div> intercepts pointer events
        - retrying click action
        - waiting 20ms
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div class="lds-hourglass"></div> intercepts pointer events
      - retrying click action
        - waiting 100ms
        - waiting for element to be visible, enabled and stable
      - element was detached from the DOM, retrying


      18 |
      19 |     // Click Add User
    > 20 |     await addButton.click();
         |                     ^
      21 |
      22 |     // Check Modal Opens
      23 |     await expect(page.locator('text=User Email').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\users.spec.ts:20:21

    Error Context: test-results\tests-users-Open-Users-Permissions-Page-chromium\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
  25) [firefox] › tests\login.spec.ts:3:5 › Login to SharePoint ────────────────────────────────────

    Test timeout of 60000ms exceeded.

    Error: page.fill: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('input[type="email"]')


      4 |     await page.goto('https://yourtenant.sharepoint.com');
      5 |
    > 6 |     await page.fill('input[type="email"]', 'your-email@domain.com');
        |                ^
      7 |     await page.click('input[type="submit"]');
      8 |
      9 |     await page.fill('input[type="password"]', 'your-password');
        at D:\SharePointProjects\Demo1\tests\login.spec.ts:6:16

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\login-Login-to-SharePoint-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\login-Login-to-SharePoint-firefox\error-context.md

  26) [firefox] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ──────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Total Categories').first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Total Categories').first()


      14 |
      15 |     // Check Summary Cards
    > 16 |     await expect(page.locator('text=Total Categories').first()).toBeVisible();
         |                                                                 ^
      17 |
      18 | });
      19 |
        at D:\SharePointProjects\Demo1\tests\tests\dashboard.spec.ts:16:65

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-dashboard-Open-Dashboard-Page-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-dashboard-Open-Dashboard-Page-firefox\error-context.md

  27) [firefox] › tests\tests\categories.spec.ts:3:5 › Open Categories Page ────────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Manage Categories' })


       8 |
       9 |     // Click Manage Categories in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Manage Categories' }).click();
         |                                                                       ^
      11 |
      12 |     // Check Header
      13 |     await expect(page.locator('text=Manage Categories').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\categories.spec.ts:10:71

    Error Context: test-results\tests-categories-Open-Categories-Page-firefox\error-context.md

  28) [firefox] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ────────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Create CTD Folder' })


       8 |
       9 |     // Click Create CTD Folder in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Create CTD Folder' }).click();
         |                                                                       ^
      11 |
      12 |     // Check Header
      13 |     await expect(page.locator('text=Create CTD Folder').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\ctd.spec.ts:10:71

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-ctd-Open-Create-CTD-Folder-Page-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-ctd-Open-Create-CTD-Folder-Page-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
…x] › tests\tests\master_phase1_auth.spec.ts:5:9 › Phase 1: Login & Role Validation › Admin Login & Dashboard Validation
Verifying Admin Dashboard header...
Checking summary tiles...
Checking tile: Total Documents
Checking tile: Templates
Checking tile: Categories
Checking tile: Users
Checking tile: Review Pending
Checking tile: Approved Documents
Checking sidebar items...
Checking sidebar item: Dashboard
Checking sidebar item: Manage Templates
Checking sidebar item: Manage Categories
Checking sidebar item: Users & Permissions
Checking user name in header...
Phase 1 Admin validation passed!
  29) [firefox] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ──────────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Documents' })


       8 |
       9 |     // Click Documents in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Documents' }).click();
         |                                                               ^
      11 |
      12 |     // Check Header
      13 |     await expect(page.locator('text=Documents').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\documents.spec.ts:10:63

    Error Context: test-results\tests-documents-Open-Documents-Page-firefox\error-context.md

  30) [firefox] › tests\tests\drugs.spec.ts:3:5 › Open Drugs Database Page ─────────────────────────

    Test timeout of 60000ms exceeded.

    Error: page.goto: Test timeout of 60000ms exceeded.
    Call log:
      - navigating to "https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx", waiting until "load"


      3 | test('Open Drugs Database Page', async ({ page }) => {
      4 |
    > 5 |     await page.goto('SitePages/Page.aspx');
        |                ^
      6 |
      7 |     await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\drugs.spec.ts:5:16

  31) [firefox] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 10: Global UI & Architecture Validation', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |     });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:5:10

    Error: page.goto: Test timeout of 60000ms exceeded.
    Call log:
      - navigating to "https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx", waiting until "load"


      4 |
      5 |     test.beforeEach(async ({ page }) => {
    > 6 |         await page.goto('SitePages/Page.aspx');
        |                    ^
      7 |         await page.waitForLoadState('load');
      8 |     });
      9 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:6:20

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
  32) [firefox] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Templates' }).first()


      38 |     test('Architecture Check: Fluent UI and Standard Components', async ({ page }) => {
      39 |         // Navigate to a page with a grid
    > 40 |         await page.locator('nav.sidebar .nav-label').filter({ hasText: 'Templates' }).first().click();
         |                                                                                               ^
      41 |
      42 |         // 1. Check for ms-DetailsList (standard grid)
      43 |         await expect(page.locator('.ms-DetailsList')).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:40:95

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
  33) [firefox] › tests\tests\master_phase2_templates.spec.ts:84:9 › Phase 2: Template Module Testing › Verify Form Validation (Empty Submission)

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: expect(locator).toBeVisible() failed

    Locator: locator('nav.sidebar')
    Expected: visible
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 60000ms
      - waiting for locator('nav.sidebar')


      59 |         // Wait for sidebar to be visible
      60 |         const sidebar = page.locator('nav.sidebar');
    > 61 |         await expect(sidebar).toBeVisible({ timeout: 60000 });
         |                               ^
      62 |
      63 |         // Ensure we are in Admin role (if the switch is visible)
      64 |         const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:61:31

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-6ba1e-alidation-Empty-Submission--firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-6ba1e-alidation-Empty-Submission--firefox\error-context.md

  34) [firefox] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: expect(locator).toBeVisible() failed

    Locator: locator('nav.sidebar')
    Expected: visible
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 60000ms
      - waiting for locator('nav.sidebar')


      59 |         // Wait for sidebar to be visible
      60 |         const sidebar = page.locator('nav.sidebar');
    > 61 |         await expect(sidebar).toBeVisible({ timeout: 60000 });
         |                               ^
      62 |
      63 |         // Ensure we are in Admin role (if the switch is visible)
      64 |         const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:61:31

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-firefox\error-context.md

  35) [firefox] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: expect(locator).toBeVisible() failed

    Locator: locator('nav.sidebar')
    Expected: visible
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 60000ms
      - waiting for locator('nav.sidebar')


      59 |         // Wait for sidebar to be visible
      60 |         const sidebar = page.locator('nav.sidebar');
    > 61 |         await expect(sidebar).toBeVisible({ timeout: 60000 });
         |                               ^
      62 |
      63 |         // Ensure we are in Admin role (if the switch is visible)
      64 |         const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:61:31

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-cfa5b-dd-Templates---eCTD-Mapping-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
  36) [firefox] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: expect(locator).toBeVisible() failed

    Locator: locator('nav.sidebar')
    Expected: visible
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 60000ms
      - waiting for locator('nav.sidebar')


      59 |         // Wait for sidebar to be visible
      60 |         const sidebar = page.locator('nav.sidebar');
    > 61 |         await expect(sidebar).toBeVisible({ timeout: 60000 });
         |                               ^
      62 |
      63 |         // Ensure we are in Admin role (if the switch is visible)
      64 |         const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:61:31

    Error Context: test-results\tests-master_phase2_templa-123c6--Add-Template---GMP-Mapping-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
  37) [firefox] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: expect(locator).toBeVisible() failed

    Locator: locator('nav.sidebar')
    Expected: visible
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 60000ms
      - waiting for locator('nav.sidebar')


      59 |         // Wait for sidebar to be visible
      60 |         const sidebar = page.locator('nav.sidebar');
    > 61 |         await expect(sidebar).toBeVisible({ timeout: 60000 });
         |                               ^
      62 |
      63 |         // Ensure we are in Admin role (if the switch is visible)
      64 |         const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:61:31

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-firefox\error-context.md

  38) [firefox] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      53 | test.describe('Phase 2: Template Module Testing', () => {
      54 |
    > 55 |     test.beforeEach(async ({ page }) => {
         |          ^
      56 |         // Direct navigation with extended timeout
      57 |         await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });
      58 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:55:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Manage Templates' }).first()
        - locator resolved to <div title="" class="nav-item ">…</div>
      - attempting click action
        - waiting for element to be visible, enabled and stable


      72 |         const navItem = page.locator('.nav-item').filter({ hasText: 'Manage Templates' }).first();
      73 |         await expect(navItem).toBeVisible({ timeout: 30000 });
    > 74 |         await navItem.click();
         |                       ^
      75 |
      76 |         // Success indicator: the mainTitle element
      77 |         await expect(page.locator('.mainTitle', { hasText: 'Manage Templates' })).toBeVisible({ timeout: 45000 });
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:74:23

    Error Context: test-results\tests-master_phase2_templa-6c749--Add-Template---TMF-Mapping-firefox\error-context.md

  39) [firefox] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: page.goto: Test timeout of 60000ms exceeded.
    Call log:
      - navigating to "https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx", waiting until "load"


      4 |
      5 |     test.beforeEach(async ({ page }) => {
    > 6 |         await page.goto('SitePages/Page.aspx');
        |                    ^
      7 |         await page.waitForLoadState('load');
      8 |
      9 |         // Navigate to Manage Categories
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:6:20

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
  40) [firefox] › tests\tests\master_phase3_categories.spec.ts:101:9 › Phase 3: Category Module Testing › View Category Details

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: page.goto: Test timeout of 60000ms exceeded.
    Call log:
      - navigating to "https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx", waiting until "load"


      4 |
      5 |     test.beforeEach(async ({ page }) => {
    > 6 |         await page.goto('SitePages/Page.aspx');
        |                    ^
      7 |         await page.waitForLoadState('load');
      8 |
      9 |         // Navigate to Manage Categories
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:6:20

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-246d7-sting-View-Category-Details-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-246d7-sting-View-Category-Details-firefox\error-context.md

  41) [firefox] › tests\tests\master_phase3_categories.spec.ts:145:9 › Phase 3: Category Module Testing › Edit and Delete Category

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: page.goto: Test timeout of 60000ms exceeded.
    Call log:
      - navigating to "https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx", waiting until "load"


      4 |
      5 |     test.beforeEach(async ({ page }) => {
    > 6 |         await page.goto('SitePages/Page.aspx');
        |                    ^
      7 |         await page.waitForLoadState('load');
      8 |
      9 |         // Navigate to Manage Categories
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:6:20

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-c6214-ng-Edit-and-Delete-Category-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-c6214-ng-Edit-and-Delete-Category-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
  42) [firefox] › tests\tests\master_phase3_categories.spec.ts:126:9 › Phase 3: Category Module Testing › Cascading Dropdown Validation

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first()
        - locator resolved to <span class="nav-label">Manage Categories</span>
      - attempting click action
        - waiting for element to be visible, enabled and stable


       9 |         // Navigate to Manage Categories
      10 |         const sidebarCategories = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first();
    > 11 |         await sidebarCategories.click();
         |                                 ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Manage Categories' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:11:33

    Error Context: test-results\tests-master_phase3_catego-8e9f0-scading-Dropdown-Validation-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
  43) [firefox] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 4: Drug Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first()


       9 |         // Navigate to Drugs Database
      10 |         const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
    > 11 |         await sidebarDrugs.click();
         |                            ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:11:28

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
  44) [firefox] › tests\tests\master_phase4_drugs.spec.ts:85:9 › Phase 4: Drug Module Testing › View/Preview Drug Details

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 4: Drug Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first()


       9 |         // Navigate to Drugs Database
      10 |         const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
    > 11 |         await sidebarDrugs.click();
         |                            ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:11:28

  45) [firefox] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 4: Drug Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first()


       9 |         // Navigate to Drugs Database
      10 |         const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
    > 11 |         await sidebarDrugs.click();
         |                            ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:11:28

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--34674-earch-and-Filter-Validation-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--34674-earch-and-Filter-Validation-firefox\error-context.md

  46) [firefox] › tests\tests\master_phase4_drugs.spec.ts:109:9 › Phase 4: Drug Module Testing › Edit and Delete Drug

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 4: Drug Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first()


       9 |         // Navigate to Drugs Database
      10 |         const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
    > 11 |         await sidebarDrugs.click();
         |                            ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:11:28

    Error Context: test-results\tests-master_phase4_drugs--f8266-esting-Edit-and-Delete-Drug-firefox\error-context.md

  47) [firefox] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 5: CTD Folder Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first()


       8 |
       9 |         const sidebarCTD = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first();
    > 10 |         await sidebarCTD.click();
         |                          ^
      11 |         await expect(page.locator('h1, h2', { hasText: 'Create CTD Folder' }).first()).toBeVisible();
      12 |     });
      13 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:10:26

    Error Context: test-results\tests-master_phase5_ctd-Ph-38a07-k-Add-Root-Folders-and-CRUD-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚡️ secrets for agents: https://dotenvx.com/as2
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
  48) [firefox] › tests\tests\master_phase5_ctd.spec.ts:119:9 › Phase 5: CTD Folder Module Testing › Edit and Delete Virtual Folder

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 5: CTD Folder Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first()


       8 |
       9 |         const sidebarCTD = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first();
    > 10 |         await sidebarCTD.click();
         |                          ^
      11 |         await expect(page.locator('h1, h2', { hasText: 'Create CTD Folder' }).first()).toBeVisible();
      12 |     });
      13 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:10:26

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase5_ctd-Ph-241c4-t-and-Delete-Virtual-Folder-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase5_ctd-Ph-241c4-t-and-Delete-Virtual-Folder-firefox\error-context.md

  49) [firefox] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 6: Document Creation & Workflow Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first()


       9 |         // Navigate to Documents
      10 |         const sidebarDocs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first();
    > 11 |         await sidebarDocs.click();
         |                           ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:11:27

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-firefox\error-context.md

  50) [firefox] › tests\tests\master_phase5_ctd.spec.ts:96:9 › Phase 5: CTD Folder Module Testing › View Virtual Folder Details

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 5: CTD Folder Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first()


       8 |
       9 |         const sidebarCTD = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first();
    > 10 |         await sidebarCTD.click();
         |                          ^
      11 |         await expect(page.locator('h1, h2', { hasText: 'Create CTD Folder' }).first()).toBeVisible();
      12 |     });
      13 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:10:26

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase5_ctd-Ph-44844-View-Virtual-Folder-Details-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase5_ctd-Ph-44844-View-Virtual-Folder-Details-firefox\error-context.md

  51) [firefox] › tests\tests\master_phase6_documents.spec.ts:97:9 › Phase 6: Document Creation & Workflow Testing › Document Tabs and Filters

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 6: Document Creation & Workflow Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first()


       9 |         // Navigate to Documents
      10 |         const sidebarDocs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first();
    > 11 |         await sidebarDocs.click();
         |                           ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:11:27

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase6_docume-457ba-g-Document-Tabs-and-Filters-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase6_docume-457ba-g-Document-Tabs-and-Filters-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
…erification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
Entering Drug folder: Bulk Drug 1 - 1772286115835
Navigating into Virtual Folder: Root Folder 1772279866176
  52) [firefox] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.breadcrumb-item').filter({ hasText: 'Documents' })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.breadcrumb-item').filter({ hasText: 'Documents' })


      30 |
      31 |         // 3. Verify Breadcrumb
    > 32 |         await expect(page.locator('.breadcrumb-item', { hasText: 'Documents' })).toBeVisible();
         |                                                                                  ^
      33 |         await expect(page.locator('.breadcrumb-item', { hasText: drugName })).toBeVisible();
      34 |
      35 |         // 4. Verify Document Visibility (Metadata grouping)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:32:82

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase9_ctd_ve-3b02d-ed-Grouping-and-Breadcrumbs-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase9_ctd_ve-3b02d-ed-Grouping-and-Breadcrumbs-firefox\error-context.md

  53) [firefox] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: /User Permissions|Users/i }).first()
        - locator resolved to <span class="nav-label">Users & Permissions</span>
      - attempting click action
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - <div class="lds-hourglass"></div> from <main class="main-content  ">…</main> subtree intercepts pointer events
        - retrying click action
        - waiting 20ms


      11 |         // Navigate to User Permissions
      12 |         const sidebarPermissions = page.locator('nav.sidebar .nav-label').filter({ hasText: /User Permissions|Users/i }).first();
    > 13 |         await sidebarPermissions.click();
         |                                  ^
      14 |         await expect(page.locator('h1, h2, .page-title', { hasText: 'User Permissions' }).first()).toBeVisible({ timeout: 15000 });
      15 |
      16 |         const selectOption = async (labelName: string, optionText?: string) => {
        at D:\SharePointProjects\Demo1\tests\tests\master_phase8_permissions.spec.ts:13:34

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-firefox\error-context.md

  54) [firefox] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-firefox\error-context.md

  55) [firefox] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
  56) [firefox] › tests\tests\template.spec.ts:3:5 › Open Template Page ────────────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Manage Templates' })


       8 |
       9 |     // Click Manage Templates in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Manage Templates' }).click();
         |                                                                      ^
      11 |
      12 |     // Check Add Template Button
      13 |     const addButton = page.locator('text=Add Template').first();
        at D:\SharePointProjects\Demo1\tests\tests\template.spec.ts:10:70

    Error Context: test-results\tests-template-Open-Template-Page-firefox\error-context.md

  57) [firefox] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 9: Virtual CTD Structure Verification', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first()


       9 |         // Navigate to Documents
      10 |         const sidebarDocs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first();
    > 11 |         await sidebarDocs.click();
         |                           ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:11:27

    Error Context: test-results\tests-master_phase9_ctd_ve-6d59e-ructure-Toggle-eCTD-vs-DIA--firefox\error-context.md

  58) [firefox] › tests\tests\reports.spec.ts:3:5 › Open Reports Page ──────────────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Reports' })


       8 |
       9 |     // Click Reports in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Reports' }).click();
         |                                                             ^
      11 |
      12 |     // Check Header
      13 |     await expect(page.locator('text=Reports').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\reports.spec.ts:10:61

    Error Context: test-results\tests-reports-Open-Reports-Page-firefox\error-context.md

  59) [firefox] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.nav-item').filter({ hasText: 'Users & Permissions' })


       8 |
       9 |     // Click Users & Permissions in sidebar
    > 10 |     await page.locator('.nav-item', { hasText: 'Users & Permissions' }).click();
         |                                                                         ^
      11 |
      12 |     // Check Header
      13 |     await expect(page.locator('text=User Permissions').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\users.spec.ts:10:73

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-users-Open-Users-Permissions-Page-firefox\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-users-Open-Users-Permissions-Page-firefox\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
  60) [webkit] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ─────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator:  locator('text=Create CTD Folder').first()
    Expected: visible
    Received: hidden
    Timeout:  5000ms

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Create CTD Folder').first()
        8 × locator resolved to <span class="nav-label">Create CTD Folder</span>
          - unexpected value "hidden"


      11 |
      12 |     // Check Header
    > 13 |     await expect(page.locator('text=Create CTD Folder').first()).toBeVisible();
         |                                                                  ^
      14 |
      15 |     // Check for a specific element in the CTD folder creation UI
      16 |     await expect(page.locator('text=CTD Structure').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\ctd.spec.ts:13:66

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-ctd-Open-Create-CTD-Folder-Page-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-ctd-Open-Create-CTD-Folder-Page-webkit\error-context.md

  61) [webkit] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ───────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Total Categories').first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Total Categories').first()


      14 |
      15 |     // Check Summary Cards
    > 16 |     await expect(page.locator('text=Total Categories').first()).toBeVisible();
         |                                                                 ^
      17 |
      18 | });
      19 |
        at D:\SharePointProjects\Demo1\tests\tests\dashboard.spec.ts:16:65

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-dashboard-Open-Dashboard-Page-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-dashboard-Open-Dashboard-Page-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🤖 agentic secret storage: https://dotenvx.com/as2
…t] › tests\tests\master_phase1_auth.spec.ts:5:9 › Phase 1: Login & Role Validation › Admin Login & Dashboard Validation
Verifying Admin Dashboard header...
  62) [webkit] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ───────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator:  locator('text=Documents').first()
    Expected: visible
    Received: hidden
    Timeout:  5000ms

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Documents').first()
        7 × locator resolved to <span class="ms-Nav-linkText linkText_a87ce8ff">Documents</span>
          - unexpected value "hidden"


      11 |
      12 |     // Check Header
    > 13 |     await expect(page.locator('text=Documents').first()).toBeVisible();
         |                                                          ^
      14 |
      15 |     // Check Add Document Button
      16 |     const addButton = page.locator('text=Create Document').first();
        at D:\SharePointProjects\Demo1\tests\tests\documents.spec.ts:13:58

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-documents-Open-Documents-Page-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-documents-Open-Documents-Page-webkit\error-context.md

Checking summary tiles...
Checking tile: Total Documents
Checking tile: Templates
Checking tile: Categories
Checking tile: Users
Checking tile: Review Pending
Checking tile: Approved Documents
Checking sidebar items...
Checking sidebar item: Dashboard
Checking sidebar item: Manage Templates
Checking sidebar item: Manage Categories
Checking sidebar item: Users & Permissions
Checking user name in header...
Phase 1 Admin validation passed!
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
  63) [webkit] › tests\login.spec.ts:3:5 › Login to SharePoint ─────────────────────────────────────

    Test timeout of 60000ms exceeded.

    Error: page.fill: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('input[type="email"]')


      4 |     await page.goto('https://yourtenant.sharepoint.com');
      5 |
    > 6 |     await page.fill('input[type="email"]', 'your-email@domain.com');
        |                ^
      7 |     await page.click('input[type="submit"]');
      8 |
      9 |     await page.fill('input[type="password"]', 'your-password');
        at D:\SharePointProjects\Demo1\tests\login.spec.ts:6:16

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\login-Login-to-SharePoint-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\login-Login-to-SharePoint-webkit\error-context.md

…10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns
Checking Global UI Standards for: Templates
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
  64) [webkit] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.ms-Icon, svg[data-icon]')
    Expected: visible
    Error: strict mode violation: locator('.ms-Icon, svg[data-icon]') resolved to 60 elements:
        1) <i aria-hidden="true" data-icon-name="FavoriteStar" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-229"></i> aka getByText('')
        2) <i aria-hidden="true" data-icon-name="CalculatorAddition" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-246"></i> aka getByText('')
        3) <i aria-hidden="true" data-icon-name="ChevronDown" class="ms-Icon root-33 css-43 ms-Button-menuIcon ms-ButtonShim-menuIcon menuIcon-239"></i> aka locator('#pageCommandBarNewButtonId').getByText('')
        4) <i aria-hidden="true" data-icon-name="Settings" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-246"></i> aka getByText('')
        5) <i aria-hidden="true" data-icon-name="More" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-246"></i> aka getByText('')
        6) <i aria-hidden="true" data-icon-name="ChevronDown" class="ms-Icon root-33 css-43 ms-Button-menuIcon ms-ButtonShim-menuIcon menuIcon-239"></i> aka getByLabel('Share', { exact: true }).getByText('')
        7) <i aria-hidden="true" data-icon-name="Edit" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-246"></i> aka getByText('')
        8) <i aria-hidden="true" data-icon-name="ReadingMode" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-229"></i> aka getByText('')
        9) <i aria-hidden="true" data-icon-name="FullScreen" class="ms-Icon ms-Button-icon ms-ButtonShim-icon icon-246"></i> aka getByText('')
        10) <svg role="img" data-prefix="fas" data-icon="house" aria-hidden="true" viewBox="0 0 576 512" class="svg-inline--fa fa-house dms-breadcrumb__home-icon">…</svg> aka getByRole('button', { name: 'Dashboard' })
        ...

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.ms-Icon, svg[data-icon]')


      47 |
      48 |         // 3. Check for specific icons (FontAwesome / Fabric)
    > 49 |         await expect(page.locator('.ms-Icon, svg[data-icon]')).toBeVisible();
         |                                                                ^
      50 |     });
      51 | });
      52 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:49:64

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase10_globa-7d717--UI-and-Standard-Components-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase10_globa-7d717--UI-and-Standard-Components-webkit\error-context.md

…sts\master_phase2_templates.spec.ts:84:9 › Phase 2: Template Module Testing › Verify Form Validation (Empty Submission)
Validation errors verified successfully.
  65) [webkit] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.breadcrumb-nav, .ms-Breadcrumb')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.breadcrumb-nav, .ms-Breadcrumb')


      18 |
      19 |             // 1. Breadcrumb Presence
    > 20 |             await expect(page.locator('.breadcrumb-nav, .ms-Breadcrumb')).toBeVisible();
         |                                                                           ^
      21 |
      22 |             // 2. Main Title (Fluent UI style)
      23 |             await expect(page.locator('.mainTitle, .page-title, h1, h2').filter({ hasText: moduleName }).first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase10_global.spec.ts:20:75

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase10_globa-7ca23--Consistent-Layout-Patterns-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
…ests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping

--- Processing Template: CS_OP_TR001 Revision 10.docx ---
Selecting option for label: "Category"...
Looking for option: "ANY_AUTO"
…it] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping

--- Testing TMF Mapping Upload ---
Selecting option for label: "Category"...
Looking for option: "ANY_AUTO"
…aster_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
Found 8 rows in the templates grid.

Starting CRUD actions on item:
SOP_Auto_1772307039312_1.docx

Testing Preview...
…it] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping

--- Testing GMP Mapping Upload ---
  66) [webkit] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping

    Error: expect(locator).toBeVisible() failed

    Locator: locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()


      29 |
      30 |     const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    > 31 |     await expect(options.first()).toBeVisible({ timeout: 10000 });
         |                                   ^
      32 |
      33 |     if (valueToSelect === 'ANY_AUTO') {
      34 |         const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:31:35)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:132:13

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-cfa5b-dd-Templates---eCTD-Mapping-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-cfa5b-dd-Templates---eCTD-Mapping-webkit\error-context.md

  67) [webkit] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions

    Error: expect(locator).toBeVisible() failed

    Locator: text=Template preview URL not available >> internal:or="iframe[title*=\"\nSOP_Auto_1772307039312_1.docx\n\"]" >> nth=0
    Expected: visible
    Error: Unsupported token "BADSTRING" while parsing css selector "iframe[title*="
    SOP_Auto_1772307039312_1.docx
    "]". Did you mean to CSS.escape it?

    Call log:
      - Expect "toBeVisible" with timeout 15000ms
      - waiting for text=Template preview URL not available >> internal:or="iframe[title*=\"\nSOP_Auto_1772307039312_1.docx\n\"]" >> nth=0


      211 |             // Preview might fail if SharePoint file doesn't have an embed link yet
      212 |             const previewMsg = page.locator('text=Template preview URL not available').or(page.locator(`iframe[title*="${templateName}"]`));
    > 213 |             await expect(previewMsg.first()).toBeVisible({ timeout: 15000 });
          |                                              ^
      214 |
      215 |             console.log('Preview verified (either frame or message).');
      216 |             await page.getByRole('button', { name: 'Close' }).click();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:213:46

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-33ee7-dit-Delete-Template-Actions-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
  68) [webkit] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping

    Error: expect(locator).toBeVisible() failed

    Locator: locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('div[class*="-menu"]').first().locator('div[id^="react-select-"][id*="-option-"]').first()


      29 |
      30 |     const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    > 31 |     await expect(options.first()).toBeVisible({ timeout: 10000 });
         |                                   ^
      32 |
      33 |     if (valueToSelect === 'ANY_AUTO') {
      34 |         const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:31:35)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:303:9

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-6c749--Add-Template---TMF-Mapping-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-6c749--Add-Template---TMF-Mapping-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
…] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation
Opening Excel Upload modal...
…sts\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy
Phase 3: Adding Category Item #1...
Testing empty form validation...
  69) [webkit] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation

    Error: locator.click: Element is not visible
    Call log:
      - waiting for locator('.ms-Modal input[type="file"]')
        - locator resolved to <input type="file" id="input-file-upload"/>
      - attempting click action
        - scrolling into view if needed


      337 |         const [fileChooser] = await Promise.all([
      338 |             page.waitForEvent('filechooser'),
    > 339 |             page.locator('.ms-Modal input[type="file"]').click({ force: true })
          |                                                          ^
      340 |         ]);
      341 |         await fileChooser.setFiles(excelPath);
      342 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:339:58

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-1e997-xcel-Bulk-Upload-Validation-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  70) [webkit] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Upload Template' })
        - locator resolved to <button type="button" data-is-focusable="true" class="ms-Button ms-Button--primary root-175">…</button>
      - attempting click action
        - waiting for element to be visible, enabled and stable
        - element is not stable
      - retrying click action
        - waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - element is outside of the viewport
      - retrying click action
        - waiting 20ms
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - element is outside of the viewport
        - retrying click action
          - waiting 100ms
        44 × waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - element is outside of the viewport
         - retrying click action
           - waiting 500ms
        - waiting for element to be visible, enabled and stable


      265 |
      266 |         console.log('\n--- Testing GMP Mapping Upload ---');
    > 267 |         await page.getByRole('button', { name: 'Upload Template' }).click();
          |                                                                     ^
      268 |
      269 |         await page.locator('input[placeholder*="Protocol"]').fill('GMP_TEST_TEMPLATE');
      270 |         await selectOption(page, 'Category', 'ANY_AUTO');
        at D:\SharePointProjects\Demo1\tests\tests\master_phase2_templates.spec.ts:267:69

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase2_templa-123c6--Add-Template---GMP-Mapping-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase2_templa-123c6--Add-Template---GMP-Mapping-webkit\error-context.md

  71) [webkit] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.ms-TextField-errorMessage').first()
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 10000ms
      - waiting for locator('.ms-TextField-errorMessage').first()


      68 |                 await page.getByRole('button', { name: 'Add Category' }).last().click();
      69 |                 // Fluent UI error message class
    > 70 |                 await expect(page.locator('.ms-TextField-errorMessage').first()).toBeVisible({ timeout: 10000 });
         |                                                                                  ^
      71 |                 console.log('Validation message confirmed.');
      72 |             }
      73 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:70:82

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-08a3c-gory-Items---Full-Hierarchy-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  72) [webkit] › tests\tests\master_phase3_categories.spec.ts:101:9 › Phase 3: Category Module Testing › View Category Details

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first()
        - locator resolved to <span class="nav-label">Manage Categories</span>
      - attempting click action
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - element is outside of the viewport
        - retrying click action
        - waiting 20ms
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - element is outside of the viewport
        - retrying click action
          - waiting 100ms
        49 × waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - element is outside of the viewport
         - retrying click action
           - waiting 500ms
        - waiting for element to be visible, enabled and stable


       9 |         // Navigate to Manage Categories
      10 |         const sidebarCategories = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first();
    > 11 |         await sidebarCategories.click();
         |                                 ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Manage Categories' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:11:33

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-246d7-sting-View-Category-Details-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-246d7-sting-View-Category-Details-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
  73) [webkit] › tests\tests\master_phase3_categories.spec.ts:145:9 › Phase 3: Category Module Testing › Edit and Delete Category

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 3: Category Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first()
        - locator resolved to <span class="nav-label">Manage Categories</span>
      - attempting click action
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - element is outside of the viewport
        - retrying click action
        - waiting 20ms
        2 × waiting for element to be visible, enabled and stable
          - element is visible, enabled and stable
          - scrolling into view if needed
          - done scrolling
          - element is outside of the viewport
        - retrying click action
          - waiting 100ms
        57 × waiting for element to be visible, enabled and stable
           - element is visible, enabled and stable
           - scrolling into view if needed
           - done scrolling
           - element is outside of the viewport
         - retrying click action
           - waiting 500ms
        - waiting for element to be visible, enabled and stable


       9 |         // Navigate to Manage Categories
      10 |         const sidebarCategories = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first();
    > 11 |         await sidebarCategories.click();
         |                                 ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Manage Categories' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase3_categories.spec.ts:11:33

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase3_catego-c6214-ng-Edit-and-Delete-Category-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase3_catego-c6214-ng-Edit-and-Delete-Category-webkit\error-context.md

…kit] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD
Phase 5: Adding Root Folder #1...
Testing empty form validation...
[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  74) [webkit] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 4: Drug Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first()


       9 |         // Navigate to Drugs Database
      10 |         const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
    > 11 |         await sidebarDrugs.click();
         |                            ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:11:28

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--6dfd5--Bulk-Add-Drugs---Full-CRUD-webkit\error-context.md

  75) [webkit] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Folder code is required')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Folder code is required')


      51 |                 // Check if MessageDialog or inline error appears
      52 |                 const errorMsg = page.locator('text=Folder code is required');
    > 53 |                 await expect(errorMsg).toBeVisible();
         |                                        ^
      54 |                 const okBtn = page.getByRole('button', { name: 'OK' });
      55 |                 if (await okBtn.isVisible()) await okBtn.click();
      56 |             }
        at D:\SharePointProjects\Demo1\tests\tests\master_phase5_ctd.spec.ts:53:40

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase5_ctd-Ph-38a07-k-Add-Root-Folders-and-CRUD-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase5_ctd-Ph-38a07-k-Add-Root-Folders-and-CRUD-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚡️ secrets for agents: https://dotenvx.com/as2
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
…se6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow
Phase 6: Creating Document #1...
Selecting Drug...
  76) [webkit] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation

    Test timeout of 60000ms exceeded.

    Error: locator.fill: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for getByPlaceholder('Search', { exact: true }).first()
        - locator resolved to <input type="search" accesskey="S" role="combobox" data-nav="true" data-tab="true" maxlength="500" spellcheck="false" autocomplete="off" autocorrect="false" placeholder="Search" aria-expanded="false" aria-autocomplete="list" class="mssxsb-input undefined" aria-controls="ms-searchux-popup-0"/>
        - fill("Drug")
      - attempting fill action
        2 × waiting for element to be visible, enabled and editable
          - element is not visible
        - retrying fill action
        - waiting 20ms
        2 × waiting for element to be visible, enabled and editable
          - element is not visible
        - retrying fill action
          - waiting 100ms
        50 × waiting for element to be visible, enabled and editable
           - element is not visible
         - retrying fill action
           - waiting 500ms


      143 |     test('Global Search and Filter Validation', async ({ page }) => {
      144 |         // 1. Search for a known drug or part of a name
    > 145 |         await page.getByPlaceholder('Search', { exact: true }).first().fill('Drug');
          |                                                                        ^
      146 |         await page.waitForTimeout(1000); // Wait for debounce
      147 |
      148 |         const rowCount = await page.locator('.ms-DetailsRow').count();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase4_drugs.spec.ts:145:72

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase4_drugs--34674-earch-and-Filter-Validation-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase4_drugs--34674-earch-and-Filter-Validation-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
…s\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow
Phase 8: Adding User #1...
  77) [webkit] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.react-select__menu').locator('.react-select__option').nth(1)


      37 |
      38 |                 // For Documents, labels often have -- Select ... -- as first option, so we pick nth(1)
    > 39 |                 await menu.locator('.react-select__option').nth(1).click();
         |                                                                    ^
      40 |                 await expect(menu).not.toBeVisible();
      41 |             };
      42 |
        at selectOption (D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:39:68)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase6_documents.spec.ts:43:13

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase6_docume-6f3a2-uments---Full-CRUD-Workflow-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛡️ auth for agents: https://vestauth.com
…erification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
Entering Drug folder: Bulk Drug 1 - 1772286115835
Navigating into Virtual Folder:
Root Folder 1772279866176

  78) [webkit] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-9697e-fy-KPIs-and-Chart-Rendering-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
  79) [webkit] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs

    Error: expect(locator).toBeVisible() failed

    Locator: locator('.breadcrumb-item').filter({ hasText: 'Documents' })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('.breadcrumb-item').filter({ hasText: 'Documents' })


      30 |
      31 |         // 3. Verify Breadcrumb
    > 32 |         await expect(page.locator('.breadcrumb-item', { hasText: 'Documents' })).toBeVisible();
         |                                                                                  ^
      33 |         await expect(page.locator('.breadcrumb-item', { hasText: drugName })).toBeVisible();
      34 |
      35 |         // 4. Verify Document Visibility (Metadata grouping)
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:32:82

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase9_ctd_ve-3b02d-ed-Grouping-and-Breadcrumbs-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase9_ctd_ve-3b02d-ed-Grouping-and-Breadcrumbs-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
  80) [webkit] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction

    Test timeout of 60000ms exceeded while running "beforeEach" hook.

      3 | test.describe('Phase 7: Reports Module Testing', () => {
      4 |
    > 5 |     test.beforeEach(async ({ page }) => {
        |          ^
      6 |         await page.goto('SitePages/Page.aspx');
      7 |         await page.waitForLoadState('load');
      8 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:5:10

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first()


       9 |         // Navigate to Reports & Analytics
      10 |         const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
    > 11 |         await sidebarReports.click();
         |                              ^
      12 |         await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
      13 |     });
      14 |
        at D:\SharePointProjects\Demo1\tests\tests\master_phase7_reports.spec.ts:11:30

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase7_report-80be8-port-and-Filter-Interaction-webkit\error-context.md

  81) [webkit] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: /Add User/i }).first()
        - locator resolved to <button type="button" data-is-focusable="true" data-testid="add-user-btn" class="ms-Button ms-Button--primary root-183">…</button>
      - attempting click action
        - waiting for element to be visible, enabled and stable
      - element was detached from the DOM, retrying


      40 |         for (let i = 1; i <= 3; i++) {
      41 |             console.log(`Phase 8: Adding User #${i}...`);
    > 42 |             await page.getByRole('button', { name: /Add User/i }).first().click();
         |                                                                           ^
      43 |             await expect(page.locator('.form-card__title', { hasText: 'Add New User' })).toBeVisible();
      44 |
      45 |             // Validation Check: Try to save empty
        at D:\SharePointProjects\Demo1\tests\tests\master_phase8_permissions.spec.ts:42:75

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase8_permis-509b7--Users---Full-CRUD-Workflow-webkit\error-context.md

[dotenv@17.3.1] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[dotenv@17.3.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
  82) [webkit] › tests\tests\template.spec.ts:3:5 › Open Template Page ─────────────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=Add Template').first()
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=Add Template').first()


      12 |     // Check Add Template Button
      13 |     const addButton = page.locator('text=Add Template').first();
    > 14 |     await expect(addButton).toBeVisible();
         |                             ^
      15 |
      16 |     // Click Add Template
      17 |     await addButton.click();
        at D:\SharePointProjects\Demo1\tests\tests\template.spec.ts:14:29

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-template-Open-Template-Page-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-template-Open-Template-Page-webkit\error-context.md

  83) [webkit] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('.ms-Grid-row').filter({ hasText: 'Structure' }).locator('.react-select__control').first()


      45 |         // Toggle Structure
      46 |         const structureLabel = page.locator('label', { hasText: 'Structure' });
    > 47 |         await page.locator('.ms-Grid-row', { hasText: 'Structure' }).locator('.react-select__control').first().click();
         |                                                                                                                ^
      48 |
      49 |         const diaOption = page.locator('.react-select__menu').locator('.react-select__option', { hasText: 'DIA reference' });
      50 |         await diaOption.click();
        at D:\SharePointProjects\Demo1\tests\tests\master_phase9_ctd_verification.spec.ts:47:112

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-master_phase9_ctd_ve-6d59e-ructure-Toggle-eCTD-vs-DIA--webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-master_phase9_ctd_ve-6d59e-ructure-Toggle-eCTD-vs-DIA--webkit\error-context.md

  84) [webkit] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ─────────────────────

    Test timeout of 60000ms exceeded.

    Error: locator.click: Test timeout of 60000ms exceeded.
    Call log:
      - waiting for locator('text=Add User').first()
        - locator resolved to <span data-automationid="splitbuttonprimary" class="ms-Button-flexContainer flexContainer-185">…</span>
      - attempting click action
        - waiting for element to be visible, enabled and stable
      - element was detached from the DOM, retrying


      18 |
      19 |     // Click Add User
    > 20 |     await addButton.click();
         |                     ^
      21 |
      22 |     // Check Modal Opens
      23 |     await expect(page.locator('text=User Email').first()).toBeVisible();
        at D:\SharePointProjects\Demo1\tests\tests\users.spec.ts:20:21

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\tests-users-Open-Users-Permissions-Page-webkit\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\tests-users-Open-Users-Permissions-Page-webkit\error-context.md

  84 failed
    [chromium] › tests\login.spec.ts:3:5 › Login to SharePoint ─────────────────────────────────────
    [chromium] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ─────────────────────────
    [chromium] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ───────────────────────────
    [chromium] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ───────────────────────────
    [chromium] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns
    [chromium] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components
    [chromium] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping
    [chromium] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
    [chromium] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping
    [chromium] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping
    [chromium] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation
    [chromium] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy
    [chromium] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD
    [chromium] › tests\tests\master_phase4_drugs.spec.ts:109:9 › Phase 4: Drug Module Testing › Edit and Delete Drug
    [chromium] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation
    [chromium] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD
    [chromium] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow
    [chromium] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering
    [chromium] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction
    [chromium] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow
    [chromium] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
    [chromium] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)
    [chromium] › tests\tests\template.spec.ts:3:5 › Open Template Page ─────────────────────────────
    [chromium] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ─────────────────────
    [firefox] › tests\login.spec.ts:3:5 › Login to SharePoint ──────────────────────────────────────
    [firefox] › tests\tests\categories.spec.ts:3:5 › Open Categories Page ──────────────────────────
    [firefox] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ──────────────────────────
    [firefox] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ────────────────────────────
    [firefox] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ────────────────────────────
    [firefox] › tests\tests\drugs.spec.ts:3:5 › Open Drugs Database Page ───────────────────────────
    [firefox] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns
    [firefox] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components
    [firefox] › tests\tests\master_phase2_templates.spec.ts:84:9 › Phase 2: Template Module Testing › Verify Form Validation (Empty Submission)
    [firefox] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping
    [firefox] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
    [firefox] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping
    [firefox] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping
    [firefox] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation
    [firefox] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy
    [firefox] › tests\tests\master_phase3_categories.spec.ts:101:9 › Phase 3: Category Module Testing › View Category Details
    [firefox] › tests\tests\master_phase3_categories.spec.ts:126:9 › Phase 3: Category Module Testing › Cascading Dropdown Validation
    [firefox] › tests\tests\master_phase3_categories.spec.ts:145:9 › Phase 3: Category Module Testing › Edit and Delete Category
    [firefox] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD
    [firefox] › tests\tests\master_phase4_drugs.spec.ts:85:9 › Phase 4: Drug Module Testing › View/Preview Drug Details
    [firefox] › tests\tests\master_phase4_drugs.spec.ts:109:9 › Phase 4: Drug Module Testing › Edit and Delete Drug
    [firefox] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation
    [firefox] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD
    [firefox] › tests\tests\master_phase5_ctd.spec.ts:96:9 › Phase 5: CTD Folder Module Testing › View Virtual Folder Details
    [firefox] › tests\tests\master_phase5_ctd.spec.ts:119:9 › Phase 5: CTD Folder Module Testing › Edit and Delete Virtual Folder
    [firefox] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow
    [firefox] › tests\tests\master_phase6_documents.spec.ts:97:9 › Phase 6: Document Creation & Workflow Testing › Document Tabs and Filters
    [firefox] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering
    [firefox] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction
    [firefox] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow
    [firefox] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
    [firefox] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)
    [firefox] › tests\tests\reports.spec.ts:3:5 › Open Reports Page ────────────────────────────────
    [firefox] › tests\tests\template.spec.ts:3:5 › Open Template Page ──────────────────────────────
    [firefox] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ──────────────────────
    [webkit] › tests\login.spec.ts:3:5 › Login to SharePoint ───────────────────────────────────────
    [webkit] › tests\tests\ctd.spec.ts:3:5 › Open Create CTD Folder Page ───────────────────────────
    [webkit] › tests\tests\dashboard.spec.ts:3:5 › Open Dashboard Page ─────────────────────────────
    [webkit] › tests\tests\documents.spec.ts:3:5 › Open Documents Page ─────────────────────────────
    [webkit] › tests\tests\master_phase10_global.spec.ts:10:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Consistent Layout Patterns
    [webkit] › tests\tests\master_phase10_global.spec.ts:38:9 › Phase 10: Global UI & Architecture Validation › Architecture Check: Fluent UI and Standard Components
    [webkit] › tests\tests\master_phase2_templates.spec.ts:107:9 › Phase 2: Template Module Testing › Bulk Add Templates - eCTD Mapping
    [webkit] › tests\tests\master_phase2_templates.spec.ts:189:9 › Phase 2: Template Module Testing › View/Preview and Edit/Delete Template Actions
    [webkit] › tests\tests\master_phase2_templates.spec.ts:259:9 › Phase 2: Template Module Testing › Add Template - GMP Mapping
    [webkit] › tests\tests\master_phase2_templates.spec.ts:292:9 › Phase 2: Template Module Testing › Add Template - TMF Mapping
    [webkit] › tests\tests\master_phase2_templates.spec.ts:326:9 › Phase 2: Template Module Testing › Excel Bulk Upload Validation
    [webkit] › tests\tests\master_phase3_categories.spec.ts:15:9 › Phase 3: Category Module Testing › Bulk Add Category Items - Full Hierarchy
    [webkit] › tests\tests\master_phase3_categories.spec.ts:101:9 › Phase 3: Category Module Testing › View Category Details
    [webkit] › tests\tests\master_phase3_categories.spec.ts:145:9 › Phase 3: Category Module Testing › Edit and Delete Category
    [webkit] › tests\tests\master_phase4_drugs.spec.ts:15:9 › Phase 4: Drug Module Testing › Bulk Add Drugs - Full CRUD
    [webkit] › tests\tests\master_phase4_drugs.spec.ts:143:9 › Phase 4: Drug Module Testing › Global Search and Filter Validation
    [webkit] › tests\tests\master_phase5_ctd.spec.ts:14:9 › Phase 5: CTD Folder Module Testing › Bulk Add Root Folders and CRUD
    [webkit] › tests\tests\master_phase6_documents.spec.ts:15:9 › Phase 6: Document Creation & Workflow Testing › Bulk Create Documents - Full CRUD Workflow
    [webkit] › tests\tests\master_phase7_reports.spec.ts:15:9 › Phase 7: Reports Module Testing › Verify KPIs and Chart Rendering
    [webkit] › tests\tests\master_phase7_reports.spec.ts:46:9 › Phase 7: Reports Module Testing › Export and Filter Interaction
    [webkit] › tests\tests\master_phase8_permissions.spec.ts:10:9 › Phase 8: Role-based Permission Testing › Bulk Add Users - Full CRUD Workflow
    [webkit] › tests\tests\master_phase9_ctd_verification.spec.ts:15:9 › Phase 9: Virtual CTD Structure Verification › Verify Metadata-based Grouping and Breadcrumbs
    [webkit] › tests\tests\master_phase9_ctd_verification.spec.ts:41:9 › Phase 9: Virtual CTD Structure Verification › CTD Structure Toggle (eCTD vs DIA)
    [webkit] › tests\tests\template.spec.ts:3:5 › Open Template Page ───────────────────────────────
    [webkit] › tests\tests\users.spec.ts:3:5 › Open Users & Permissions Page ───────────────────────
  6 skipped
  25 passed (29.6m)

  Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
