# Nuxt 3 + Pinia + NuxtUI Data Seeder

Here is a detailed reference summary of the Nuxt 3 + Pinia + Faker.js + NuxtUI setup with local storage persistence.

## 🛠️ Tech Stack & Dependencies

* **Nuxt 3 (`nuxt`)**: The core Vue framework providing routing, auto-imports, and server-side rendering (SSR).
* **NuxtUI (`@nuxt/ui`)**: A UI component library tailored for Nuxt that automatically integrates Tailwind CSS and provides ready-to-use components (buttons, cards, avatars, icons).
* **Pinia (`@pinia/nuxt` & `pinia`)**: The official state management library for Vue/Nuxt, replacing Vuex.
* **Faker.js (`@faker-js/faker`)**: A utility library used to generate massive amounts of realistic fake data (names, emails, avatars, UUIDs) for testing and UI development.
* **Pinia Persisted State (`@pinia-plugin-persistedstate/nuxt`)**: A plugin that automatically syncs Pinia state with the browser's `localStorage` (or `sessionStorage`), allowing data to survive page reloads.

---

## 📂 Project Architecture

### 1. Configuration (`nuxt.config.ts`)
This file is the brain of your Nuxt application. It registers all the essential modules required for the stack to function.
* **Required Modules**: `'@pinia/nuxt'`, `'@nuxt/ui'`, and `'@pinia-plugin-persistedstate/nuxt'`.

### 2. The Data Generator (`utils/seeder.ts`)
Nuxt automatically imports files inside the `utils/` directory. This file abstracts the Faker.js logic away from the UI and state management.
* **`generateUsers(count)`**: Loops `count` times, utilizing `faker.person`, `faker.internet`, and `faker.image` to build user objects.
* **`clearUsers()`**: Simply returns an empty array to simulate a database flush.

### 3. The State Manager (`stores/userStore.ts`)
This defines the global state accessible from any component.
* **State**: Holds the `users` array and the `isLoading` boolean.
* **Actions**: Contains the logic to call the `SeederService` (`deployMockData` and `removeMockData`). It uses `setTimeout` to simulate real-world API latency.
* **Getters**: Computed properties that derive data from the state (e.g., `userCount`, `hasUsers`).
* **Persistence**: Setting `persist: { storage: persistedState.localStorage }` tells Pinia to automatically stringify and save the state array to the browser upon every mutation.

### 4. The User Interface (`app.vue`)
This acts as the main dashboard and visualizes the state.
* **NuxtUI Components**: Uses `<UCard>`, `<UButton>`, `<UBadge>`, `<USkeleton>`, and `<UAvatar>` for a polished, accessible design without needing to write custom CSS.
* **Tailwind Utility Classes**: Uses Tailwind for layout structuring (e.g., `grid-cols-1 sm:grid-cols-2`, `flex`, `gap-4`).
* **Hydration Fix (`<ClientOnly>`)**: Because `localStorage` only exists in the browser, rendering local storage data on the server causes a "Hydration Mismatch" error. Wrapping the dynamic data in `<ClientOnly>` forces Nuxt to wait until the component hits the client's browser before attempting to read and render the persisted state.

---

## 🔑 Key Concepts & Gotchas to Remember

* **Auto-Imports:** Nuxt automatically imports components from NuxtUI, stores from the `stores/` directory, and utilities from the `utils/` directory. You do not need to write `import { UButton } from...` or `import { SeederService } from...` if your folders are structured correctly.
* **Iconify Integration:** NuxtUI uses Iconify. You can pass icons to components using the string format `i-heroicons-[icon-name]` (e.g., `icon="i-heroicons-trash"`).
* **Loading States:** To make interfaces feel responsive, *always* implement loading states (like the `<USkeleton>` grid used in this project) when dealing with simulated or real network requests.
* **Persistence Caveats:** While `@pinia-plugin-persistedstate` is great for user preferences, simple mock data, or UI states, avoid storing highly sensitive information (like unencrypted auth tokens or passwords) in `localStorage`, as it is vulnerable to XSS attacks.
