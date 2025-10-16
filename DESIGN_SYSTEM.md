# Platform Design System

**Version 1.1.1** | Last Updated: October 16, 2025

A comprehensive design system for building consistent, accessible, and professional UI across the platform application.

---

## 📐 1. Design Principles

### Philosophy
Our design system embodies a **minimalistic, professional, and accessible** approach that prioritizes:

- **Clarity over decoration** - Every element serves a purpose
- **Calm color palette** - Soft, muted tones that reduce cognitive load
- **Subtle depth** - Light shadows and borders create hierarchy without overwhelming
- **Generous whitespace** - Breathing room improves readability and focus
- **Accessibility** - WCAG AA compliance in all color combinations
- **Mobile first** - Responsive design that works beautifully on all devices

### Core Values

**Clarity**
- Clear visual hierarchy through consistent typography scales
- Distinct interactive states (hover, focus, disabled)
- Status-based color coding for instant recognition

**Contrast**
- Dark text on light backgrounds (minimum 4.5:1 ratio)
- Status colors that stand out without being jarring
- Consistent use of slate for neutrals, avoiding pure black/white

**Hierarchy**
- Typography: Bold titles, medium subtitles, regular body text
- Spacing: Larger gaps between major sections, smaller within groups
- Color intensity: Important elements use stronger tints

---

## 🎨 2. Color System

### Color Philosophy
We use a **slate-based neutral palette** with soft, pastel status colors. All colors are chosen to:
- Work harmoniously together
- Meet WCAG AA accessibility standards
- Reduce eye strain with muted tones
- Provide clear semantic meaning

### Primary Palette

#### Neutral Colors (Slate Scale)
```
Page Background:    bg-slate-50     #F8FAFC  (Off-white, warmer than pure white)
Surface:            bg-white        #FFFFFF  (Cards, modals)
Surface Alt:        bg-slate-50/30  rgba(248, 250, 252, 0.3)  (Subtle tinted backgrounds)
Border Default:     border-slate-200 #E2E8F0
Border Subtle:      border-slate-200/60 rgba(226, 232, 240, 0.6)
Text Primary:       text-slate-900  #0F172A  (Headings, titles)
Text Secondary:     text-slate-700  #334155  (Body text)
Text Tertiary:      text-slate-600  #475569  (Supporting text)
Text Muted:         text-slate-500  #64748B  (Metadata, labels)
```

#### Action Colors
```
Primary (Default):  bg-slate-700    #334155  hover:bg-slate-800 #1E293B
                    text-white
                    Used for: Primary buttons, active filter states

Secondary:          bg-slate-600    #475569  hover:bg-slate-700 #334155
                    text-white
                    Used for: Secondary actions
```

### Status Colors

#### Success (Emerald)
```
Background Light:   bg-emerald-50   #ECFDF5
Background:         bg-emerald-100  #D1FAE5
Border Light:       border-emerald-200 #A7F3D0
Accent:             border-emerald-300 #6EE7B7  (For left accent bars)
Text:               text-emerald-900 #064E3B
Icon:               text-emerald-600 #059669

Usage: Completed requests, success messages, positive confirmations
Tailwind: bg-emerald-100 text-emerald-900 border-emerald-200
```

#### Warning (Amber)
```
Background Light:   bg-amber-50     #FFFBEB
Background:         bg-amber-100    #FEF3C7
Border Light:       border-amber-200 #FDE68A
Accent:             border-amber-300 #FCD34D  (For left accent bars)
Text:               text-amber-900  #78350F
Icon:               text-amber-600  #D97706

Usage: In-progress requests, pending actions, caution states
Tailwind: bg-amber-100 text-amber-900 border-amber-200
```

#### Info (Blue)
```
Background Light:   bg-blue-50      #EFF6FF
Background:         bg-blue-100     #DBEAFE
Border Light:       border-blue-200 #BFDBFE
Accent:             border-blue-300 #93C5FD  (For left accent bars)
Text:               text-blue-900   #1E3A8A
Icon:               text-blue-600   #2563EB
Primary Action:     bg-blue-600     #2563EB  hover:bg-blue-700 #1D4ED8

Usage: Pending requests (normal priority), informational alerts
Tailwind: bg-blue-100 text-blue-900 border-blue-200
```

#### Error/Danger (Red)
```
Background Light:   bg-red-50       #FEF2F2
Background:         bg-red-100      #FEE2E2
Border Light:       border-red-200  #FECACA
Accent:             border-red-300  #FCA5A5  (For left accent bars)
Text:               text-red-700    #B91C1C
Icon:               text-red-600    #DC2626

Usage: High priority, errors, destructive actions, cancellations
Tailwind: bg-red-50 text-red-700 border-red-200 (for buttons)
Tailwind: bg-red-100 text-red-900 border-red-200 (for badges)
```

### Status Color Application Matrix

