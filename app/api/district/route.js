/**
 * 
 * @param {Request} request 
 * @returns 
 */
export async function GET(request) {
    console.log(request)
    const state = await request.nextUrl.searchParams.get("state")
    if (state == "Kerala") {
        return Response.json(["Trivandrum"])
    }
    return Response.json(["Nagercoil"])
}