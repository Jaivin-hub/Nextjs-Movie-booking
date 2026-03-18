
export default async function Home({params}) {
    const { slug } = await params;
    console.log('slug: ', slug);
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
          Welcome to dynamic page: {slug}
        </h1>  
      </main>
    </div>
  );
} 