| Component Type | Success | Warning | Info | Error |
|---------------|---------|---------|------|-------|
| **Badge** | `bg-emerald-100 text-emerald-800 border-emerald-200` | `bg-amber-100 text-amber-800 border-amber-200` | `bg-blue-100 text-blue-800 border-blue-200` | `bg-red-100 text-red-800 border-red-200` |
| **Card Background** | `bg-emerald-50/30 border-emerald-200/50` | `bg-amber-50/30 border-amber-200/50` | `bg-blue-50/30 border-blue-200/50` | `bg-red-50/30 border-red-200/50` |
| **Accent Bar** | `border-l-4 border-l-emerald-200` | `border-l-4 border-l-amber-200` | `border-l-4 border-l-blue-200` | `border-l-4 border-l-red-200` |
| **Alert Banner** | `bg-emerald-100 border border-emerald-300` | `bg-amber-100 border border-amber-300` | `bg-blue-600 text-white` | `bg-red-100 border border-red-300` |
| **Button (Destructive)** | N/A | N/A | N/A | `bg-red-50 hover:bg-red-100 text-red-700 border border-red-200` |

### Icon Container Colors
```
Default:    bg-slate-100 text-slate-600
Success:    bg-emerald-100 text-emerald-600
Warning:    bg-amber-100 text-amber-600
Info:       bg-blue-100 text-blue-600
Error:      bg-red-100 text-red-600
```

---

## ✍️ 3. Typography

### Font Family
```css
Primary Font: Inter (sans-serif)
Fallback: ui-sans-serif, system-ui, -apple-system, sans-serif

Tailwind: font-sans (default)
```

### Type Scale & Hierarchy

#### Display & Headings
```
Page Title (H1):        text-2xl md:text-3xl font-bold text-slate-900 leading-tight
  Example: "My Service Requests"
  Line Height: leading-tight (1.25)
  
Section Heading (H2):   text-xl font-bold text-slate-900 leading-tight
  Example: Card titles, modal headers
  Line Height: leading-tight (1.25)
  
Subsection (H3):        text-lg font-semibold text-slate-900 leading-snug
  Example: Card subtitles, section headers
  Line Height: leading-snug (1.375)
```

#### Body Text
```
Body Primary:           text-sm text-slate-700 leading-relaxed
  Example: Card descriptions, paragraph content
  Font Weight: font-normal (400)
  Line Height: leading-relaxed (1.625)
  
Body Secondary:         text-sm text-slate-600 leading-normal
  Example: Supporting information
  Font Weight: font-normal (400)
  Line Height: leading-normal (1.5)
```

#### Metadata & Labels
```
Label:                  text-xs text-slate-500 font-medium uppercase tracking-wide
  Example: "PENDING", "Category", field labels
  Letter Spacing: tracking-wide (0.025em)
  Font Weight: font-medium (500)
  
Small Text:             text-xs text-slate-600 leading-normal
  Example: Timestamps, helper text
  Line Height: leading-normal (1.5)
  
Tiny Text:              text-[10px] text-slate-500 uppercase font-medium
  Example: Summary card labels
  Font Weight: font-medium (500)
```

#### Interactive Text
```
Button Text (Primary):  text-sm font-medium text-white
Button Text (Secondary): text-sm font-medium text-slate-700
Link Text:              text-sm text-blue-600 hover:text-blue-700 underline
```

### Typography Usage Guidelines

**Font Weight Scale:**
- `font-normal (400)`: Body text, descriptions
- `font-medium (500)`: Labels, metadata, button text
- `font-semibold (600)`: Card subtitles, section headers
- `font-bold (700)`: Page titles, card titles, emphasis

**When to Use Each:**
- **Titles**: Always `font-bold` for maximum hierarchy
- **Subtitles**: Use `font-semibold` for section differentiation
- **Body**: Stick to `font-normal` for readability
- **Labels/Metadata**: Use `font-medium` with uppercase for clarity

---

## 📏 4. Spacing & Layout

### Spacing Scale (8px Base Grid)

```
Base Unit: 0.25rem (4px)

Micro Spacing:
  gap-1     4px     Between icon and text
  gap-1.5   6px     Tight inline elements
  gap-2     8px     Default inline spacing
  gap-2.5   10px    Comfortable inline spacing
  gap-3     12px    Small group spacing

Component Internal Spacing:
  p-2.5     10px    Compact badges, small alerts
  p-3       12px    Medium badges, tight sections
  p-4       16px    Default button padding, comfortable sections
  p-5       20px    Card internal padding

Section Spacing:
  space-y-3   12px    Between cards in a list
  space-y-4   16px    Between form groups
  space-y-6   24px    Between major page sections
  
  mb-4        16px    After section headers
  mb-3        12px    After subsection headers
  mb-2        8px     After labels, before inputs
```

### Layout Containers

#### Page Container
```
<div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
  <!-- Page content -->
</div>

Breakdown:
- min-h-screen: Full viewport height
- bg-slate-50: Soft background
- p-4 sm:p-6: Responsive padding (16px mobile, 24px desktop)
- space-y-6: 24px between major sections
```

