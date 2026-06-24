import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { pool } from '@/lib/db';

interface InquiryRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// 全件取得（送信日時が新しい順）
export async function GET() {
  try {
    const [rows] = await pool.query<InquiryRow[]>(
      'SELECT * FROM inquiries ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'お問い合わせの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// 登録
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // 未入力チェックのみ
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください。' },
        { status: 400 }
      );
    }

    await pool.query(
      'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    return NextResponse.json(
      { message: 'お問い合わせを送信しました。' },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'お問い合わせの登録に失敗しました。' },
      { status: 500 }
    );
  }
}