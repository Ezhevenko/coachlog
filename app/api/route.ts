import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const update = await req.json()
  const token = process.env.BOT_TOKEN
  const webAppUrl = process.env.WEBAPP_URL || 'https://coachlog.vercel.app'

  if (!token) {
    return NextResponse.json({ error: 'BOT_TOKEN not set' }, { status: 500 })
  }

  const message = update.message
  if (!message || !message.text) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const text: string = message.text

  if (text.startsWith('/start')) {
    const replyMarkup = {
      keyboard: [[{ text: 'Open', web_app: { url: webAppUrl } }]],
      resize_keyboard: true,
    }
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Press the button below to open the app:',
        reply_markup: replyMarkup,
      }),
    })
    if (!resp.ok) {
      console.error('Failed to send /start reply', await resp.text())
    }
  } else if (text.startsWith('/help')) {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Send /start to get a button that opens the app.',
      }),
    })
    if (!resp.ok) {
      console.error('Failed to send /help reply', await resp.text())
    }
  }

  return NextResponse.json({ ok: true })
}
