const defaultContactApiBaseUrl = "http://localhost:8000";

export function getContactApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_CONTACT_API_BASE_URL?.trim() || defaultContactApiBaseUrl).replace(/\/+$/, "");
}