#### Card Container
```
<Card className="bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200">
  <div className="p-5">
    <!-- Card content -->
  </div>
</Card>

Breakdown:
- bg-white: Clean white surface
- border border-slate-200: Subtle border
- shadow-md: Soft depth (default)
- hover:shadow-xl: Enhanced depth on hover
- p-5: Comfortable internal padding (20px)
```

### Grid & Flex Conventions

#### Responsive Grid Layouts
```
Stats Cards (2-4 columns):
grid grid-cols-2 md:grid-cols-4 gap-3

Form Fields (1-2 columns):
grid grid-cols-1 sm:grid-cols-2 gap-3

Info Grid (2 columns):
grid grid-cols-1 sm:grid-cols-2 gap-3
```

#### Flex Patterns
```
Header Row (Space between):
flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4

Button Group (Inline):
flex flex-wrap gap-2

Icon + Text (Inline):
flex items-center gap-2

Vertical Stack:
flex flex-col gap-3
```

### Border Radius Scale
```
Small:      rounded-lg    8px     Buttons, small cards
Default:    rounded-lg    8px     Default for most elements
Medium:     rounded-xl    12px    Icon containers, summary cards
Large:      rounded-2xl   16px    Modals, large cards
```

---

## 🧩 5. Component Styling Tokens

### Buttons

#### Primary Button
```jsx
<Button variant="primary" size="md">
  Action
</Button>

Classes: bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-500 
         font-medium rounded-lg px-4 py-2 text-sm cursor-pointer
         transition-colors duration-200

States:
- Default: Dark slate background
- Hover: Darker slate
- Focus: Ring outline (2px slate)
- Disabled: opacity-50 cursor-not-allowed
```

#### Secondary Button (Outline)
```jsx
<Button variant="outline" size="sm">
  Secondary Action
</Button>

Classes: bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 
         focus:ring-slate-500 font-medium rounded-lg px-3 py-1.5 text-sm 
         cursor-pointer transition-colors duration-200

States:
- Default: White bg with slate border
- Hover: Light slate background
- Focus: Ring outline
- Disabled: opacity-50
```

#### Danger/Destructive Button
```jsx
<Button variant="danger" size="sm">
  Cancel
</Button>

Classes: bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 
         focus:ring-red-500 font-medium rounded-lg px-3 py-1.5 text-sm
         cursor-pointer transition-colors duration-200

States:
- Default: Light red background
- Hover: Slightly darker red background
- Focus: Red ring outline
```

#### Button Sizes
```
Small:  px-3 py-1.5 text-sm      (12px 6px, 14px text)
Medium: px-4 py-2 text-sm        (16px 8px, 14px text)
Large:  px-5 py-2.5 text-base    (20px 10px, 16px text)
```

#### Icon Button Pattern
```jsx
<Button className="flex items-center gap-2">
  <Icon className="w-4 h-4" strokeWidth={2} />
  <span>Button Text</span>
</Button>
```

---

### Badges

#### Status Badges
```jsx
// Success Badge
<Badge variant="success">Completed</Badge>
Classes: bg-emerald-100 text-emerald-800 border border-emerald-200
         px-2.5 py-1 text-xs font-medium rounded-md

// Warning Badge
<Badge variant="warning">Medium</Badge>
Classes: bg-amber-100 text-amber-800 border border-amber-200
         px-2.5 py-1 text-xs font-medium rounded-md

// Info Badge  
<Badge variant="info">Pending</Badge>
Classes: bg-blue-100 text-blue-800 border border-blue-200
         px-2.5 py-1 text-xs font-medium rounded-md

// Error Badge
<Badge variant="danger">High Priority</Badge>
Classes: bg-red-100 text-red-800 border border-red-200
         px-2.5 py-1 text-xs font-medium rounded-md
```

#### Badge Icon Pattern
```jsx
<Badge className="flex items-center gap-1.5">
  <Icon className="w-3.5 h-3.5" />
  <span>Label</span>
</Badge>
```

---

### Cards

#### Standard Card
```jsx
<Card className="bg-white border border-slate-200 shadow-md hover:shadow-xl 
                 transition-all duration-200 rounded-lg">
  <div className="p-5">
    {/* Content */}
  </div>
</Card>

Structure:
- Shadow: shadow-md (default), shadow-xl (hover)
- Border: 1px slate-200
- Padding: p-5 (20px)
- Transition: transition-all duration-200
```

#### Status Card with Accent Bar
```jsx
<Card className="bg-emerald-50/30 border-emerald-200/50 border-l-4 
                 border-l-emerald-200 border shadow-md hover:shadow-xl 
                 transition-all duration-200">
  <div className="p-5">
    {/* Content */}
  </div>
</Card>

Variants:
- Success: bg-emerald-50/30 border-emerald-200/50 border-l-emerald-200
- Warning: bg-amber-50/30 border-amber-200/50 border-l-amber-200
- Info: bg-blue-50/30 border-blue-200/50 border-l-blue-200
- Error: bg-red-50/30 border-red-200/50 border-l-red-200
```

