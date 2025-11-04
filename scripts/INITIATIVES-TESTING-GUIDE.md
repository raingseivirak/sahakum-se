# Initiatives Feature - Testing Guide

## 🎉 What Was Created

The seed script created **5 sample initiatives** with different categories, statuses, and visibility settings:

### 1. **Khmer New Year 2025** 🎊
- **Status:** Published
- **Visibility:** Public
- **Category:** Cultural Event
- **Dates:** April 14-16, 2025
- **Features:** 3 tasks, team members
- **Languages:** EN, SV, KM (all three)

### 2. **Swedish-Khmer Business Directory** 💼
- **Status:** Published
- **Visibility:** Public
- **Category:** Business
- **Dates:** Started January 15, 2025 (ongoing)
- **Languages:** EN, SV, KM

### 3. **Khmer Language Classes for Children** 📚
- **Status:** Published
- **Visibility:** Members Only ⚠️
- **Category:** Education
- **Dates:** February 1 - June 30, 2025
- **Languages:** EN, SV, KM

### 4. **Swedish Driving Theory Translation** 🚗
- **Status:** Published
- **Visibility:** Public
- **Category:** Translation
- **Dates:** Started January 1, 2025 (ongoing)
- **Languages:** EN, SV, KM

### 5. **Monthly Cambodian Cooking Workshops** 🍲
- **Status:** Draft (not visible to public)
- **Visibility:** Public (when published)
- **Category:** Social
- **Dates:** Starting March 15, 2025
- **Languages:** EN, SV, KM

---

## 🧪 How to Test

### 1. **Homepage Section**
Visit: `http://localhost:3000/en`

**What to check:**
- ✅ Initiatives section appears after Events section
- ✅ Shows top 3 published initiatives (only public ones if not logged in)
- ✅ Each card shows: category badge, title, description, date, team size, task count
- ✅ "View all initiatives" button works

**Expected:** You should see 3 initiatives (KNY, Business Directory, Driving Translation)

---

### 2. **Public Initiatives Listing**
Visit: `http://localhost:3000/en/initiatives`

**What to check:**
- ✅ Shows all 4 published PUBLIC initiatives
- ✅ Members-only initiative (Language Classes) NOT shown if logged out
- ✅ Draft initiative (Cooking Workshops) NOT shown
- ✅ Each card is clickable and goes to detail page
- ✅ Category badges show correct labels
- ✅ Responsive grid (1 col mobile, 2 tablet, 3 desktop)

**Expected when logged out:** 3 initiatives
**Expected when logged in:** 4 initiatives (includes Language Classes)

---

### 3. **Initiative Detail Pages**

#### Test Khmer New Year 2025:
Visit: `http://localhost:3000/en/initiatives/khmer-new-year-2025`

**What to check:**
- ✅ Hero section with title, category, dates
- ✅ Featured image displays
- ✅ Full description with rich text formatting
- ✅ Sidebar shows project lead
- ✅ If logged in: shows team members
- ✅ If logged out: shows "Sign in to view team and tasks"

#### Test Language Classes (Members Only):
Visit: `http://localhost:3000/en/initiatives/khmer-language-classes-2025`

**Expected:**
- **Logged out:** 401 error or "Members only" message
- **Logged in:** Full content visible

---

### 4. **Admin Panel - List View**
Visit: `http://localhost:3000/en/admin/initiatives`

**Login:** `admin@sahakumkhmer.se` / `HelloCambodia123`

**What to check:**
- ✅ Shows all 5 initiatives (including draft)
- ✅ Columns: Title, Category, Status, Visibility, Languages, Project Lead, Team, Tasks, Start Date
- ✅ Status badges (Published=green, Draft=gray)
- ✅ Visibility badges (Public=blue, Members Only=purple)
- ✅ Language badges show EN, SV, KM
- ✅ Team count and task count accurate
- ✅ Actions dropdown: View, Edit, Delete
- ✅ "Create Initiative" button works

---

### 5. **Admin Panel - Edit Initiative**
Visit: `http://localhost:3000/en/admin/initiatives/[id]/edit`

**Pick:** Khmer New Year 2025 (has tasks and team members)

**What to check:**

