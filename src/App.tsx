import { ReplenishCRM } from "@/components/replenish/ReplenishCRM";

/**
 * Replenish NutrAI — reads live data from the FastAPI admin API
 * (see https://nutr-api.onrender.com/docs ).
 *
 * Environment:
 *  - VITE_NUTR_API_URL — API origin (default in .env.development)
 *  - VITE_NUTR_ADMIN_API_KEY — optional; if set, skips manual key entry until cleared
 */
const App = () => <ReplenishCRM />;

export default App;
