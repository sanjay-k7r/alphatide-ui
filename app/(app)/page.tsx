import App from "../App"

export default function HomePage() {
  // Middleware already ensures user is authenticated
  // AppProviders already checked auth state
  // Just render the app directly
  return <App />
}
