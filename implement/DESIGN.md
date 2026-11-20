# Design System and UI Specification

## ManageHub --- V1

**Visual direction:** Warm, modern, friendly, professional\

**Product name:** ManageHub. Display this exact name in the wordmark, landing page, authentication screens, and dashboard. Do not display “Student Management System” as the product brand.
**Primary palette:** Yellow, white, and layered yellow shades\
**Layout language:** Bento grids, rounded cards, clear hierarchy,
generous whitespace\
**Responsive targets:** Desktop, tablet, and mobile

------------------------------------------------------------------------

## 1. Design Principles

1.  **Friendly but credible:** This is an administrative tool for
    educational institutions. It should feel approachable without
    looking childish.
2.  **Yellow as the brand signature:** Use yellow for primary actions,
    highlights, selected states, and small visual accents. Do not place
    large blocks of saturated yellow behind long paragraphs.
3.  **White as the working canvas:** Keep dashboards and data tables
    readable with white and very pale warm backgrounds.
4.  **Bento layout:** Use a modular grid of cards with varied sizes for
    the landing page and dashboard overview.
5.  **Clarity over decoration:** Student data, marks, labels, and
    actions must be easy to scan.
6.  **Consistent interaction:** Buttons, inputs, cards, tables, dialogs,
    and status badges should behave consistently.
7.  **Responsive by design:** Bento cards should reflow naturally
    instead of shrinking into unreadable columns.

------------------------------------------------------------------------

## 2. Color Palette

Use the following design tokens consistently. These are suggested
starting values; maintain the same visual relationships if minor
adjustments are needed for contrast.

  Token         Hex         Usage
  ------------- ----------- ---------------------------------------
  `brand-50`    `#FFFCDF`   Very soft yellow backgrounds
  `brand-100`   `#FFF6B8`   Card accents and selected backgrounds
  `brand-200`   `#FFEC80`   Secondary highlights
  `brand-300`   `#FFDF4D`   Decorative yellow areas
  `brand-400`   `#FFD426`   Main brand yellow
  `brand-500`   `#F5C400`   Primary CTA / active accent
  `brand-600`   `#D9A900`   Hover/pressed accent; use carefully
  `ink-900`     `#202018`   Main headings and primary text
  `ink-700`     `#4A493F`   Body text
  `ink-500`     `#777568`   Secondary text
  `surface`     `#FFFFFF`   Cards and main surfaces
  `canvas`      `#FAFAF5`   App background
  `border`      `#EEEDE4`   Dividers and card borders
  `success`     `#218653`   Success states
  `warning`     `#B7791F`   Warning states
  `danger`      `#C2413B`   Error/destructive states
  `info`        `#3478A8`   Informational states

### Color usage rules

-   Primary button: `brand-500` background with `ink-900` text.
-   Primary button hover: `brand-600` background.
-   Main page background: `canvas`.
-   Main cards: `surface`, with `border` and subtle shadow.
-   Selected navigation item: `brand-100` background and `ink-900` text.
-   Use semantic status colors for status badges; do not use yellow for
    every status.
-   Check contrast for small text and interactive controls. Never use
    pale yellow text on white.

------------------------------------------------------------------------

## 3. Typography

Use a clean sans-serif family such as **Inter** or **Manrope**.

Suggested type scale: - Display / landing hero: 52--64px desktop,
36--42px mobile; bold. - Page title: 28--32px; semibold/bold. - Section
title: 20--24px; semibold. - Card title: 16--18px; semibold. - Body:
14--16px; regular. - Table and metadata: 13--14px. - Eyebrow/label:
11--12px; medium, slightly letter-spaced.

Use readable line-height. Avoid using too many font weights or all-caps
labels.

------------------------------------------------------------------------

## 4. Shape, Spacing, and Elevation

### Radius

-   Small controls: 10--12px.
-   Standard cards: 18--20px.
-   Large bento cards / hero panels: 24--28px.
-   Pills and badges: fully rounded.

### Spacing

Use a consistent 4px/8px spacing rhythm: - 8px: tight icon/label gaps. -
12--16px: form fields and compact card padding. - 20--24px: standard
card padding. - 28--32px: section spacing. - 48--72px: major
landing-page section spacing.

### Borders and shadows

-   Prefer a subtle 1px warm-gray border.
-   Use soft, low-opacity shadows only to lift important cards.
-   Avoid heavy outlines, strong gradients, glassmorphism, and excessive
    blur.
-   Use yellow-tinted decorative glow sparingly in the landing hero
    only.

------------------------------------------------------------------------

## 5. Public Landing Page

### 5.1 Header

-   White or near-white background.
-   Left: simple product wordmark and small abstract academic/record
    icon.
-   Center/right: Product, Features, How it works links.
-   Right: Log in (quiet/outline style) and Get started (yellow primary
    button).
