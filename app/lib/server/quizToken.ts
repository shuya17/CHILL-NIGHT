import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// 出題中のスポットIDを暗号化した「問題トークン」を作る/読む。
// ブラウザにはこのトークンだけを渡し、正解のスポットIDはサーバー側でしか分からないようにする。
// IVを毎回ランダムにするため、同じスポットでも毎回違う文字列になる（トークンとスポットの対応表を作れない）。

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

// 開発中のホットリロードで鍵が変わって出題中のトークンが無効にならないよう、globalThis に保持する
const globalForQuiz = globalThis as unknown as { quizDevSecret?: string };

function getKey(): Buffer {
  let secret = process.env.QUIZ_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("環境変数 QUIZ_SECRET が設定されていません");
    }
    // ローカル開発では未設定でも動くよう、プロセスごとのランダムな鍵を使う
    globalForQuiz.quizDevSecret ??= randomBytes(32).toString("hex");
    secret = globalForQuiz.quizDevSecret;
  }
  // 任意の長さの文字列から AES-256 用の32バイト鍵を作る
  return createHash("sha256").update(secret).digest();
}

export function createQuizToken(spotId: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(spotId, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

// 改ざん・不正なトークンの場合は null を返す
export function readQuizToken(token: string): string | null {
  try {
    const data = Buffer.from(token, "base64url");
    if (data.length <= IV_LENGTH + TAG_LENGTH) return null;
    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return null;
  }
}
