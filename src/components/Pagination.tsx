'use client';

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

//ページネーション共通コンポーネントに渡すデータ(props)の型定義
//PaginationコンポーネントにはcurrentPageとtotalPageの二つが必要
interface PaginationProps {
  currentPage: number;//現在のページ番号
  totalPages: number;//総ページ数
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  //以下、クライアントコンポーネントで使用できるNext.js固有フック
  const router = useRouter();             //ルーティング機能を使ってプログラム内でページURL変更、ページ遷移したりできる
  const searchParams = useSearchParams();//現在のURLに含まれるクエリパラメータを取得・操作するためのフック
                                        //?page=1のようなURLからpageの値を取得できる

  //ページ切り替え用のイベントハンドラ　handlePageChange()関数で ボタンやリンクがクリックされたときにページ切り替える
  const handlePageChange = (newPage: number) => {//新しいページ番号（newPage）を引数として受け取る
    //現在のクエリパラメータを文字列で取得
    const params = new URLSearchParams(searchParams.toString());//URL操作用のオブジェクト
    //クエリパラメータのページ番号(page)を更新
      params.set('page', String(newPage));//次に、URLのページ番号（page）を、目的のページ番号であるnewPageに差し替え
      //URLを更新し、リロードなしで遷移
      router.push(`?${params.toString()}`);//ここで指定したパラメータに遷移
  };

  //ページネーション系ボタンの共通スタイルを定義
  const baseClasses = 'min-w-9 h-9 rounded border border-gray-300 mx-1 cursor-pointer';
  //↑ボタンの基本スタイル
  const hover = 'hover:bg-gray-100 hover:text-gray-800';
  //↑ボタンにカーソルが重なった時のスタイル
  const active = 'bg-indigo-500 text-white border-indigo-500';
 //↑現在表示されているボタンのスタイル
  const disabled = 'opacity-50';
//↑ボタンが無効状態の時のスタイル
//特定のコンポーネント全体に適用したいスタイルは、そのコンポーネント内で事前に定義しておくと便利です。
  return (
    <nav className="flex justify-center items-center mt-8" aria-label="ページネーション">
      {/* 前へ (<) */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseClasses} text-gray-700 ${hover} ${currentPage === 1 ? disabled : ''}`}
      >
        &lt;
      </button>

      {/* 各ページ番号 */}
      {Array.from({ length: totalPages }, (_, i) => {
        //ページ番号は１から始まるため、配列のインデックス(0始まり)に１加算
        const page = i + 1;
        // 現在のページ番号に一致するページだけをアクティブに
        const isActive = (page === currentPage);
        return (
          <button key={page} onClick={() => handlePageChange(page)} disabled={isActive}
            className={`${baseClasses} ${isActive ? active : 'text-gray-700 ' + hover}`}
          >
            {page}
          </button>
        );
      })}

      {/* 次へ(>) */}
      <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`${baseClasses} text-gray-700 ${hover} ${currentPage === totalPages ? disabled : ''}`}
      >
        &gt;
      </button>
    </nav>
  );
}
