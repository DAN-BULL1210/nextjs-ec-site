'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/" className="text-indigo-600 hover:text-indigo-700">
        ← トップページへ戻る
      </Link>

      <h1 className="text-center text-2xl font-bold my-6">お問い合わせ</h1>

      {errorMessage && (
        <div className="w-full bg-red-100 text-red-800 p-3 text-center shadow-md rounded-sm mb-4">
          {errorMessage}
        </div>
      )}

      <div className="shadow-lg rounded-lg overflow-hidden bg-white p-6">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErrorMessage('');

            try {
              const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
              });

              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErrorMessage(data.error ?? 'お問い合わせの送信に失敗しました。');
                return;
              }

              router.push('/?submitted=1');
            } catch {
              setErrorMessage('送信に失敗しました。通信環境をご確認ください。');
            }
          }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">
              氏名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-700 font-semibold mb-1">
              お問い合わせ内容
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-sm font-semibold"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}