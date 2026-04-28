"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

export async function submitKycApplication(formData: FormData) {
  try {
    const get = (key: string) => formData.get(key) as string;
    
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

    const password = get("password");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle Referral logic
    const referrerCode = get("referrerCode");
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
        email: get("email"),
        name: `${get("firstName")} ${get("lastName")}`.trim(),
        firstName: get("firstName"),
        lastName: get("lastName"),
        fbProfileName: get("fbProfileName"),
        mobileNumber: get("mobileNumber"),
        address: get("address"),
        city: get("city"),
        username: get("username"),
        password: hashedPassword,
        affiliateUsername: get("username"), // Unified Identity
        location: get("location") || get("city"), 
        referralSource: get("referralSource"),
        referrerId, // Link!
        
        // KYC Data
        kycIdType: get("idType"),
        kycIdNumber: get("idNumber"),
        idPhotoUrl, // Front
        idBackUrl,
        
        kycSecondaryId1Type: get("secondaryId1Type"),
        kycSecondaryId1Number: get("secondaryId1Number"),
        kycSecondaryId1FrontUrl,
        kycSecondaryId1BackUrl,
        
        kycSecondaryId2Type: get("secondaryId2Type"),
        kycSecondaryId2Number: get("secondaryId2Number"),
        kycSecondaryId2FrontUrl,
        kycSecondaryId2BackUrl,
        
        selfieUrl,
        agreedToTerms: get("agreedToTerms") === "true",
        
        role: "AGENT",
        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
        referralCode: get("username"),
      }
    });

    // Handle initial requested brands mapping
    const requestedPlatformsStr = get("requestedPlatforms");
    if (requestedPlatformsStr) {
      try {
        const brands = JSON.parse(requestedPlatformsStr);
        if (Array.isArray(brands) && brands.length > 0) {
          // Find all relevant brands first
          const brandRecords = await prisma.brand.findMany({
            where: { name: { in: brands } }
          });

          if (brandRecords.length > 0) {
            await prisma.platformAccess.createMany({
              data: brandRecords.map(brand => ({
                userId: newUser.id,
                brandId: brand.id,
                status: "PENDING"
              })),
              skipDuplicates: true
            });
          }
        }
      } catch (e) {
        console.error("Platform mapping error:", e);
        // Don't fail the whole signup if just platform mapping fails
      }
    }

    revalidatePath("/admin/review");
    console.log("KYC Submission Success for user:", newUser.id);
    return { success: true, userId: newUser.id };
  } catch (error: any) {
    console.error("CRITICAL KYC ERROR:", error);
    
    let errorMessage = 'Failed to submit application. Please try again.';

    if (error.code === 'P2002') {
      const field = error.meta?.target || ['email or username'];
      errorMessage = `This ${field} is already registered. Please use a different one.`;
    } else if (error.message?.includes("Can't reach database") || error.code === 'P1001') {
      errorMessage = 'Database connection failed. Please contact support.';
    } else if (error.message?.includes("Unknown field") || error.code === 'P2009') {
      errorMessage = 'Schema mismatch error. Please contact support.';
    } else {
      errorMessage = error.message || "An unexpected error occurred during submission.";
    }

    return { success: false, error: errorMessage };
  }
}

export async function submitKycForGoogleUser(userId: string, formData: FormData) {
  try {
    const get = (key: string) => formData.get(key) as string;

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
    const referrerCode = get("referrerCode");
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
        name: `${get("firstName")} ${get("lastName")}`.trim(),
        firstName: get("firstName"),
        lastName: get("lastName"),
        username: get("username"),
        fbProfileName: get("fbProfileName"),
        mobileNumber: get("mobileNumber"),
        address: get("address"),
        city: get("city"),
        affiliateUsername: get("username"), // Unified Identity
        location: get("location") || get("city"),
        referralSource: get("referralSource"),
        referrerId, // Link!

        kycIdType: get("idType"),
        kycIdNumber: get("idNumber"),
        idPhotoUrl,
        idBackUrl,
        kycSecondaryId1Type: get("secondaryId1Type"),
        kycSecondaryId1Number: get("secondaryId1Number"),
        kycSecondaryId1FrontUrl,
        kycSecondaryId1BackUrl,
        kycSecondaryId2Type: get("secondaryId2Type"),
        kycSecondaryId2Number: get("secondaryId2Number"),
        kycSecondaryId2FrontUrl,
        kycSecondaryId2BackUrl,
        selfieUrl,
        agreedToTerms: get("agreedToTerms") === "true",

        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
        referralCode: get("username"),
        role: "AGENT",
      }
    });

    // Handle brand access requests
    const requestedBrandsStr = get("requestedBrands");
    if (requestedBrandsStr) {
      try {
        const brands = JSON.parse(requestedBrandsStr);
        if (Array.isArray(brands) && brands.length > 0) {
          const brandRecords = await prisma.brand.findMany({
            where: { name: { in: brands } }
          });

          if (brandRecords.length > 0) {
            await prisma.platformAccess.createMany({
              data: brandRecords.map(brand => ({
                userId: userId,
                brandId: brand.id,
                status: "PENDING"
              })),
              skipDuplicates: true
            });
          }
        }
      } catch (e) {
        console.error("Google Platform mapping error:", e);
      }
    }

    revalidatePath("/admin/review");
    revalidatePath("/agent");
    return { success: true };
  } catch (error: any) {
    console.error("Google KYC Submission error:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "This username is already taken. Please choose another." };
    }
    return { success: false, error: error.message || "Submission failed." };
  }
}