#### Card Header Pattern
```jsx
<div className="flex items-start justify-between gap-3 mb-4 pb-3 
                border-b border-slate-200/60">
  <div className="flex-1 min-w-0">
    <h3 className="text-lg font-bold text-slate-900 mb-2">Title</h3>
    <div className="flex flex-wrap items-center gap-2">
      {/* Badges */}
    </div>
  </div>
</div>
```

#### Card Footer Pattern
```jsx
<div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
  {/* Action buttons */}
</div>
```

---

### Inputs / Text Fields

#### Standard Input
```jsx
<Input 
  placeholder="Enter text..."
  className="w-full pl-9 text-sm h-10 border-slate-300 
             focus:border-slate-400 focus:ring-2 focus:ring-slate-500 
             rounded-lg"
/>

Classes: bg-white border border-slate-300 hover:border-slate-400
         focus:border-slate-400 focus:ring-2 focus:ring-slate-500
         px-3 py-2 text-sm rounded-lg transition-colors

States:
- Default: Slate-300 border
- Hover: Slate-400 border
- Focus: Slate-400 border + 2px ring
- Error: border-red-300 focus:ring-red-500
```

#### Input with Icon
```jsx
<div className="relative">
  <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="w-full pl-9..." />
</div>
```

---

### Checkboxes & Radio Buttons

#### Standard Checkbox
```jsx
<Checkbox 
  checked={isChecked}
  onChange={setIsChecked}
  label="Option label"
/>

Classes: w-4 h-4 rounded border-2 border-slate-300 
         bg-white checked:bg-slate-600 checked:border-slate-600
         hover:border-slate-400 focus:outline-none focus:ring-2 
         focus:ring-slate-500/20 focus:ring-offset-2
         transition-all duration-200 cursor-pointer

States:
- Default: White bg, slate-300 border (2px)
- Hover: Slate-400 border
- Focus: Subtle slate ring (20% opacity, no harsh outline)
- Checked: Slate-600 background and border (muted, professional)
- Disabled: opacity-50 cursor-not-allowed
```

#### Checkbox with Label
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <Checkbox 
    id="option-1"
    checked={isChecked}
    onChange={setIsChecked}
  />
  <span className="text-sm text-slate-700">Option label</span>
</label>

Label Styling:
- Text: text-sm text-slate-700 (14px, readable)
- Gap: gap-2 (8px between checkbox and text)
- Cursor: cursor-pointer (entire label clickable)
- Hover: Optional hover:text-slate-900 for emphasis
```

#### Checkbox Sizing
```
Standard:  w-4 h-4    (16px × 16px) - Default for forms
Large:     w-5 h-5    (20px × 20px) - Better for touch targets
```

#### Design Rationale
- **Muted checked color**: Using `bg-slate-600` instead of bright blue maintains the calm, professional aesthetic
- **Subtle focus ring**: `ring-slate-500/20` provides feedback without harsh outlines
- **2px border**: Slightly thicker border (border-2) makes unchecked state more visible
- **Smooth transitions**: `transition-all duration-200` for polished interactions
- **No harsh outlines**: `focus:outline-none` removes browser defaults, replaced with soft ring

---

### Icon Containers

#### Default Icon Container
```jsx
<div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
  <Icon className="w-4 h-4 text-slate-600" strokeWidth={2} />
</div>

Sizes:
- Small:  w-8 h-8   (icon: w-4 h-4)
- Medium: w-10 h-10 (icon: w-5 h-5)
- Large:  w-11 h-11 (icon: w-5 h-5)
```

#### Status Icon Containers
```jsx
// Success
<div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
  <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
</div>

// Warning  
<div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
  <Hammer className="w-5 h-5 text-amber-600" strokeWidth={2} />
</div>

// Info
<div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
  <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
</div>
```

---

### Summary/Stat Cards

#### Clickable Summary Card
```jsx
<button 
  onClick={() => setFilter('pending')}
  className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 
             border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all 
             cursor-pointer text-left"
>
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
      <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs text-blue-700 uppercase font-semibold tracking-wide">
        Pending
      </p>
      <p className="text-2xl font-bold text-blue-900">{count}</p>
    </div>
  </div>
</button>

Active State: border-blue-400 shadow-md
```

---

### Alert Banners

#### Info Alert (Prominent)
```jsx
<div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg 
                    flex items-center justify-center">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-white mb-1">Heading</p>
      <p className="text-sm text-blue-100">Description</p>
    </div>
  </div>
</div>
```

#### Status Alert (Subtle)
```jsx
// Success
<div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-lg 
                flex items-center gap-2.5">
  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
  <p className="font-medium text-emerald-900 text-sm">Work Completed</p>
</div>

// Warning
<div className="p-4 bg-amber-100 border border-amber-300 rounded-lg">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
      <Wrench className="w-5 h-5 text-amber-700" />
    </div>
    <div>
      <p className="font-semibold text-slate-900">Heading</p>
      <p className="text-sm text-slate-700">Description</p>
    </div>
  </div>
