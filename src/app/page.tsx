import GameBoard from './components/GameBoard';

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-daily-game`,
    {
      cache: 'no-store',
    }
  );
  const { game } = await res.json();

  return (
    <div>
      <GameBoard game={game} />
    </div>
  );
}
