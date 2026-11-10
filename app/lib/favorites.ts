// localStorageに保存するときに使用するキー
const FAVORITES_KEY = "chill-night-favorites";

// お気に入り一覧を取得する
export function getFavorites(): string[] {
  // サーバー側ではlocalStorageを使用できないため、空配列を返す
  if (typeof window === "undefined") {
    return [];
  }

  const favorites = localStorage.getItem(FAVORITES_KEY);

  // まだお気に入りが保存されていない場合
  if (favorites === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(favorites);

    // 保存データが文字列の配列であることを確認
    if (
      Array.isArray(parsed) &&
      parsed.every((id) => typeof id === "string")
    ) {
      return parsed;
    }

    return [];
  } catch {
    // JSONの形式が壊れている場合
    return [];
  }
}

// お気に入りに追加・解除する
export function toggleFavorite(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const favorites = getFavorites();

  if (favorites.includes(id)) {
    // すでに登録されている場合は解除
    const updatedFavorites = favorites.filter(
      (favoriteId) => favoriteId !== id
    );

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } else {
    // 登録されていない場合は追加
    favorites.push(id);

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  }
}

// 指定したスポットがお気に入りか判定する
export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

/**
 * 使用例（ブラウザ側で呼び出す）
 *
 * toggleFavorite("hakodateyama"); // 函館山をお気に入りに追加
 * isFavorite("hakodateyama");     // true（お気に入りならtrue）
 * getFavorites();                 // ["hakodateyama"]
 *
 * toggleFavorite("hakodateyama"); // 函館山をお気に入りから解除
 * getFavorites();                 // []
 */