</div>
```

---

### Filter Buttons

```jsx
<Button
  variant={isActive ? 'primary' : 'outline'}
  size="sm"
  className="whitespace-nowrap flex items-center gap-2 font-medium"
>
  <Icon className="w-4 h-4" strokeWidth={2} />
  Filter Label
</Button>

Active State: Primary button (slate-700)
Inactive State: Outline button (white with border)
```

---

## 🎭 6. Interactive States & Motion

### Transition Timing
```
Default:        transition-colors duration-200
Smooth:         transition-all duration-200
Fast:           transition-all duration-150 ease-in-out
Slow:           transition-all duration-300 ease-out
```

### Hover States

#### Buttons
```
Primary:        hover:bg-slate-800
Outline:        hover:bg-slate-50
Danger:         hover:bg-red-100
```

#### Cards
```
Default Shadow: shadow-md
Hover Shadow:   hover:shadow-xl
Transition:     transition-all duration-200
```

#### Interactive Elements
```
Links:          hover:text-blue-700 hover:underline
Icon Buttons:   hover:bg-slate-100 rounded-lg p-2
```

### Focus States
```
All Interactive Elements:
focus:outline-none focus:ring-2 focus:ring-offset-2

Primary:        focus:ring-slate-500
Success:        focus:ring-emerald-500
Warning:        focus:ring-amber-500
Info:           focus:ring-blue-500
Danger:         focus:ring-red-500
```

### Active States
```
Buttons:        active:scale-[0.98] (subtle press effect)
Cards:          No active state needed
Links:          active:text-blue-800
```

### Disabled States
```
All Elements:   disabled:opacity-50 disabled:cursor-not-allowed
Buttons:        No hover/focus effects when disabled
```

### Animation Guidelines

**When to Use Animations:**
- ✅ Button hovers (color transitions)
- ✅ Card hovers (shadow transitions)
- ✅ Focus states (ring appearance)
- ✅ Smooth page transitions
- ❌ Avoid: Scale animations, rotations, complex transforms
- ❌ Avoid: Animations on every element

**Motion Principles:**
- Keep animations subtle (200-300ms)
- Use `ease-in-out` for natural motion
- Shadow transitions for depth perception
- Color transitions for state changes

---

## ♿ 7. Accessibility Guidelines

### Color Contrast Requirements

#### Text Contrast (WCAG AA)
```
Large Text (18px+):     Minimum 3:1 contrast ratio
Normal Text (16px):     Minimum 4.5:1 contrast ratio
Small Text (14px):      Minimum 4.5:1 contrast ratio

✅ Approved Combinations:
- text-slate-900 on bg-white (16.1:1)
- text-slate-700 on bg-white (8.3:1)
- text-slate-600 on bg-white (6.3:1)
- text-emerald-900 on bg-emerald-100 (8.2:1)
- text-blue-900 on bg-blue-100 (8.9:1)
- text-amber-900 on bg-amber-100 (8.5:1)
- text-red-700 on bg-red-50 (7.1:1)
```

#### Interactive Element Contrast
```
Buttons:        3:1 contrast against background
Borders:        3:1 contrast for focus indicators
Icons:          3:1 contrast against background
```

### Focus Management

#### Focus Rings (Required)
```jsx
All interactive elements must have visible focus:

<button className="focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-slate-500">
  Button
</button>

Ring Colors by Context:
- Default: focus:ring-slate-500
- Primary Action: focus:ring-blue-500
- Success: focus:ring-emerald-500
- Warning: focus:ring-amber-500
- Danger: focus:ring-red-500
```

#### Focus Order
```
Ensure logical tab order:
1. Primary navigation
2. Page title / header actions
3. Filters / search
4. Main content (cards, lists)
5. Footer / secondary actions
```

### Minimum Touch Targets
```
Mobile Buttons:     min-h-[44px] min-w-[44px] (iOS guideline)
Desktop Buttons:    min-h-[36px] (comfortable clicking)
Icon Buttons:       p-2 (8px padding around icon)

Example:
<button className="px-4 py-2">     // 44px height on mobile
  Action
</button>
```

### Keyboard Navigation

#### Required Keyboard Support
```
Buttons:        Enter, Space to activate
Links:          Enter to follow
Forms:          Tab to navigate, Enter to submit
Modals:         Escape to close
Filters:        Arrow keys to navigate
```

#### Skip Links (Recommended)
```jsx
<a href="#main-content" 
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 
              focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
  Skip to main content
</a>
```

### Screen Reader Support

#### Semantic HTML
```jsx
✅ Use semantic elements:
<main>      Main content area
<nav>       Navigation menus
<article>   Independent content (cards)
<section>   Thematic grouping
<button>    Interactive actions (not <div>)
<a>         Navigation links (not <button>)
```

#### ARIA Labels
```jsx
// Icon-only buttons
<button aria-label="Close modal">
  <X className="w-4 h-4" />
</button>

