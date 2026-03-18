"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { getDashboardData,increasePostCount } from "../actions";
const fetchData = async () => {
    
    try {
        const response = await getDashboardData();
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};



export default function Home() {
    const queryClient = useQueryClient()
    
    const { data,isLoading } = useQuery({
        queryKey: ["dashboardData"],
        queryFn: fetchData,
    })
       const mutation = useMutation({
        mutationFn:(count)=>{
            let data = increasePostCount(count)
            queryClient.setQueryData(["dashboardData"],data)
            return data
        },
        onSuccess: ()=>{
            queryClient.invalidateQueries(["dashboardData"])
        }
    })
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
       
          {data && (
                    <div className="mt-8">
                        <p className="text-lg text-gray-700 dark:text-gray-300">{data.message}</p>
                        <p className="text-lg text-gray-700 dark:text-gray-300">Users: {data.data.users}</p>
                        <p className="text-lg text-gray-700 dark:text-gray-300">Posts: {data.data.posts}</p>
                    </div>
                )}
                    <button onClick={()=>{
                    mutation.mutate(4)
                }}>Increase count</button>
      </main>
    </div>
  );
} 
