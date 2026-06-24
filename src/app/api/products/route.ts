import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import { executeQuery } from '@/lib/db'; // DB共通モジュール
import { type ProductData } from '@/types/product';

// 商品データの型定義
type Product = Omit<ProductData, 'description'>;

// 全商品のデータを取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
                              //URLオブジェクトはURL文字列を解析しここのデータを取り出せるようにする
    let page    = Number(searchParams.get('page')) || 1;       //クエリパラメータを取得する場合は
    let perPage = Number(searchParams.get('perPage')) || 16;      //searchParamsプロパティを使う
                //Number関数で数値変換し、クエリパラメータ(URLに付加される情報)からページ情報を取得
    
    page = Math.max(1,Math.min(page, 1000));    //取得した数値に対して最小値と最大値の範囲チェック
    perPage =Math.max(1,Math.min(perPage, 100));//page番号は1000件、表示件数は100

    //オフセット(スキップする件数）を計算　offset = (page(今のページ) - 1) × perPage(表示件数）;　 
    const offset = (page - 1) * perPage;

    const sort = searchParams.get('sort') ?? 'new';

    let order = '';
    switch (sort) {
      case'priceAce':// 価格が安い順
        order = 'ORDER BY price ASC';
        break;
      case 'new'://　新着順
      default:
        order = 'ORDER BY created_at DESC';
        break;
    }
    //クエリパラメータから検索ワードを取得
    const keyword = searchParams.get('keyword')?.trim() || '';
    //WHERE句のベースを構築
    const where = keyword
      ? 'WHERE (name LIKE ? OR description LIKE ?)'
      : '';
    //WHERE句に指定するパラメータを構築
    const whereParams = keyword
        ? [`%${keyword}%` , `%${keyword}%`]
        : [];
      //SQL文に埋め込むパラメータを構築
    const productsParams = [...whereParams, perPage, offset];
    const countParams = [...whereParams];

    const [products, totalItemsResult] = await Promise.all([//←複数のデータベース処理をしている
      //現在のWebページに表示する商品データだけを取得
      //SQLのSELECT文にこれらを指定することで、 現在のページに必要な商品データだけを取得 
      //１つ目のDB処理
      executeQuery<Product[]>(`
        SELECT *
        FROM products
        ${where}
        ${order}
        LIMIT ?
        OFFSET ?
        ;`, productsParams
      ),//LIMIT句で何件取得するかOFFSET句で何件スキップするかORDER BY句で並べ替え順序を指定


      //テーブルの全件数を数える COUNT(*) を使い、商品データの全件数を取得
      //２つ目のDB処理
      executeQuery<{ count: number }>(`
        SELECT COUNT(*) AS count
        FROM products
        ${where}
      ;`, countParams )//COUNT*の結果は１件のオブジェクトで返ってくる　[{ count: 120 }]
    ]);
    //  全件数を扱いやすい変数に取得
    const totalItems = totalItemsResult[0].count;

    //総ページ数を計算　Math.ceilメソッドで切り上げ
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    //取得した商品データとページネーション情報を返す
    return NextResponse.json({
      products,//現在のページの商品データ
      pagination: { currentPage: page, perPage, totalItems, totalPages },
    }); //currentPage:現在のぺ－ジ、perPage:1ページの表示件数、totalItems:全件数、totalPages:総ページ数
  } catch (err) {
    console.error('商品取得エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
// 商品データを新規登録
export async function POST(request: NextRequest) {
  try {
    // 画像ファイルを含むフォームデータを取得
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() || '';
    const file = formData.get('imageFile') as File;
    const description = formData.get('description')?.toString().trim() || '商品の説明がありません。';
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const isFeatured = formData.get('isFeatured') === 'on';

    // 入力値のバリデーション
    if (!name?.trim() || !file || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ message: '必須項目が不足しています。' }, { status: 400 });
    }

    // 拡張子を安全に取得
    const ext = file.name.split('.').pop();
    if (!ext || !['jpg', 'jpeg', 'png'].includes(ext.toLowerCase())) {
      return NextResponse.json({ message: '対応していないファイル形式です。' }, { status: 400 });
    }

    // 重複しないファイル名を生成
    const timestamp = Date.now(); // 現在の日付
    const random = Math.floor(Math.random() * 10000); // 0～9999の乱数
    const fileName = `${timestamp}_${random}.${ext}`; // ファイル名を構築

    // 保存先のファイルパスを構築
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);

    // ファイルを保存
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 商品情報をproductsテーブルに追加
    await executeQuery(`
      INSERT INTO products (name, image_url, description, price, stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?);
    `, [name, fileName, description, price, stock, isFeatured ? 1 : 0]);

    return NextResponse.json({ message: '商品を登録しました。' }, { status: 201 });
  } catch (err) {
    console.error('商品登録エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}