// Status indicators
<Badge aria-label="Status: Completed">
  Completed
</Badge>

// Loading states
<button aria-busy="true" disabled>
  Loading...
</button>
```

### Typography Accessibility

#### Minimum Font Sizes
```
Body Text:      14px (text-sm) minimum
Small Text:     12px (text-xs) for metadata only
Avoid:          < 12px text
```

#### Line Height
```
Body Text:      leading-relaxed (1.625)
Headings:       leading-tight (1.25)
Compact Text:   leading-normal (1.5)
```

#### Text Spacing
```
Letter Spacing: 
- Default: tracking-normal
- Labels: tracking-wide (0.025em)
- Avoid: tracking-tight on body text
```

---

## 📱 8. Responsive Design System

### Mobile-First Philosophy

Our design system follows a **mobile-first approach**, ensuring optimal experience across all device sizes:
- Start with mobile (320px+) and enhance for larger screens
- Touch-friendly targets (minimum 44px on mobile)
- Readable typography at all sizes
- Progressive enhancement for desktop features

### Breakpoint System

#### Standard Breakpoints (Tailwind)
```
xs:  0px - 639px     (Mobile phones, portrait)
sm:  640px - 767px   (Large phones, small tablets)
md:  768px - 1023px  (Tablets, landscape)
lg:  1024px - 1279px (Small laptops, desktops)
xl:  1280px+         (Large desktops)
2xl: 1536px+         (Extra large displays)
```

#### Usage in Code
All breakpoints are centralized in `client/src/styles/responsive.config.ts` for easy modification:

```typescript
import { responsiveGrids, responsiveSpacing, responsiveTypography } from '@/styles/responsive.config';

// Use predefined responsive classes
<div className={responsiveGrids.stats4}>
  {/* 2 cols on mobile, 4 on desktop */}
</div>
```

### Responsive Layout Patterns

#### Navigation & Sidebar

**Desktop (lg+):**
- Persistent sidebar (256px width)
- Visible navigation in header
- Full horizontal space

**Mobile/Tablet (< lg):**
- Hamburger menu button
- Slide-in sidebar overlay
- Collapsible navigation
- Auto-close on route change

```tsx
// Sidebar visibility
className="hidden lg:block"  // Desktop only
className="lg:hidden"         // Mobile only
```

#### Header Adaptation

**Desktop:**
```
[Menu] [Logo + Name] | [Nav Links] | [Notifications] [User Avatar + Name] [Logout]
```

**Tablet:**
```
[Menu] [Logo + Name] | [Notifications] [User Avatar] [Logout]
```

**Mobile:**
```
[Menu] [Logo] | [Bell] [Avatar] [Exit]
```

### Responsive Grid Systems

#### Stats Cards
```tsx
// 4-column stats (2 on mobile, 4 on desktop)
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">

// 3-column stats (1 on mobile, 2 on tablet, 3 on desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

// Admin stats (2-3-4-7 progression)
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
```

#### Content Grids
```tsx
// Two-column content (stacked on mobile)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

// Three-column content
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
```

#### Form Layouts
```tsx
// Two-column form
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
```

### Responsive Spacing

#### Page-Level Spacing
```
Mobile:  p-3      (12px padding)
Tablet:  p-4      (16px padding)
Desktop: p-6      (24px padding)

Usage: className={responsiveSpacing.page}
```

#### Section Spacing
```
Mobile:  space-y-3  (12px between sections)
Tablet:  space-y-4  (16px between sections)
Desktop: space-y-6  (24px between sections)

Usage: className={responsiveSpacing.sectionY}
```

#### Card Padding
```
Mobile:  p-3      (12px)
Tablet:  p-4      (16px)
Desktop: p-5      (20px)

Usage: className={responsiveSpacing.cardPadding}
```

#### Component Gaps
```
Small:     gap-1.5 sm:gap-2        (6px → 8px)
Component: gap-2 sm:gap-3 md:gap-4 (8px → 12px → 16px)
Section:   gap-3 sm:gap-4 md:gap-6 (12px → 16px → 24px)
```

### Responsive Typography

#### Page Titles
```tsx
className="text-xl sm:text-2xl md:text-3xl font-bold"
// 20px → 24px → 30px

Usage: className={responsiveTypography.pageTitle}
```

#### Section Headings
```tsx
className="text-lg sm:text-xl font-bold"
// 18px → 20px

Usage: className={responsiveTypography.sectionHeading}
```

#### Card Titles
```tsx
className="text-base sm:text-lg font-bold"
// 16px → 18px

Usage: className={responsiveTypography.cardTitle}
```

#### Body Text
```tsx
className="text-xs sm:text-sm text-slate-700"
// 12px → 14px

Usage: className={responsiveTypography.bodyPrimary}
```

#### Stat Values
```tsx
className="text-xl sm:text-2xl md:text-3xl font-bold"
// 20px → 24px → 30px

Usage: className={responsiveTypography.statValue}
```

#### Labels & Metadata
```tsx
className="text-[10px] sm:text-xs text-slate-500"
// 10px → 12px

