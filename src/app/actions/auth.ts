"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function submitKycApplication(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Handle File Storage
    const uploadDir = join(process.cwd(), "public", "uploads", "kyc");
    await mkdir(uploadDir, { recursive: true });

    async function handleFileUpload(field: string, prefix: string) {
      const file = formData.get(field) as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${prefix}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        return `/uploads/kyc/${fileName}`;
      }
      return null;
    }

    const idPhotoUrl = await handleFileUpload("idPhoto", "id-front") || "/mock-id.png";
    const idBackUrl = await handleFileUpload("idBack", "id-back");
    const kycSecondaryId1FrontUrl = await handleFileUpload("secondaryId1Front", "s1-front");
    const kycSecondaryId1BackUrl = await handleFileUpload("secondaryId1Back", "s1-back");
    const kycSecondaryId2FrontUrl = await handleFileUpload("secondaryId2Front", "s2-front");
    const kycSecondaryId2BackUrl = await handleFileUpload("secondaryId2Back", "s2-back");
    const selfieUrl = await handleFileUpload("selfie", "selfie") || "/mock-selfie.png";

    // Hash password
    const password = rawData.password as string;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the PENDING user
    const newUser = await prisma.user.create({
      data: {
        email: rawData.email as string,
        name: `${rawData.firstName} ${rawData.lastName}`.trim(),
        firstName: rawData.firstName as string,
        lastName: rawData.lastName as string,
        fbProfileName: rawData.fbProfileName as string,
        mobileNumber: rawData.mobileNumber as string,
        address: rawData.address as string,
        city: rawData.city as string,
        username: rawData.username as string,
        password: hashedPassword,
        affiliateUsername: rawData.affiliateUsername as string,
        location: rawData.location as string || rawData.city as string, 
        referralSource: rawData.referralSource as string,
        
        // KYC Data
        kycIdType: rawData.idType as string,
        kycIdNumber: rawData.idNumber as string,
        idPhotoUrl, // Front
        idBackUrl,
        
        kycSecondaryId1Type: rawData.secondaryId1Type as string,
        kycSecondaryId1Number: rawData.secondaryId1Number as string,
        kycSecondaryId1FrontUrl,
        kycSecondaryId1BackUrl,
        
        kycSecondaryId2Type: rawData.secondaryId2Type as string,
        kycSecondaryId2Number: rawData.secondaryId2Number as string,
        kycSecondaryId2FrontUrl,
        kycSecondaryId2BackUrl,
        
        selfieUrl,
        agreedToTerms: rawData.agreedToTerms === "true",
        
        role: "AGENT",
        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
        referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }
    });

    // Handle initial requested brands mapping
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
