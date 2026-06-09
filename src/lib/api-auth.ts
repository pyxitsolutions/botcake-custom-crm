export function verifyLeadsApiSecret(request: Request): boolean {
  const secret = process.env.LEADS_API_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const apiKey = request.headers.get("x-api-key");
  if (apiKey === secret) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("api_key") === secret) return true;

  return false;
}
