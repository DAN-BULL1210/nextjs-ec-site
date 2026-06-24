import Link from 'next/link';
import { RowDataPacket } from 'mysql2';
import { pool } from '@/lib/db'; // ← db.ts が default export なら import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const tableStyle = 'px-5 py-3 border-b border-gray-200 text-sm';

interface InquiryRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default async function AdminInquiriesPage() {
  const [inquiries] = await pool.query<InquiryRow[]>(
    'SELECT * FROM inquiries ORDER BY created_at DESC'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-700">
        ← 商品一覧へ戻る
      </Link>

      <h1 className="text-center text-2xl font-bold my-6">お問い合わせ一覧</h1>

      <div className="shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className={tableStyle}>ID</th>
              <th className={tableStyle}>氏名</th>
              <th className={tableStyle}>メールアドレス</th>
              <th className={tableStyle}>お問い合わせ内容</th>
              <th className={tableStyle}>送信日時</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${tableStyle} text-center text-gray-500`}>
                  お問い合わせはまだありません。
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-100">
                  <td className={tableStyle}>{inquiry.id}</td>
                  <td className={tableStyle}>{inquiry.name}</td>
                  <td className={tableStyle}>{inquiry.email}</td>
                  <td className={tableStyle}>{inquiry.message}</td>
                  <td className={tableStyle}>
                    {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}