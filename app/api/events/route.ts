import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try{
        await connectDB()

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invañid JSON data format'}, {status: 400})
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message:'Image file is required'}, {status: 400})

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DebvEvent'}, (error, results) =>{
                if(error) return reject(error);

                resolve(results);
            }).end(buffer)
        })

        event.image = uploadResult.secure_url;

        const createdEvent = await Event.create(event);

        return NextResponse.json({message: 'Event created successfully', event: createdEvent}, {status: 201})
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'})
    }
}