Usage: className={responsiveTypography.label}
```

### Responsive Component Sizing

#### Icon Containers
```tsx
// Small
<div className="w-7 h-7 sm:w-8 sm:h-8">
  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
</div>

// Medium
<div className="w-9 h-9 sm:w-10 sm:h-10">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
</div>

// Large
<div className="w-10 h-10 sm:w-11 sm:h-11">
  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
</div>

Usage: className={responsiveSizes.iconMedium}
```

#### Buttons
```tsx
// Small
className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm"

// Medium
className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"

// Large
className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base"
```

#### Avatars
```tsx
// Small:  w-8 h-8 sm:w-9 sm:h-9
// Medium: w-10 h-10 sm:w-12 sm:h-12
// Large:  w-12 h-12 sm:w-16 sm:h-16
```

### Common Responsive Patterns

#### Flex Row (Mobile Column)
```tsx
// Stacks vertically on mobile, horizontal on tablet+
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">

Usage: className={commonPatterns.flexRow}
```

#### Flex Between (Responsive)
```tsx
// Stacks on mobile with start alignment, space-between on larger
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">

Usage: className={commonPatterns.flexBetween}
```

#### Button Groups
```tsx
// Wraps buttons with consistent spacing
<div className="flex flex-wrap items-center gap-2">

Usage: className={commonPatterns.buttonGroup}
```

#### Card Headers
```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4 pb-3 border-b border-slate-200/60">

Usage: className={commonPatterns.cardHeader}
```

### Touch Target Guidelines

#### Minimum Sizes
```
Mobile Buttons:  min-h-[44px] min-w-[44px]  (iOS guideline)
Desktop Buttons: min-h-[36px]               (comfortable clicking)
Icon Buttons:    p-2                        (8px padding around icon)
Links:           py-2 px-3                  (adequate touch area)
```

#### Implementation
```tsx
// Touch-friendly button
<button className="px-4 py-2.5 sm:py-2">
  {/* 44px height on mobile, 36px on desktop */}
</button>

// Touch-friendly icon button
<button className="p-2 hover:bg-slate-100 rounded-lg">
  <Icon className="w-5 h-5" />
</button>
```

### Responsive Content Strategy

#### Show/Hide Content
```tsx
// Desktop only
<div className="hidden lg:block">Desktop content</div>

// Mobile only
<div className="lg:hidden">Mobile content</div>

// Show different content per breakpoint
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>
```

#### Truncate Text
```tsx
// Single line truncation
<p className="truncate">Long text will be cut off...</p>

// With max width on mobile
<p className="truncate max-w-[100px] sm:max-w-none">
  Text with responsive width
</p>
```

### Testing Responsive Designs

#### Key Breakpoints to Test
- **320px**: iPhone SE, older phones
- **375px**: iPhone 12/13/14 standard
- **390px**: iPhone 12/13/14 Pro
- **414px**: iPhone Plus models
- **768px**: iPad portrait
- **1024px**: iPad landscape, small laptops
- **1280px**: Standard desktop
- **1920px**: Full HD displays

#### Common Issues to Check
- ✅ Text doesn't overflow containers
- ✅ Buttons remain tappable (44px minimum)
- ✅ Grid layouts don't break
- ✅ Images scale properly
- ✅ Navigation is accessible
- ✅ Content hierarchy is maintained
- ✅ No horizontal scrolling (unless intentional)

### Responsive Best Practices

#### Do's ✅
- Use mobile-first CSS (base styles, then `sm:`, `md:`, etc.)
- Test on real devices when possible
- Use `min-w-0` and `flex-shrink-0` to prevent layout breaks
- Provide adequate spacing for touch targets
- Use `truncate` for text that might overflow
- Test with long content (names, addresses, etc.)
- Use responsive images with proper aspect ratios
- Ensure forms are easy to fill on mobile

#### Don'ts ❌
- Don't rely on hover states for mobile
- Don't use fixed pixel widths without responsiveness
- Don't make text too small on mobile (min 12px)
- Don't hide critical content on mobile
- Don't use tiny touch targets
- Don't forget about landscape orientation
- Don't assume viewport size
- Don't test only on one device

### Quick Reference: Common Responsive Classes

```tsx
// Padding
p-3 sm:p-4 md:p-6           // Page padding
p-3 sm:p-4 md:p-5           // Card padding
px-3 sm:px-4 md:px-6        // Horizontal only

// Spacing
space-y-3 sm:space-y-4 md:space-y-6    // Vertical spacing
gap-2 sm:gap-3 md:gap-4                // Grid/Flex gap

// Grid columns
grid-cols-1 sm:grid-cols-2              // 1 → 2
grid-cols-2 md:grid-cols-4              // 2 → 4
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  // 1 → 2 → 3

// Typography
text-xs sm:text-sm                      // 12px → 14px
text-sm sm:text-base                    // 14px → 16px
text-xl sm:text-2xl md:text-3xl        // 20px → 24px → 30px

