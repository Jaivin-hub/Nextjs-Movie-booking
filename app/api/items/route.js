export async function GET() {
    return new Response("Hello from API Route");
}

export async function POST(req) {
    const data = await req.json();
    const params = req.nextUrl.searchParams
    console.log('params: ', params.get("type"));
    return Response.json(data);
}   