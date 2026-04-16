import { NextRequest, NextResponse } from "next/server";
import { join, resolve, normalize } from "node:path";
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Security: ensure path does not escape the uploads directory
    const uploadsRoot = join(process.cwd(), "public", "uploads");
    const requestedPath = normalize(join(uploadsRoot, ...pathSegments));

    // Prevent path traversal attacks
    if (!requestedPath.startsWith(resolve(uploadsRoot))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if file exists
    try {
      await access(requestedPath, constants.R_OK);
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(requestedPath);
    const ext = "." + requestedPath.split(".").pop()?.toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