// Flex direction
flex-col sm:flex-row                    // Vertical → Horizontal

// Visibility
hidden lg:block                         // Show on desktop
lg:hidden                               // Show on mobile/tablet
hidden sm:inline-block                  // Show on tablet+

// Width
w-full sm:w-auto                        // Full → Auto
max-w-[100px] sm:max-w-none            // Limited → Unlimited
```

---

## ⚙️ 9. Implementation Example

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette uses default Tailwind slate
        // Custom status colors (if needed)
        brand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      spacing: {
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',  // 8px
      },
    },
  },
  plugins: [],
}
```

### Component Examples

#### Button Component Implementation
```tsx
// components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
}) => {
  const baseClasses = 
    'inline-flex items-center justify-center font-medium rounded-lg ' +
    'transition-colors duration-200 focus:outline-none focus:ring-2 ' +
    'focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ' +
    'cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-500',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
    outline: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Badge Component Implementation
```tsx
// components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const baseClasses = 
    'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border';
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
```

#### Card Component Implementation
```tsx
// components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  status?: 'success' | 'warning' | 'info' | 'error' | null;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  status = null,
}) => {
  const baseClasses = 
    'bg-white border shadow-md hover:shadow-xl transition-all duration-200 rounded-lg';
  
  const statusClasses = status ? {
    success: 'bg-emerald-50/30 border-emerald-200/50 border-l-4 border-l-emerald-200',
    warning: 'bg-amber-50/30 border-amber-200/50 border-l-4 border-l-amber-200',
    info: 'bg-blue-50/30 border-blue-200/50 border-l-4 border-l-blue-200',
    error: 'bg-red-50/30 border-red-200/50 border-l-4 border-l-red-200',
  }[status] : 'border-slate-200';
  
  return (
    <div className={`${baseClasses} ${statusClasses} ${className}`}>
      {children}
    </div>
  );
};
```

#### Usage Example
```tsx
// pages/Dashboard.tsx
import { Button, Badge, Card } from '@/components/ui';
import { Clock, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Welcome back! Here's your overview.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 
                        border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl 
                            flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-blue-700 uppercase font-semibold tracking-wide">
                Pending
              </p>
              <p className="text-2xl font-bold text-blue-900">12</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card List */}
      <div className="space-y-3">
        <Card status="success">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4 
                            pb-3 border-b border-slate-200/60">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Service Request Title
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </Badge>
                  <Badge variant="info">Medium</Badge>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              This is a description of the service request with relevant details.
            </p>
            
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4" />
                <span>View Details</span>
              </Button>
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4" />
                <span>Leave Review</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

---

## 📚 10. Quick Reference Cheat Sheet

### Common Patterns

```jsx
// Page Container
<div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">

// Section Header
<h2 className="text-xl font-bold text-slate-900 mb-4">

// Card
<Card className="bg-white border border-slate-200 shadow-md">
  <div className="p-5">

// Button with Icon
<Button className="flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Text</span>
</Button>

// Icon Container
<div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
  <Icon className="w-4 h-4 text-slate-600" />
</div>

// Grid Layout
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

// Flex Row
<div className="flex items-center gap-2">

// Status Badge
<Badge variant="success">Completed</Badge>

// Input with Icon
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-9" />
</div>
```

### Color Quick Reference

```
Backgrounds:    bg-slate-50, bg-white
Borders:        border-slate-200
Text Primary:   text-slate-900
Text Secondary: text-slate-700
Text Muted:     text-slate-500

Success:        bg-emerald-100 text-emerald-800
Warning:        bg-amber-100 text-amber-800
Info:           bg-blue-100 text-blue-800
Error:          bg-red-100 text-red-800
```

---

## 🔄 Version History

**v1.1.1** (October 16, 2025)
- Added comprehensive checkbox and radio button design guidelines
- Defined muted checkbox color scheme (slate-600 for checked state)
- Specified subtle focus ring styling (20% opacity, no harsh outlines)
- Documented checkbox sizing options (standard 16px, large 20px)

**v1.1** (October 16, 2025)
- Added comprehensive responsive design system
- Implemented mobile-first approach
- Created centralized responsive configuration system
- Added hamburger menu and collapsible sidebar
- Updated all dashboard components for mobile/tablet
- Touch-friendly UI with proper target sizes
- Responsive typography and spacing scales

**v1.0** (October 15, 2025)
- Initial design system documentation
- Based on "My Service Requests" page redesign
- Minimalistic, accessible, professional aesthetic
- Slate-based color palette with soft status colors

---

## 📞 Support & Feedback

For questions, suggestions, or design system updates, please contact the development team or create an issue in the project repository.

**Principles to Remember:**
1. **Consistency over creativity** - Follow the system
2. **Accessibility first** - Always check contrast and keyboard navigation
3. **Mobile responsive** - Test on small screens
4. **Performance matters** - Avoid heavy animations
5. **User-centered** - Design for clarity and usability

---

*This design system is a living document and will be updated as the platform evolves.*
