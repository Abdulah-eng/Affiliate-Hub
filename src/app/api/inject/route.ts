import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * TEMPORARY: Inject test points into the production database.
 * This should be deleted or protected after use.
 */
export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' }
    });

    let count = 0;
    for (const agent of agents) {
      await prisma.pointTransaction.create({
        data: {
          userId: agent.id,
          amount: 100000,
          type: 'REFERRAL',
          description: 'Production Test Balance Injection'
        }
      });
      count++;
    }

    return NextResponse.json({ 
      success: true, 
      count, 
      message: `Successfully added 100,000 test coins to ${count} agents in PROD.` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
