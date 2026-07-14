import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    try {
       
        //1. extrair os parâetros de busca da URL
        const { searchParams } = request.nextUrl
        
    } catch (error) {
        
    }
}