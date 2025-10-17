import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export const runtime = "edge"

export async function GET(request: Request): Promise<Response> {
  const cookieHeader = request.headers.get("cookie")

  console.log("All cookies:", cookieHeader)

  if (!cookieHeader) {
    return Response.json({ error: "No cookies found" })
  }

  // Find Supabase auth token
  const cookies = cookieHeader.split(";")
  let authTokenString: string | null = null
  let cookieName: string | null = null

  for (const cookie of cookies) {
    const [name, value] = cookie.split("=").map((s) => s.trim())
    if (name && name.startsWith("sb-") && name.endsWith("-auth-token")) {
      authTokenString = value
      cookieName = name
      break
    }
  }

  if (!authTokenString) {
    return Response.json({
      error: "No Supabase auth token found",
      allCookies: cookies.map(c => c.split("=")[0].trim())
    })
  }

  try {
    // Remove 'base64-' prefix if present
    let tokenToDecode = authTokenString
    if (authTokenString.startsWith("base64-")) {
      tokenToDecode = authTokenString.substring(7) // Remove 'base64-' prefix
    }

    // Decode base64 to get JSON string
    const jsonString = atob(tokenToDecode)
    const decodedToken = JSON.parse(jsonString) as {
      access_token?: string
      user?: { id?: string; email?: string }
    }

    // Try to get user from decoded token
    let userId = decodedToken.user?.id
    let userEmail = decodedToken.user?.email

    // If not in token, try with access token
    if (!userId && decodedToken.access_token) {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user }, error } = await supabase.auth.getUser(decodedToken.access_token)

      if (error) {
        return Response.json({
          error: "Failed to get user from token",
          details: error.message
        })
      }

      userId = user?.id
      userEmail = user?.email
    }

    return Response.json({
      success: true,
      cookieName,
      userId,
      userEmail,
      hasAccessToken: !!decodedToken.access_token,
      tokenKeys: Object.keys(decodedToken)
    })
  } catch (error) {
    return Response.json({
      error: "Failed to parse token",
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
