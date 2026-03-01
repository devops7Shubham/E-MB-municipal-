#!/bin/bash

# Create directory structure
mkdir -p public
mkdir -p src/api
mkdir -p src/components/ui
mkdir -p src/components/spreadsheet
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/types
mkdir -p src/utils

# Create empty files (keeping .gitkeep for public directory if needed)
touch public/.gitkeep

# API
touch src/api/client.ts
touch src/api/works.ts

# UI Components
touch src/components/ui/Button.tsx
touch src/components/ui/Badge.tsx
touch src/components/ui/Card.tsx
touch src/components/ui/Table.tsx
touch src/components/ui/Modal.tsx

# Spreadsheet component
touch src/components/spreadsheet/UniverEditor.tsx

# Hooks
touch src/hooks/useWorks.ts
touch src/hooks/useWorkFile.ts

# Pages
touch src/pages/WorksList.tsx
touch src/pages/WorkDashboard.tsx

# Types
touch src/types/index.ts

# Utils
touch src/utils/formatters.ts

# Root files
touch src/App.tsx
touch src/main.tsx
touch src/index.css

touch index.html
touch package.json
touch tailwind.config.js
touch tsconfig.json
touch vite.config.ts

echo "Project structure created successfully."