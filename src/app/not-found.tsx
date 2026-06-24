import Link from "next/link";
import { type Metadata } from 'next';

//Webページのメタデータを定義（head要素）
export const metadata: Metadata = {
  title: '404：ページが見つかりません'
};

//404
export default function notFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1>404：ページが見つかりません</h1>
      <p className="text-gray-600 mb-6">
        URLが間違っているか、ページが移動または削除された可能性があります。
      </p>
      <Link href="/" className="text-indigo-600 hover:underline">
        ホームに戻る
      </Link>
    </main>
  )
}