-   Sticky header is optional; if used, keep it compact.
-   Mobile: wordmark plus menu button; show CTA in the mobile menu.

### 5.2 Hero section

Use a two-column layout on desktop: - Left: small eyebrow such as
"STUDENT RECORDS, ORGANIZED", bold headline, short supporting paragraph,
primary CTA "Get started", secondary CTA "Log in". - Right: a large
bento-style product preview, not a stock photo.

Suggested headline: **"Every student record. One clear view."**

Suggested supporting copy: "Organize classes, student profiles, and
semester-wise academic records in one simple workspace for your
institution."

The preview should resemble a real dashboard with: - A small sidebar. -
Student count card. - Class overview card. - Semester progress or
academic-record card. - A small student table snippet.

The preview is illustrative only. Do not show fake real student personal
data. Use clearly fictional names and sample values.

### 5.3 Feature bento grid

Use an asymmetric grid with cards of varied spans. Suggested cards: 1.
**Student records** --- large card with a clean student-list preview. 2.
**Class organization** --- medium card showing batches and sections. 3.
**Semester-wise marks** --- medium card showing semester chips and
subject rows. 4. **Institution workspace** --- wide card explaining
institution-specific access and organized records.

Card treatment: - White surface with warm border. - A few pale-yellow
cards for visual rhythm. - Small icon in a pale-yellow rounded square. -
Short heading and one-sentence description. - Small illustrative UI
element inside selected cards.

### 5.4 How it works

Three simple steps: 1. Set up your institution. 2. Organize programs and
classes. 3. Add students and manage academic records.

Use numbered yellow markers and short explanations.

### 5.5 Final CTA

A wide rounded pale-yellow panel with a concise heading and "Create your
institution" button.

### 5.6 Footer

-   Wordmark and one-line product description.
-   Product links.
-   Login/register links.
-   Copyright line.
-   Keep the footer simple; do not invent social links or legal pages.

------------------------------------------------------------------------

## 6. Authentication Pages

### 6.1 Shared layout

-   Centered card on a pale warm background.
-   Small brand mark above the form.
-   White card with 20--24px radius.
-   Clear page title and short helper text.
-   Inputs with labels above them, not placeholder-only labels.
-   Yellow primary submit button.
-   Link to the alternate auth page.
-   Inline validation and server errors.

### 6.2 Registration form

Fields: - Institution name. - Institution email. - Administrator full
name. - Administrator email. - Password. - Confirm password.

Use clear password guidance. Include a short note that registration
creates the institution workspace and first administrator account.

### 6.3 Login form

Fields: - Email. - Password. - Show/hide password control. - Login
button. - Link to institution registration.

Do not show a public "Faculty register" action. Faculty accounts are
created/invited by an institution administrator in V1.

------------------------------------------------------------------------

## 7. Authenticated Dashboard Shell

### 7.1 Overall layout

-   Desktop: fixed or sticky left sidebar around 240--260px; main
    content fills remaining width.
-   App canvas: `canvas`.
-   Main content max-width can be generous; use consistent horizontal
    padding.
-   Header includes page context, institution name, and user menu.
-   Tablet: collapsible sidebar.
-   Mobile: compact top bar and slide-out navigation or bottom-safe
    navigation pattern.

### 7.2 Sidebar

Suggested navigation: - Overview - Programs - Classes - Students -
Institution settings

Use Lucide icons, concise labels, and clear active state. Yellow-tinted
background marks the active route. ADMIN-only navigation must not appear
for FACULTY, but backend permissions remain authoritative.

### 7.3 Header

-   Breadcrumb or current page title.
-   Optional quick action relevant to current page.
-   Institution label.
-   User avatar with initials and dropdown.
-   Logout in the dropdown.

------------------------------------------------------------------------

## 8. Dashboard Overview

Use a bento grid rather than a uniform wall of identical cards.

Suggested desktop composition: - Top row: welcome block and primary
quick action. - Four compact metric cards: Students, Classes, Programs,
Faculty. - Wide card: recent students or recent updates. - Medium card:
class/batch overview. - Small card: quick actions.

Each metric card: - Small icon tile. - Label. - Large count. - Optional
short helper label. - Use pale-yellow accent on one or two cards, not
every card.

For a new institution, show an onboarding empty state: - "Your workspace
is ready." - Steps to create the first program, class, and student. -
Direct action buttons.

Never display fabricated counts as if they were live data. Use zero
values or empty states until API data exists.

------------------------------------------------------------------------

## 9. Data Management Screens

### 9.1 General list-page pattern

Every list page should include: - Page title and short description. -
Primary action button. - Search/filter row. - Table or responsive card
list. - Pagination where appropriate. - Loading skeleton. - Empty
state. - Error/retry state.

