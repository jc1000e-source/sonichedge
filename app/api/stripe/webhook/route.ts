import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err)
    return NextResponse.json(
      { error: `Webhook Error: ${err}` },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { teamId, userId, credits } = session.metadata!

    console.log(`Processing payment for team ${teamId}: ${credits} credits`)

    try {
      // Grant credits to team using the database function
      const { data, error } = await supabaseAdmin.rpc('grant_credits', {
        p_team_id: teamId,
        p_amount: parseInt(credits),
        p_transaction_type: 'purchased',
        p_user_id: userId,
        p_stripe_payment_id: session.payment_intent as string,
        p_notes: `Purchased via Stripe - ${credits} credits`,
      })

      if (error) {
        console.error('Error granting credits:', error)
        return NextResponse.json({ error: 'Failed to grant credits' }, { status: 500 })
      }

      console.log(`✅ Successfully granted ${credits} credits to team ${teamId}`)

      // TODO: Send confirmation email to user
      // You can integrate with SendGrid, Resend, or your email service here
      
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
