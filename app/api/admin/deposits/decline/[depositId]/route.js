import { authenticate } from '@/lib/middleware/auth';
import Deposit from '@/lib/model/deposit';
import User from '@/lib/model/user';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { isAuthenticated, userId } = await authenticate(req);

    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const authenticatedUser = await User.findById(userId).select('-password');

    if (!authenticatedUser || authenticatedUser.role !== 1) {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can access this endpoint' },
        { status: 403 }
      );
    }

    const { depositId } = await params;

    if (!depositId) {
      return NextResponse.json(
        { message: 'Deposit ID is required' },
        { status: 400 }
      );
    }

    // Find the deposit
    const deposit = await Deposit.findById(depositId);

    if (!deposit) {
      return NextResponse.json(
        { message: 'Deposit not found' },
        { status: 404 }
      );
    }

    if (deposit.status === 'Declined') {
      return NextResponse.json(
        { message: 'Deposit is already Declined' },
        { status: 400 }
      );
    }

    const user = await User.findById(deposit.user);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (deposit.status === 'Approved') {
      user.totalInvest -= deposit.amount;
    }   

    deposit.status = 'Declined';
    await deposit.save();

    await user.save();

    return NextResponse.json(
      { message: 'Deposit declined successfully', deposit },
      { status: 200 }
    );
  } catch (error) {
    console.error('Decline deposit error:', error);
    return NextResponse.json(
      { message: 'An error occurred while declining the deposit' },
      { status: 500 }
    );
  }
}