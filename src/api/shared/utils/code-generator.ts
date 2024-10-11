export function generateRandomNumber(n: number): number {
  if (n < 1) {
    throw new Error("Sonning xonasi 1 dan katta bo'lishi kerak.");
  }

  const firstDigit = Math.floor(Math.random() * 9) + 1;

  const otherDigits = Array.from({ length: n - 1 }, () =>
    Math.floor(Math.random() * 10),
  ).join('');

  const randomNumber = parseInt(firstDigit + otherDigits, 10);

  return randomNumber;
}
