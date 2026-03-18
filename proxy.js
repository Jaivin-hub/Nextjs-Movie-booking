import { NextResponse } from "next/server";

export function proxy (request){
    console.log(request)
    return NextResponse.next()
}
