You are refactoring a React + Tailwind project using the design guidelines defined in `DESIGN_SYSTEM.md` and `REFACTOR_GUIDELINE.md`.

---

### 🎯 Core Goals

* Apply consistent, maintainable design using Tailwind according to DESIGN_SYSTEM.md.
* Minimize raw HTML and Tailwind class clutter inside all page files.
* Refactor to use smaller, reusable components that encapsulate styling and logic.
* Keep pages declarative: pages should only compose components and include data-fetching logic.
* VERY IMPORTANT: Ensure that components extracted once are reused across the entire app wherever the same pattern or JSX occurs.
* VERY IMPORTANT: Components created during refactoring should also follow all guidelines in this document.

---

### 🧱 Componentization Rules

1. **Encapsulate Tailwind in components.**

   * If a page section has more than ~10 lines of JSX or multiple nested elements, extract it into its own component.
   * Tailwind classes should primarily exist inside components, not pages.

2. **Use semantic, domain-driven components.**

   * Components like `UserStats`, `DeviceList`, `ProjectFilters` should map to logical page sections.
   * Keep them in feature folders (e.g., `components/users/`, `components/projects/`).

3. **Keep pages minimal.**

   * A page should only import and compose components:

     ```tsx
     <DashboardLayout>
       <PageHeader title="Projects" action={<CreateProjectButton />} />
       <ProjectFilters />
       <ProjectTable />
     </DashboardLayout>
     ```
   * Only top-level layout spacing (`p-6`, `gap-6`, etc.) may remain inline.

4. **Reuse UI primitives and previously extracted components.**

   * Do not recreate a component that already exists; reuse it across all pages.
   * If the same JSX pattern appears in multiple pages, use the component previously extracted.

5. **Follow the Tailwind + DESIGN_SYSTEM.md guidelines.**

   * Respect spacing, color, and typography tokens.
   * Avoid custom hex colors or arbitrary values unless defined in the design system.

---

### 🧩 Layout and Structure

* Extract reusable layout sections such as `PageHeader`, `Sidebar`, `DashboardLayout`, etc.
* Use responsive grid or flex layouts defined in your design system.
* Always maintain semantic naming and reuse extracted components across pages.

---

### 🧰 Implementation Conventions

**Folder & Naming Conventions**

```
/components
  /ui           → Shared UI elements (Button, Card, Input, Badge, etc.)
  /layout       → Layout-level components (Sidebar, Header, DashboardLayout)
  /provider     → Provider-specific components
  /user         → User-related components
  /auth         → Auth components
  /notifications→ Notification components
  /<domain>     → Any other domain-specific folders
```

* Use PascalCase for component names.
* Name components descriptively to indicate their purpose.
* Place domain-specific components in the appropriate feature folder.
* Use index files to re-export components for easier imports.

**Component Reuse Policy**

* Track all newly created components during refactor.
* Before extracting JSX, check if an existing component already represents the same structure.
* Always reuse previously extracted components instead of creating duplicates.
* Update imports across all pages to use the extracted components.

---

**Summary:** Pages describe *what* is rendered. Components define *how* it looks. Design system defines *how it feels*. Always reuse existing or previously extracted components across pages for consistency.