### 9.2 Programs

-   Program cards or table.
-   Show program name, department, duration, and semester count.
-   Create/edit in a modal or dedicated page.
-   Program details show semester 1--8 in a clean grid/list.
-   Archive action requires confirmation.

### 9.3 Classes

-   Table columns: Class, Program, Batch year, Section, Student count,
    Actions.
-   Filters: program, batch year.
-   Class detail page includes summary and student list.
-   Admin can assign faculty from the class detail page.

### 9.4 Students

-   Table columns: Student, Enrollment number, Roll number, Class,
    Admission year, Actions.
-   Search by student name, enrollment number, or roll number.
-   Filter by class.
-   On mobile, switch to stacked student cards rather than squeezing the
    desktop table.
-   Use a compact avatar with initials; do not require profile-photo
    uploads in V1.
-   Add/edit form should group fields logically.

### 9.5 Student profile

Use a clear profile header with: - Student name. - Enrollment number. -
Roll number. - Class/program. - Admission year.

Below it, use semester tabs or an eight-semester selector. Each semester
view shows subject, subject code, marks, maximum marks, grade/status
where available, and credits where available.

Make marks editing explicit and controlled. Show maximum marks next to
the input. Do not invent SGPA/CGPA calculations.

### 9.6 Marks entry

-   Use a clean table on desktop and stacked subject rows on mobile.
-   Show subject name/code, maximum marks, marks obtained, and optional
    grade/result.
-   Validate input inline.
-   Save feedback should be visible and accessible.
-   Prevent accidental duplicate entries through the API and database
    constraints.

------------------------------------------------------------------------

## 10. Component Library

Build reusable components: - `Button` --- primary, secondary, outline,
ghost, danger. - `Input`, `Select`, `Textarea`. - `FormField` --- label,
hint, error. - `Card`, `BentoCard`, `MetricCard`. - `Badge` --- semantic
statuses. - `Avatar`. - `PageHeader`. - `DataTable`. - `SearchInput`,
`FilterSelect`. - `Pagination`. - `Modal` / `Dialog`. -
`ConfirmDialog`. - `EmptyState`. - `LoadingSkeleton`. - `Toast` or
inline alert. - `Sidebar`, `Topbar`, `AppLayout`.

Use Lucide React icons consistently. Do not use emoji as interface
icons.

------------------------------------------------------------------------

## 11. Interaction and Motion

-   Keep transitions subtle: approximately 150--220ms.
-   Buttons have hover, active, focus, and disabled states.
-   Cards may lift slightly on hover only when clickable.
-   Avoid excessive animation, parallax, or scroll effects.
-   Respect `prefers-reduced-motion`.
-   Use confirmation dialogs for archive/destructive actions.
-   Forms should preserve entered values when a recoverable API error
    occurs.
-   Display success only after server confirmation.

------------------------------------------------------------------------

## 12. Responsive Behavior

### Desktop (≥ 1024px)

-   Full sidebar.
-   Multi-column bento grid.
-   Full data tables.
-   Two-column forms where appropriate.

### Tablet (768px--1023px)

-   Collapsible sidebar.
-   Two-column or single-column bento cards depending on available
    width.
-   Tables may scroll horizontally only when necessary.

### Mobile (\< 768px)

-   Single-column content.
-   Compact top navigation.
-   Full-width primary actions.
-   Forms in one column.
-   Student and class tables convert to readable cards or carefully
    designed responsive layouts.
-   Modals become near-full-screen sheets where appropriate.
-   Maintain comfortable touch targets (around 44px).

------------------------------------------------------------------------

## 13. Accessibility and UX Quality

-   Use semantic HTML landmarks and headings in order.
-   Every form control has an associated visible label.
-   Keyboard users can reach all actions.
-   Focus indicators are clearly visible.
-   Dialogs manage focus and close accessibly.
-   Do not rely on color alone to communicate errors or statuses.
-   Use accessible contrast for text and controls.
-   Provide descriptive button text and icon labels where needed.
-   Announce form errors and save feedback appropriately.

------------------------------------------------------------------------

## 14. Design Acceptance Checklist

-   [ ] Yellow/white palette is consistent across public and app pages.
-   [ ] Landing page uses an asymmetric bento grid.
-   [ ] Dashboard uses a useful bento layout without visual clutter.
-   [ ] Typography hierarchy is clear.
-   [ ] Cards use consistent radius, spacing, borders, and shadows.
-   [ ] Primary actions are visually obvious.
-   [ ] Tables and marks remain readable.
-   [ ] Forms have visible labels and clear errors.
-   [ ] Empty, loading, success, and failure states are designed.
-   [ ] Mobile navigation and data layouts work.
-   [ ] Keyboard focus and contrast are accessible.
-   [ ] No fake live data or non-functional controls remain.
