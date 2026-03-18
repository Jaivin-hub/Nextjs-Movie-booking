"use server";
import { readFileSync,writeFileSync } from "node:fs";
export const getDashboardData = async ()=>{
    console.log("test");
    const data = JSON.parse(readFileSync("./data.json","utf-8"))
    return { message: 'Welcome to the Dashboard API!', data }
}

export const increasePostCount = async (count)=> {
    const data = JSON.parse(readFileSync("data.json","utf-8"))
    data.posts += count
    writeFileSync("./data.json",JSON.stringify(data))
    return data
}