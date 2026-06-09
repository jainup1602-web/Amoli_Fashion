export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/middleware/rate-limit';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_to_prevent_crash');

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: rateLimitResult.status }
    );
  }

  try {
    const { name, email, phone, subject, message } = await request.json();

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    });

    // Send Email via Resend if API Key exists
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Amoli Fashion <onboarding@resend.dev>', // Update this to your verified domain later
          to: process.env.CONTACT_EMAIL || 'support@amolijewelry.com', // Defaulting to the known owner email
          subject: `New Contact Enquiry: ${subject || 'No Subject'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          `
        });
        console.log('Email sent successfully via Resend');
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // We don't fail the API response if the email fails, we still saved it to the DB.
      }
    } else {
      console.warn('RESEND_API_KEY is missing. Skipping email notification.');
    }

    return NextResponse.json(
      { enquiry, message: 'Enquiry submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Enquiry creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
