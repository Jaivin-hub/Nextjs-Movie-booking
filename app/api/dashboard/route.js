export async function GET() {
  return Response.json({ message: 'Welcome to the Dashboard API!', data: { users: 100, posts: 50 } });
}
