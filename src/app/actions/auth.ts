"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function submitKycApplication(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Extract files
    const idPhoto = formData.get("idPhoto") as File | null;
    const selfie = formData.get("selfie") as File | null;
    
    let idPhotoUrl = "/mock-id.png";
    let selfieUrl = "/mock-selfie.png";

    // Handle File Storage
    const uploadDir = join(process.cwd(), "public", "uploads", "kyc");
    
    // Ensure directory exists (extra check)
    await mkdir(uploadDir, { recursive: true });

    if (idPhoto && idPhoto.size > 0) {
      const idBuffer = Buffer.from(await idPhoto.arrayBuffer());
      const idFileName = `${Date.now()}-id-${idPhoto.name.replace(/\s+/g, "_")}`;
      const idPath = join(uploadDir, idFileName);
      await writeFile(idPath, idBuffer);
      idPhotoUrl = `/uploads/kyc/${idFileName}`;
    }

    if (selfie && selfie.size > 0) {
      const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
      const selfieFileName = `${Date.now()}-selfie-${selfie.name.replace(/\s+/g, "_")}`;
      const selfiePath = join(uploadDir, selfieFileName);
      await writeFile(selfiePath, selfieBuffer);
      selfieUrl = `/uploads/kyc/${selfieFileName}`;
    }

    // In a real scenario, you'd validate this with zod
    const email = rawData.email as string;
    const name = rawData.name as string;
    const username = rawData.username as string;
    const password = rawData.password as string;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the PENDING user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password: hashedPassword,
        telegram: rawData.telegram as string,
        location: rawData.location as string,
        idPhotoUrl,
        selfieUrl,
        role: "AGENT",
        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
        referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }
    });

    // Handle initial requested brands mapping if needed
    const requestedBrandsStr = rawData.requestedBrands as string;
    if (requestedBrandsStr) {
      const brands = JSON.parse(requestedBrandsStr);
      for (const brandName of brands) {
        const brand = await prisma.brand.findUnique({ where: { name: brandName } });
        if (brand) {
          await prisma.platformAccess.create({
            data: {
              userId: newUser.id,
              brandId: brand.id,
              status: "PENDING"
            }
          });
        }
      }
    }

    revalidatePath("/admin/review");
    return { success: true, userId: newUser.id };
  } catch (error: any) {
    console.error("KYC Submission error:", error);
    let errorMessage = 'Failed to submit application. Username or email might be taken.';
    
    if (error.message?.includes('Can\'t reach database server')) {
      errorMessage = 'Database connection failed. Please ensure MySQL is running in XAMPP.';
    }
    
    return { success: false, error: errorMessage };
  }
}
