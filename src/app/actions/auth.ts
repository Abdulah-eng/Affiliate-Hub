"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

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

    // Handle Referral logic
    const referrerCode = rawData.referrerCode as string;
    let referrerId = null;
    if (referrerCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referrerCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Capture IP
    const headerList = await headers();
    const registrationIp = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "127.0.0.1";

    // Create the PENDING user
    const newUser = await prisma.user.create({
      data: {
        registrationIp,
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
        referrerId, // Link!
        
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
        referralCode: rawData.username as string,
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
    console.error("KYC Submission error:", JSON.stringify(error, null, 2));
    console.error("KYC Error code:", error.code);

    let errorMessage = 'Failed to submit application. Please try again.';

    if (error.code === 'P2002') {
      const field = error.meta?.target?.join(', ') || 'email or username';
      errorMessage = `This ${field} is already registered. Please use a different one.`;
    } else if (error.message?.includes("Can't reach database") || error.code === 'P1001') {
      errorMessage = 'Database connection failed. Please contact support.';
    } else if (error.message?.includes("Unknown field") || error.code === 'P2009') {
      errorMessage = 'Schema mismatch error. Please contact support.';
    } else if (error.message) {
      errorMessage = `Error: ${error.message.substring(0, 120)}`;
    }

    return { success: false, error: errorMessage };
  }
}

export async function submitKycForGoogleUser(userId: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());

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

    // Handle Referral logic
    const referrerCode = rawData.referrerCode as string;
    let referrerId = undefined;
    if (referrerCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referrerCode }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Capture IP
    const headerList = await headers();
    const registrationIp = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "127.0.0.1";

    // Update the existing Google user with their KYC + profile data
    await prisma.user.update({
      where: { id: userId },
      data: {
        registrationIp,
        name: `${rawData.firstName} ${rawData.lastName}`.trim(),
        firstName: rawData.firstName as string,
        lastName: rawData.lastName as string,
        username: rawData.username as string,
        fbProfileName: rawData.fbProfileName as string,
        mobileNumber: rawData.mobileNumber as string,
        address: rawData.address as string,
        city: rawData.city as string,
        affiliateUsername: rawData.affiliateUsername as string,
        location: rawData.location as string || rawData.city as string,
        referralSource: rawData.referralSource as string,
        referrerId, // Link!

        kycIdType: rawData.idType as string,
        kycIdNumber: rawData.idNumber as string,
        idPhotoUrl,
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

        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
        referralCode: rawData.username as string,
        role: "AGENT",
      }
    });

    // Handle brand access requests
    const requestedBrandsStr = rawData.requestedBrands as string;
    if (requestedBrandsStr) {
      const brands = JSON.parse(requestedBrandsStr);
      for (const brandName of brands) {
        const brand = await prisma.brand.findUnique({ where: { name: brandName } });
        if (brand) {
          await prisma.platformAccess.upsert({
            where: { userId_brandId: { userId, brandId: brand.id } },
            update: { status: "PENDING" },
            create: { userId, brandId: brand.id, status: "PENDING" }
          });
        }
      }
    }

    revalidatePath("/admin/review");
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    console.error("Google KYC Submission error:", error.message);
    if (error.code === 'P2002') {
      return { success: false, error: "This username is already taken. Please choose another." };
    }
    return { success: false, error: error.message?.substring(0, 120) || "Submission failed." };
  }
}
