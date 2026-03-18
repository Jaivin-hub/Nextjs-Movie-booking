export async function GET() {
    return new Response("Hello from product API Route");
}

export async function POST(req) {
    const data = await req.json();
    const params = req.nextUrl.searchParams.get('type')
    console.log('params: ', params);
    return Response.json(data);
}