#### Details Tab:
- ✅ All fields populated correctly
- ✅ Can change status, visibility, category
- ✅ Can update dates
- ✅ Can change featured image
- ✅ Three language tabs (EN, SV, KM)
- ✅ TipTap editor loads with existing content
- ✅ Save button updates successfully

#### Team Tab:
- ✅ Shows team members (if any)
- ✅ Shows project lead badge
- ✅ Cannot remove project lead
- ✅ Can remove other members
- ✅ "Add Member" dialog (placeholder for now)

#### Tasks Tab:
- ✅ Kanban board with 4 columns (TODO, IN_PROGRESS, COMPLETED, BLOCKED)
- ✅ Tasks grouped by status
- ✅ Shows task title, priority badge, assignee
- ✅ KNY should have 3 tasks: 1 completed, 1 in progress, 1 todo
- ✅ "Add Task" dialog (placeholder for now)

---

### 6. **Admin Panel - Create Initiative**
Visit: `http://localhost:3000/en/admin/initiatives/create`

**Test creating a new initiative:**

1. **Fill Basic Info:**
   - Slug: `test-initiative`
   - Status: `PUBLISHED`
   - Visibility: `PUBLIC`
   - Category: `SOCIAL`
   - Start Date: Tomorrow
   - Project Lead: Select admin user

2. **Add Translation (English tab):**
   - Title: `Test Initiative`
   - Short Description: `This is a test initiative`
   - Description: Add some rich text with **bold**, *italic*, headings

3. **Optional:**
   - Add Featured Image via Media Selector

4. **Submit:**
   - Click "Create Initiative"
   - Should redirect to initiatives list
   - New initiative should appear

5. **Verify:**
   - Visit `/en/initiatives`
   - See your new initiative
   - Click to view detail page

---

### 7. **Multi-language Testing**

Test each initiative in all three languages:

**Swedish:** `http://localhost:3000/sv/initiatives`
- ✅ All text in Swedish
- ✅ Initiative cards show Swedish titles
- ✅ Category badges in Swedish

**Khmer:** `http://localhost:3000/km/initiatives`
- ✅ All text in Khmer
- ✅ Khmer font renders correctly
- ✅ Initiative cards show Khmer titles

**Individual pages:**
- `/sv/initiatives/khmer-new-year-2025` - Swedish content
- `/km/initiatives/khmer-new-year-2025` - Khmer content

---

## 🐛 Known Limitations (MVP)

These are **intentionally not implemented yet** (future enhancements):

1. **Team Management:**
   - ❌ Cannot add new team members (UI placeholder only)
   - ❌ Cannot change member roles
   - ✅ Can only remove members

2. **Task Management:**
   - ❌ Cannot create new tasks (UI placeholder only)
   - ❌ Cannot edit existing tasks
   - ❌ Cannot drag-and-drop tasks between columns
   - ✅ Can view tasks in kanban board

3. **Initiative Updates:**
   - ❌ Not implemented yet (future feature)
   - Timeline/feed of updates not available

4. **Filtering:**
   - ❌ Cannot filter by category on public listing
   - ❌ Cannot search initiatives
   - Future enhancement

---

## ✅ Success Criteria

Your testing is successful if:

1. ✅ Homepage shows initiatives section with 3 cards
2. ✅ Public listing shows correct initiatives based on login status
3. ✅ Detail pages load with proper content and access control
4. ✅ Admin can view all 5 initiatives (including draft)
5. ✅ Admin can edit initiative details and see team/tasks
6. ✅ Admin can create new initiatives
7. ✅ Multi-language support works (EN/SV/KM)
8. ✅ Members-only content is protected

---

## 🚀 Next Steps

After testing, you can:

1. **Create Real Initiatives:**
   - Delete test initiatives
   - Create actual community initiatives
   - Publish them to homepage

2. **Enhance Features:**
   - Implement team member add/edit
   - Implement task creation/editing
   - Add initiative updates/timeline
   - Add filtering and search

3. **Production Deploy:**
   - Run seed script on production (if desired)
   - Or create initiatives manually via admin

---

## 📝 Notes

- **Draft initiatives** are only visible in admin panel
- **Members-only initiatives** require login to view
- **Public initiatives** are visible to everyone
- All initiatives have **multilingual support** (show what's available)
- Homepage only shows **published, public** initiatives when logged out

Happy testing! 🎉
